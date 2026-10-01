import { getHistory, getOrCreateConversation, markEventProcessed, saveMessage } from "./conversations";
import { debug, trace } from "./log";
import { buildReply, UNSUPPORTED_TYPE_REPLY } from "./reply";
import { extractMessages, type IncomingMessage } from "./whatsapp/parse";
import { sendText } from "./whatsapp/send";

/**
 * Runs after the webhook has returned 200. Meta won't retry from here, so a
 * failure is logged and that message gets no reply (the inbound is already saved).
 */
export async function processIncoming(payload: unknown): Promise<void> {
  const incoming = extractMessages(payload);
  if (incoming.length === 0) {
    debug("no user messages in payload (status update or unknown shape), nothing to do");
    return;
  }
  debug(`business logic: ${incoming.length} message(s) to process`);
  for (const message of incoming) {
    debug(`message parsed wamid=${message.waMessageId}`, { ...message, raw: undefined });
    try {
      await handleMessage(message);
    } catch (error) {
      console.error(`[bot] processing failed wamid=${message.waMessageId}`, error);
    }
  }
}

async function handleMessage(message: IncomingMessage): Promise<void> {
  const wamid = message.waMessageId;
  const step = trace(wamid);
  step(`business logic: start (type=${message.type})`);

  step("db: checking webhook_events for duplicates");
  if (!(await markEventProcessed(wamid))) {
    console.info(`[bot] duplicate skipped wamid=${wamid}`);
    return;
  }

  step("db: finding or creating conversation");
  const conversation = await getOrCreateConversation(message.from, message.displayName);
  step(`db: conversation ${conversation.id} (mode=${conversation.mode})`);

  // Save before anything else can fail.
  step("db: saving inbound message");
  await saveMessage({
    conversationId: conversation.id,
    author: "user",
    waMessageId: wamid,
    type: message.type,
    content: message.text,
    raw: message.raw,
  });

  if (conversation.mode === "human") {
    console.info(`[bot] human mode, no reply wamid=${wamid}`);
    return;
  }

  let reply = UNSUPPORTED_TYPE_REPLY;
  if (message.type === "text") {
    step("db: loading conversation history");
    const history = await getHistory(conversation.id);
    debug(`LLM input wamid=${wamid} (${history.length} messages)`, history);
    step("llm: sending history to the model");
    reply = await buildReply(history);
    step("llm: reply received");
    debug(`LLM output wamid=${wamid}`, reply);
  } else {
    step("non-text message: using fixed reply, LLM skipped");
  }
  if (!reply) {
    console.warn(`[bot] empty reply wamid=${wamid}`);
    return;
  }

  step("whatsapp: sending reply via Cloud API");
  const outboundId = await sendText(message.from, reply);
  step(`whatsapp: sent (out=${outboundId})`);

  step("db: saving outbound message");
  await saveMessage({
    conversationId: conversation.id,
    author: "bot",
    waMessageId: outboundId,
    type: "text",
    content: reply,
  });
  step("business logic: done");
  console.info(`[bot] replied wamid=${wamid} out=${outboundId}`);
}
