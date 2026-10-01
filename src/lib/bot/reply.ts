import { createOpenAI } from "@ai-sdk/openai";
import { generateText, type ModelMessage } from "ai";
import { getEnv } from "@/lib/env";
import { systemPrompt } from "./prompt";

export const UNSUPPORTED_TYPE_REPLY = "Por ahora solo puedo leer mensajes de texto.";

/**
 * Reply strategy: the only swap point for reply logic. Switching provider
 * (e.g. to Claude) means changing the model factory below and env.ts.
 */
export async function buildReply(history: ModelMessage[]): Promise<string> {
  const env = getEnv();
  const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
  const { text } = await generateText({
    model: openai(env.LLM_MODEL),
    instructions: systemPrompt,
    messages: history,
    maxRetries: 1,
    timeout: 45_000,
  });
  return text.trim();
}
