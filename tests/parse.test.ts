import { describe, expect, it } from "vitest";
import { extractMessages } from "@/lib/bot/whatsapp/parse";
import { normalizeRecipient } from "@/lib/bot/whatsapp/send";
import audio from "./fixtures/whatsapp/audio.json";
import status from "./fixtures/whatsapp/status.json";
import text from "./fixtures/whatsapp/text.json";

describe("extractMessages", () => {
  it("extracts a text message with sender and display name", () => {
    expect(extractMessages(text)).toEqual([
      expect.objectContaining({
        waMessageId: "wamid.TEST_TEXT_0001",
        from: "5215500000000",
        displayName: "Cliente Prueba",
        type: "text",
        text: "Hola, ¿qué hacen?",
      }),
    ]);
  });

  it("returns non-text messages with null text", () => {
    const [message] = extractMessages(audio);
    expect(message.type).toBe("audio");
    expect(message.text).toBeNull();
  });

  it("ignores status-only payloads", () => {
    expect(extractMessages(status)).toEqual([]);
  });

  it("tolerates unknown fields and garbage input", () => {
    const withExtra = structuredClone(text) as Record<string, unknown>;
    withExtra.somethingNew = { nested: true };
    expect(extractMessages(withExtra)).toHaveLength(1);
    expect(extractMessages(null)).toEqual([]);
    expect(extractMessages({ entry: "nope" })).toEqual([]);
  });
});

describe("normalizeRecipient", () => {
  it("drops the 1 from Mexican 521 numbers", () => {
    expect(normalizeRecipient("5215512345678")).toBe("525512345678");
  });

  it("leaves other numbers untouched", () => {
    expect(normalizeRecipient("525512345678")).toBe("525512345678");
    expect(normalizeRecipient("14155550100")).toBe("14155550100");
  });
});
