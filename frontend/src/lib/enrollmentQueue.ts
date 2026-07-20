// Best-effort delivery net for Program Enrollment submissions. The visitor
// must never be blocked or shown an error by a backend hiccup - WhatsApp
// always opens regardless - but we shouldn't silently lose the lead either.
// Failed submissions are queued here and retried once on the next page load.

import { submitProgramEnrollment, type CreateProgramEnrollmentPayload } from '@/api/programEnrollments';

const QUEUE_KEY = 'primAI_pendingEnrollments';

function readQueue(): CreateProgramEnrollmentPayload[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as CreateProgramEnrollmentPayload[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: CreateProgramEnrollmentPayload[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable/full - nothing more we can do locally
  }
}

/** Queues a failed submission for retry and logs it visibly for the admin
 *  (browser console) - this never surfaces to the visitor. */
export function queueFailedEnrollment(payload: CreateProgramEnrollmentPayload): void {
  writeQueue([...readQueue(), payload]);
  // eslint-disable-next-line no-console
  console.error('[program-enrollment] backend capture failed - queued for retry on next visit', payload);
}

/** Best-effort flush of previously-failed submissions. Call once per page
 *  mount. Entries that fail again stay queued for the next attempt. */
export async function flushQueuedEnrollments(): Promise<void> {
  const queue = readQueue();
  if (queue.length === 0) return;
  const remaining: CreateProgramEnrollmentPayload[] = [];
  for (const payload of queue) {
    try {
      await submitProgramEnrollment(payload);
    } catch {
      remaining.push(payload);
    }
  }
  writeQueue(remaining);
}
