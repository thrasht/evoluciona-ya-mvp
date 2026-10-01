import { beforeEach, describe, expect, it, vi } from "vitest";

const ai = vi.hoisted(() => ({ generateText: vi.fn() }));

vi.mock("ai", () => ai);
vi.mock("@/lib/env", () => ({ getEnv: () => ({ OPENAI_API_KEY: "test", LLM_MODEL: "test-model" }) }));

const { buildReply } = await import("@/lib/bot/reply");
const history = [{ role: "user" as const, content: "Hola" }];

beforeEach(() => vi.resetAllMocks());

describe("buildReply", () => {
  it("returns the trimmed text when the model finishes normally", async () => {
    ai.generateText.mockResolvedValue({ text: "  ¡Hola!  ", finishReason: "stop" });
    expect(await buildReply(history)).toEqual({ ok: true, text: "¡Hola!" });
  });

  it("fails on empty text", async () => {
    ai.generateText.mockResolvedValue({ text: "   ", finishReason: "stop" });
    expect(await buildReply(history)).toEqual({ ok: false, reason: "empty text" });
  });

  it("fails when the answer was cut or filtered", async () => {
    ai.generateText.mockResolvedValue({ text: "Respuesta a medi", finishReason: "length" });
    expect(await buildReply(history)).toEqual({ ok: false, reason: "finishReason=length" });
  });

  it("fails instead of throwing when the provider errors", async () => {
    ai.generateText.mockRejectedValue(new Error("timeout"));
    expect(await buildReply(history)).toEqual({ ok: false, reason: "timeout" });
  });
});
