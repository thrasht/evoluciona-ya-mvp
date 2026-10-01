/**
 * Verbose input/output logging for local development only: payloads contain
 * phone numbers and message text, so they never reach production logs.
 */
const verbose = process.env.NODE_ENV === "development";

export function debug(label: string, data?: unknown): void {
  if (!verbose) return;
  if (data === undefined) {
    console.log(`[bot] ${label}`);
    return;
  }
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  console.log(`[bot] ${label}\n${text}`);
}

/**
 * Step-by-step trace for one request or message, with elapsed time since it started:
 *   const step = trace("wamid.X"); step("db: saving inbound message");
 *   → [bot] [wamid.X] +12ms db: saving inbound message
 */
export function trace(scope: string): (step: string) => void {
  const start = Date.now();
  return (step) => {
    if (verbose) console.log(`[bot] [${scope}] +${Date.now() - start}ms ${step}`);
  };
}
