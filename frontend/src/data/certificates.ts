// Certificate-generation helpers - localStorage only, no backend.
// primAI_tutorialUser  -> { name, mobile? } captured once (lead form or cert name-gate)
// primAI_certificates  -> { [tutorialId]: { certificateId, issuedAt } } stable cert IDs

const USER_KEY = 'primAI_tutorialUser';
const CERT_KEY = 'primAI_certificates';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export interface StoredTutorialUser {
  name: string;
  mobile?: string;
}

export function getStoredTutorialUser(): StoredTutorialUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredTutorialUser;
    return parsed.name ? parsed : null;
  } catch {
    return null;
  }
}

/** Persists the learner's name (and mobile, if known) for certificate auto-fill. */
export function setStoredTutorialUser(name: string, mobile?: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  const existing = getStoredTutorialUser();
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({ name: trimmed, mobile: mobile ?? existing?.mobile }),
  );
}

/** "23 June 2026" - locale-independent so it matches across browsers. */
export function formatCertDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Derives a 4-letter tool code from the tutorial's display name, e.g. "ChatGPT" -> "CHAT". */
function deriveToolCode(tutorialName: string): string {
  const letters = tutorialName.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!letters) return 'TOOL';
  return (letters + 'XXXX').slice(0, 4);
}

interface CertRegistryEntry {
  certificateId: string;
  issuedAt: string;
}
type CertRegistry = Record<string, CertRegistryEntry>;

function loadRegistry(): CertRegistry {
  try {
    const raw = localStorage.getItem(CERT_KEY);
    return raw ? (JSON.parse(raw) as CertRegistry) : {};
  } catch {
    return {};
  }
}

function saveRegistry(reg: CertRegistry): void {
  localStorage.setItem(CERT_KEY, JSON.stringify(reg));
}

/**
 * Returns a stable certificate ID for tutorialId, format PRIM-{TOOLCODE}-{YEAR}-{seq}.
 * Generated once on first call and reused on every subsequent call (re-downloads match).
 */
export function getOrCreateCertificateId(tutorialId: string, tutorialName: string): string {
  const registry = loadRegistry();
  const existing = registry[tutorialId];
  if (existing) return existing.certificateId;

  const toolCode = deriveToolCode(tutorialName);
  const year = new Date().getFullYear();
  const prefix = `PRIM-${toolCode}-${year}-`;
  const seq = Object.values(registry).filter((e) => e.certificateId.startsWith(prefix)).length + 1;
  const certificateId = `${prefix}${String(seq).padStart(4, '0')}`;

  registry[tutorialId] = { certificateId, issuedAt: new Date().toISOString() };
  saveRegistry(registry);
  return certificateId;
}
