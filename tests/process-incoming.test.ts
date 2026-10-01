import { beforeEach, describe, expect, it, vi } from "vitest";
import audio from "./fixtures/whatsapp/audio.json";
import text from "./fixtures/whatsapp/text.json";

const conversations = vi.hoisted(() => ({
  markEventProcessed: vi.fn(),
  getOrCreateConversation: vi.fn(),
  saveMessage: vi.fn(),
  getHistory: vi.fn(),
  switchToHuman: vi.fn(),
}));
const reply = vi.hoisted(() => ({ buildReply: vi.fn() }));
const send = vi.hoisted(() => ({ sendText: vi.fn() }));

const FALLBACK = "En este momento no puedo generar una respuesta.";
const UNSUPPORTED = "Por ahora solo puedo leer mensajes de texto.";

vi.mock("@/lib/bot/conversations", () => conversations);
vi.mock("@/lib/bot/reply", () => ({ ...reply, UNSUPPORTED_TYPE_REPLY: UNSUPPORTED, FALLBACK_REPLY: FALLBACK }));
vi.mock("@/lib/bot/whatsapp/send", () => send);

const { processIncoming } = await import("@/lib/bot/process-incoming");

function conversation(mode: "bot" | "human") {
  return { id: "conv-1", waPhone: "5215500000000", mode };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  conversations.markEventProcessed.mockResolvedValue(true);
  conversations.getOrCreateConversation.mockResolvedValue(conversation("bot"));
  conversations.getHistory.mockResolvedValue([{ role: "user", content: "Hola, ¿qué hacen?" }]);
  reply.buildReply.mockResolvedValue({ ok: true, text: "¡Hola! Te ayudamos a implementar IA." });
  send.sendText.mockResolvedValue("wamid.OUT_1");
});

describe("processIncoming", () => {
  it("saves the inbound message, replies to the sender with the LLM and saves the reply", async () => {
    await processIncoming(text);

    expect(conversations.saveMessage).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ author: "user", waMessageId: "wamid.TEST_TEXT_0001", content: "Hola, ¿qué hacen?" }),
    );
    expect(send.sendText).toHaveBeenCalledWith("5215500000000", "¡Hola! Te ayudamos a implementar IA.");
    expect(conversations.saveMessage).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ author: "bot", waMessageId: "wamid.OUT_1" }),
    );
    expect(conversations.switchToHuman).not.toHaveBeenCalled();
  });

  it("skips a wa_message_id that was already processed", async () => {
    conversations.markEventProcessed.mockResolvedValue(false);
    await processIncoming(text);

    expect(conversations.saveMessage).not.toHaveBeenCalled();
    expect(send.sendText).not.toHaveBeenCalled();
  });

  it("saves the inbound message and sends nothing in human mode", async () => {
    conversations.getOrCreateConversation.mockResolvedValue(conversation("human"));
    await processIncoming(text);

    expect(conversations.saveMessage).toHaveBeenCalledTimes(1);
    expect(reply.buildReply).not.toHaveBeenCalled();
    expect(send.sendText).not.toHaveBeenCalled();
  });

  it("answers non-text messages with the fixed text, without calling the LLM", async () => {
    await processIncoming(audio);

    expect(reply.buildReply).not.toHaveBeenCalled();
    expect(send.sendText).toHaveBeenCalledWith("5215500000000", UNSUPPORTED);
  });

  it("sends the fallback and hands off to a human when the LLM fails", async () => {
    reply.buildReply.mockResolvedValue({ ok: false, reason: "timeout" });
    await processIncoming(text);

    expect(conversations.switchToHuman).toHaveBeenCalledWith("conv-1", "llm_failure: timeout");
    expect(send.sendText).toHaveBeenCalledWith("5215500000000", FALLBACK);
    expect(conversations.saveMessage).toHaveBeenNthCalledWith(2, expect.objectContaining({ author: "bot", content: FALLBACK }));
  });

  it("keeps processing the batch when one message fails", async () => {
    const batch = structuredClone(text);
    const second = { ...batch.entry[0].changes[0].value.messages[0], id: "wamid.TEST_TEXT_0002" };
    batch.entry[0].changes[0].value.messages.push(second);
    send.sendText.mockRejectedValueOnce(new Error("Cloud API 401"));

    await processIncoming(batch);

    expect(send.sendText).toHaveBeenCalledTimes(2);
    expect(conversations.saveMessage).toHaveBeenCalledWith(expect.objectContaining({ author: "bot", waMessageId: "wamid.OUT_1" }));
  });
});
