import { createOpenAI } from "@ai-sdk/openai";
import { generateText, type ModelMessage } from "ai";
import { site } from "@/config/site";
import { getEnv } from "@/lib/env";
import { systemPrompt } from "./prompt";

export const UNSUPPORTED_TYPE_REPLY = "Por ahora solo puedo leer mensajes de texto.";

/** Sent when the LLM can't produce a usable answer; the conversation is handed to a human. */
export const FALLBACK_REPLY = `En este momento no puedo generar una respuesta. Una persona de ${site.name} te atenderá en breve por este mismo chat.`;

export type ReplyResult = { ok: true; text: string } | { ok: false; reason: string };

/**
 * Reply strategy: the only swap point for reply logic. Switching provider
 * (e.g. to Claude) means changing the model factory below and env.ts.
 * Never throws: any failure or unusable answer comes back as `ok: false`.
 */
export async function buildReply(history: ModelMessage[]): Promise<ReplyResult> {
  try {
    const env = getEnv();
    const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
    const { text, finishReason } = await generateText({
      model: openai(env.LLM_MODEL),
      instructions: systemPrompt,
      messages: history,
      maxRetries: 1,
      timeout: 45_000,
    });
    const reply = text.trim();
    if (finishReason !== "stop") return { ok: false, reason: `finishReason=${finishReason}` };
    if (!reply) return { ok: false, reason: "empty text" };
    return { ok: true, text: reply };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}
