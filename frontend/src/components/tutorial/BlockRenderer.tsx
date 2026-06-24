import React, { useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import type {
  ContentBlock,
  HeadingBlock,
  ParagraphBlock,
  RichTextBlock,
  ImageBlock,
  VideoBlock,
  HighlightBoxBlock,
  PromptBlock,
  TableBlock,
  CodeBlock,
  CalloutBlock,
  CalloutVariant,
  ComparisonBlock,
  ChecklistBlock,
  DownloadBlock,
  QuizBlock,
  FaqBlock,
  AiToolCardBlock,
} from '@/types';

// ── Rich-text heading helpers ─────────────────────────────────────────────────
// Both functions use the same traversal order so injected IDs always match the
// IDs the TOC reads. Format: rt-<blockId>-<0-based-index>.

/** Returns every h2/h3 heading found inside a richText block's HTML. */
export function extractRichTextHeadings(
  blockId: string,
  html: string,
): { id: string; level: 2 | 3; text: string }[] {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const result: { id: string; level: 2 | 3; text: string }[] = [];
  let idx = 0;
  doc.querySelectorAll('h2, h3').forEach((el) => {
    result.push({
      id: `rt-${blockId}-${idx++}`,
      level: el.tagName === 'H2' ? 2 : 3,
      text: el.textContent?.trim() ?? '',
    });
  });
  return result;
}

/** Sanitizes and injects scroll-anchor ids into h2/h3 elements so scroll-spy works. */
function processRichTextHtml(blockId: string, raw: string): string {
  const clean = DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      'p', 'h2', 'h3', 'strong', 'em', 'u', 's', 'a',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr', 'br', 'span',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'id', 'class', 'style'],
  });
  const doc = new DOMParser().parseFromString(`<div>${clean}</div>`, 'text/html');
  let idx = 0;
  doc.querySelectorAll('h2, h3').forEach((el) => {
    el.id = `rt-${blockId}-${idx++}`;
  });
  return doc.querySelector('div')!.innerHTML;
}

export function BlockRenderer({
  block,
  onQuizPass,
}: {
  block: ContentBlock;
  onQuizPass?: (blockId: string) => void;
}) {
  switch (block.type) {
    case 'heading':     return <RHeading block={block} />;
    case 'paragraph':   return <RParagraph block={block} />;
    case 'richText':    return <RRichText block={block} />;
    case 'image':       return <RImage block={block} />;
    case 'video':       return <RVideo block={block} />;
    case 'highlightBox': return <RHighlightBox block={block} />;
    case 'prompt':      return <RPrompt block={block} />;
    case 'table':       return <RTable block={block} />;
    case 'code':        return <RCode block={block} />;
    case 'callout':     return <RCallout block={block} />;
    case 'comparison':  return <RComparison block={block} />;
    case 'checklist':   return <RChecklist block={block} />;
    case 'download':    return <RDownload block={block} />;
    case 'quiz':        return <RQuiz block={block} onQuizPass={onQuizPass} />;
    case 'faq':         return <RFaq block={block} />;
    case 'aiToolCard':  return <RAiToolCard block={block} />;
    case 'divider':     return <RDivider />;
    default:            return null;
  }
}

// ── Heading ───────────────────────────────────────────────────────────────────

function RHeading({ block }: { block: HeadingBlock }) {
  const id = `heading-${block.id}`;
  const sizeClass =
    block.level === 1 ? 'text-2xl md:text-3xl' :
    block.level === 2 ? 'text-xl md:text-2xl' : 'text-lg';
  const Tag = `h${block.level}` as 'h1' | 'h2' | 'h3';
  return (
    <Tag
      id={id}
      className={`${sizeClass} font-bold`}
      style={{ color: 'var(--white)', fontFamily: 'Montserrat, var(--font-head)', scrollMarginTop: 80 }}
    >
      {block.text}
    </Tag>
  );
}

// ── Paragraph ─────────────────────────────────────────────────────────────────

function RParagraph({ block }: { block: ParagraphBlock }) {
  return (
    <div
      className="leading-relaxed text-base"
      style={{ color: 'var(--muted)', lineHeight: 1.75 }}
      // Content authored in admin (not from public user input)
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  );
}

// ── Rich Text ─────────────────────────────────────────────────────────────────

function RRichText({ block }: { block: RichTextBlock }) {
  const processed = useMemo(
    () => processRichTextHtml(block.id, block.html),
    [block.id, block.html],
  );
  return (
    <div
      className="rt-block"
      // Sanitized by DOMPurify inside processRichTextHtml; headings have stable
      // scroll-anchor ids injected for TOC scroll-spy.
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
}

// ── Image ─────────────────────────────────────────────────────────────────────

function RImage({ block }: { block: ImageBlock }) {
  return (
    <figure className="my-2">
      <img
        src={block.src}
        alt={block.alt}
        className="w-full rounded-xl"
        style={{ border: '1px solid var(--border)' }}
      />
      {block.caption && (
        <figcaption className="text-center text-xs mt-2" style={{ color: 'var(--muted)' }}>
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

// ── Video ─────────────────────────────────────────────────────────────────────

function RVideo({ block }: { block: VideoBlock }) {
  const getEmbed = (url: string) => {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    const ytShorts = url.match(/youtube\.com\/shorts\/([^&?/]+)/);
    if (ytShorts) return `https://www.youtube.com/embed/${ytShorts[1]}`;
    const vm = url.match(/vimeo\.com\/(\d+)/);
    if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
    const gd = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (gd) return `https://drive.google.com/file/d/${gd[1]}/preview`;
    return url;
  };
  return (
    <figure>
      <div
        className="relative w-full rounded-xl overflow-hidden"
        style={{ paddingBottom: '56.25%', border: '1px solid var(--border)' }}
      >
        <iframe
          src={getEmbed(block.url)}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          title={block.caption ?? 'Video'}
        />
      </div>
      {block.caption && (
        <figcaption className="text-center text-xs mt-2" style={{ color: 'var(--muted)' }}>
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

// ── Highlight Box ─────────────────────────────────────────────────────────────

function RHighlightBox({ block }: { block: HighlightBoxBlock }) {
  return (
    <div
      className="rounded-r-xl"
      style={{
        background: 'rgba(4,12,28,0.9)',
        borderLeft: '4px solid var(--electric)',
        borderTop: '1px solid rgba(0,212,255,0.15)',
        borderRight: '1px solid rgba(0,212,255,0.15)',
        borderBottom: '1px solid rgba(0,212,255,0.15)',
      }}
    >
      <div className="flex items-start gap-4 p-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}
        >
          {block.icon}
        </div>
        <div>
          <div
            className="font-bold text-sm mb-1.5"
            style={{ color: 'var(--white)', fontFamily: 'Montserrat, sans-serif' }}
          >
            {block.title}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            {block.content}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Prompt Block ──────────────────────────────────────────────────────────────

const TOOL_LABELS: Record<string, string> = {
  chatgpt: 'Try in ChatGPT',
  gemini: 'Try in Gemini',
  claude: 'Try in Claude',
};

const TOOL_URLS: Record<string, string> = {
  chatgpt: 'https://chat.openai.com/',
  gemini: 'https://gemini.google.com/',
  claude: 'https://claude.ai/',
};

function RPrompt({ block }: { block: PromptBlock }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(block.promptText).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tryUrl = block.tryInTool !== 'none' ? TOOL_URLS[block.tryInTool] : null;
  const tryLabel = block.tryInTool !== 'none' ? TOOL_LABELS[block.tryInTool] : '';

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,212,255,0.2)' }}
    >
      {/* Toolbar header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2.5">
          <span style={{ color: 'var(--electric)' }}>⌨</span>
          <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
            {block.label}
          </span>
        </div>
        <div className="flex gap-1.5">
          {['#ff6059', '#ffbd2e', '#28c941'].map((c) => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
      </div>

      {/* Prompt text */}
      <div className="p-5">
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'rgba(138,235,255,0.85)', fontFamily: 'monospace' }}
        >
          {block.promptText}
        </p>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-end gap-3 px-4 py-2.5"
        style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid var(--border)' }}
      >
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: copied ? 'var(--electric)' : 'var(--muted)' }}
        >
          {copied ? '✓' : '⎘'} {copied ? 'Copied!' : 'Copy Prompt'}
        </button>
        {tryUrl && (
          <a
            href={tryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-lg font-bold"
            style={{ background: 'var(--electric)', color: 'var(--navy)' }}
          >
            {tryLabel}
          </a>
        )}
      </div>
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────

function RTable({ block }: { block: TableBlock }) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'rgba(0,212,255,0.06)', borderBottom: '1px solid var(--border)' }}>
            {block.headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--electric)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: ri < block.rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3" style={{ color: 'var(--white)' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Code Block ────────────────────────────────────────────────────────────────

function RCode({ block }: { block: CodeBlock }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(block.code).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)' }}>
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{block.language}</span>
        <button onClick={copy} className="text-xs" style={{ color: copied ? 'var(--electric)' : 'var(--muted)' }}>
          {copied ? '✓ Copied' : '⎘ Copy'}
        </button>
      </div>
      <pre className="p-5 overflow-x-auto text-sm leading-relaxed" style={{ color: 'rgba(138,235,255,0.85)', fontFamily: 'monospace' }}>
        <code>{block.code}</code>
      </pre>
      {block.caption && (
        <div className="px-4 py-2 text-xs" style={{ color: 'var(--muted)', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)' }}>
          {block.caption}
        </div>
      )}
    </div>
  );
}

// ── Callout ───────────────────────────────────────────────────────────────────

const CALLOUT_PROPS: Record<CalloutVariant, { bg: string; border: string; icon: string; titleColor: string }> = {
  info:    { bg: 'rgba(0,212,255,0.06)',  border: 'rgba(0,212,255,0.25)',  icon: 'ℹ️',  titleColor: 'var(--electric)' },
  success: { bg: 'rgba(52,211,153,0.06)', border: 'rgba(52,211,153,0.25)', icon: '✅', titleColor: '#34d399' },
  warning: { bg: 'rgba(251,191,36,0.06)', border: 'rgba(251,191,36,0.25)', icon: '⚠️', titleColor: '#FBBF24' },
  error:   { bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.25)',  icon: '❌',  titleColor: '#ef4444' },
};

function RCallout({ block }: { block: CalloutBlock }) {
  const p = CALLOUT_PROPS[block.variant];
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: p.bg, border: `1px solid ${p.border}` }}>
      <span className="text-xl shrink-0 mt-0.5">{p.icon}</span>
      <div>
        {block.title && (
          <div className="font-bold text-sm mb-1" style={{ color: p.titleColor }}>{block.title}</div>
        )}
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{block.content}</p>
      </div>
    </div>
  );
}

// ── Comparison ────────────────────────────────────────────────────────────────

function RComparison({ block }: { block: ComparisonBlock }) {
  const cols = [
    { title: block.leftTitle, items: block.leftItems, color: '#ef4444', icon: '✕' },
    { title: block.rightTitle, items: block.rightItems, color: '#34d399', icon: '✓' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {cols.map((col) => (
        <div key={col.title} className="glass-card rounded-xl p-4">
          <div className="font-bold text-sm mb-3 pb-2" style={{ color: col.color, borderBottom: `1px solid ${col.color}33` }}>
            {col.title}
          </div>
          {col.items.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm mb-2">
              <span style={{ color: col.color, flexShrink: 0 }}>{col.icon}</span>
              <span style={{ color: 'var(--muted)' }}>{item}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Checklist ─────────────────────────────────────────────────────────────────

function RChecklist({ block }: { block: ChecklistBlock }) {
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(block.items.filter((i) => i.checked).map((i) => i.id)),
  );

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-2.5">
      {block.items.map((item) => {
        const done = checked.has(item.id);
        return (
          <button key={item.id} onClick={() => toggle(item.id)} className="flex items-center gap-3 text-left w-full">
            <div
              className="w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all"
              style={{ background: done ? 'var(--electric)' : 'transparent', borderColor: done ? 'var(--electric)' : 'var(--border)' }}
            >
              {done && <span className="text-[10px] font-bold" style={{ color: 'var(--navy)' }}>✓</span>}
            </div>
            <span
              className="text-sm"
              style={{ color: done ? 'var(--muted)' : 'var(--white)', textDecoration: done ? 'line-through' : 'none' }}
            >
              {item.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Download ──────────────────────────────────────────────────────────────────

function RDownload({ block }: { block: DownloadBlock }) {
  return (
    <a
      href={block.href}
      download
      className="flex items-center gap-4 glass-card rounded-xl p-4 transition-all group"
      style={{ textDecoration: 'none', border: '1px solid var(--border)' }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
        style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}
      >
        📥
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm" style={{ color: 'var(--white)' }}>{block.label}</div>
        {(block.fileType ?? block.size) && (
          <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            {[block.fileType, block.size].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>
      <span className="text-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--electric)' }}>↓</span>
    </a>
  );
}

// ── Quiz ──────────────────────────────────────────────────────────────────────

function RQuiz({
  block,
  onQuizPass,
}: {
  block: QuizBlock;
  onQuizPass?: (blockId: string) => void;
}) {
  const quizType = block.quizType ?? 'mcq';
  const passThreshold = block.passThreshold ?? 100;

  // Single-select state (mcq + truefalse)
  const [selected, setSelected] = useState<number | null>(null);
  // Multi-select state
  const [multiSelected, setMultiSelected] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [passed, setPassed] = useState(false);
  const [score, setScore] = useState(0);

  const toggleMulti = (i: number) => {
    if (submitted) return;
    setMultiSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleSubmit = () => {
    let s = 0;
    if (quizType === 'multiselect') {
      const correctSet = new Set(block.correctIndices ?? [block.correctIndex]);
      const selectedSet = multiSelected;
      const truePositives = [...selectedSet].filter((i) => correctSet.has(i)).length;
      s = correctSet.size > 0 ? Math.round((truePositives / correctSet.size) * 100) : 0;
      // Penalise false positives: subtract wrong selections
      const wrongSelected = [...selectedSet].filter((i) => !correctSet.has(i)).length;
      s = Math.max(0, s - wrongSelected * Math.round(100 / correctSet.size));
    } else {
      s = selected === block.correctIndex ? 100 : 0;
    }
    const didPass = s >= passThreshold;
    setScore(s);
    setPassed(didPass);
    setSubmitted(true);
    if (didPass) onQuizPass?.(block.id);
  };

  const handleRetry = () => {
    setSelected(null);
    setMultiSelected(new Set());
    setSubmitted(false);
    setPassed(false);
    setScore(0);
  };

  const canSubmit = quizType === 'multiselect' ? multiSelected.size > 0 : selected !== null;

  const correctSet = new Set(block.correctIndices ?? [block.correctIndex]);

  const getOptionStyle = (i: number): React.CSSProperties => {
    const base: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.09)' };
    if (!submitted) {
      const isChosen = quizType === 'multiselect' ? multiSelected.has(i) : selected === i;
      return isChosen ? { background: 'rgba(0,212,255,0.1)', borderColor: 'var(--electric)' } : base;
    }
    const isCorrect = correctSet.has(i);
    const isChosen = quizType === 'multiselect' ? multiSelected.has(i) : selected === i;
    if (isCorrect && isChosen) return { background: 'rgba(52,211,153,0.12)', borderColor: '#34d399' };
    if (isCorrect && !isChosen) return { background: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.4)' }; // missed
    if (!isCorrect && isChosen) return { background: 'rgba(239,68,68,0.12)', borderColor: '#ef4444' };
    return base;
  };

  const getOptionLabel = (i: number): string => {
    if (!submitted) return '';
    const isCorrect = correctSet.has(i);
    const isChosen = quizType === 'multiselect' ? multiSelected.has(i) : selected === i;
    if (isCorrect && isChosen) return ' ✓';
    if (isCorrect && !isChosen) return ' (missed)';
    if (!isCorrect && isChosen) return ' ✗';
    return '';
  };

  const typeLabel = quizType === 'multiselect' ? 'Select all that apply' : quizType === 'truefalse' ? 'True / False' : 'Quick Check';

  return (
    <div className="glass-card rounded-xl p-5" style={{ border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color: 'var(--electric)' }}>❓</span>
        <span className="text-sm font-bold" style={{ color: 'var(--electric)' }}>{typeLabel}</span>
        {passThreshold < 100 && (
          <span className="ml-auto text-[10px]" style={{ color: 'var(--muted)' }}>Pass: {passThreshold}%</span>
        )}
      </div>
      <p className="font-medium mb-4 text-sm md:text-base" style={{ color: 'var(--white)' }}>{block.question}</p>

      <div className="flex flex-col gap-2 mb-4">
        {block.options.map((opt, i) => {
          const isChosen = quizType === 'multiselect' ? multiSelected.has(i) : selected === i;
          return (
            <button
              key={opt.id}
              onClick={() => {
                if (submitted) return;
                if (quizType === 'multiselect') toggleMulti(i);
                else setSelected(i);
              }}
              disabled={submitted}
              className="text-left px-4 py-3 rounded-lg text-sm border transition-all flex items-center gap-2"
              style={{ color: 'var(--white)', ...getOptionStyle(i) }}
            >
              {/* Checkbox-style indicator for multiselect */}
              {quizType === 'multiselect' && (
                <span
                  className="w-4 h-4 rounded shrink-0 border flex items-center justify-center text-[10px]"
                  style={{
                    borderColor: isChosen ? 'var(--electric)' : 'var(--border)',
                    background: isChosen ? 'rgba(0,212,255,0.2)' : 'transparent',
                  }}
                >
                  {isChosen ? '✓' : ''}
                </span>
              )}
              <span>
                {String.fromCharCode(65 + i)}. {opt.text}
                <span className="ml-1 text-[11px] opacity-75">{getOptionLabel(i)}</span>
              </span>
            </button>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-primary text-sm px-5 py-2 disabled:opacity-40"
        >
          Submit Answer
        </button>
      )}

      {submitted && (
        <div className="flex flex-col gap-3">
          <div
            className="p-3 rounded-lg text-sm"
            style={{
              background: passed ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
              color: passed ? '#34d399' : '#ef4444',
            }}
          >
            {passed ? `✓ Correct! ${score < 100 ? `Score: ${score}%` : ''}` : `✗ ${score > 0 ? `Partial (${score}%) - ` : ''}Try again.`}
            {block.explanation && passed ? ` ${block.explanation}` : ''}
          </div>
          {!passed && (
            <button onClick={handleRetry} className="btn-outline text-sm px-4 py-2 self-start">
              ↩ Retry
            </button>
          )}
          {passed && block.explanation && !block.explanation.startsWith(' ') && (
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{block.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── FAQ Accordion ─────────────────────────────────────────────────────────────

function RFaq({ block }: { block: FaqBlock }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {block.items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="glass-card rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className="font-medium text-sm" style={{ color: 'var(--white)' }}>{item.question}</span>
              <span
                className="text-base shrink-0 ml-3"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--muted)', display: 'inline-block' }}
              >
                ▾
              </span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-sm leading-relaxed pt-3" style={{ color: 'var(--muted)' }}>{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── AI Tool Card ──────────────────────────────────────────────────────────────

function RAiToolCard({ block }: { block: AiToolCardBlock }) {
  return (
    <div className="flex items-start gap-4 glass-card rounded-xl p-5" style={{ border: '1px solid var(--border)' }}>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
        style={{ background: block.logoColor }}
      >
        {block.logoInitials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-base mb-1" style={{ color: 'var(--white)' }}>{block.toolName}</div>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>{block.description}</p>
        {block.tryLink && (
          <a
            href={block.tryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-4 py-2 rounded-full font-bold inline-block"
            style={{ border: '1px solid var(--electric)', color: 'var(--electric)' }}
          >
            Try {block.toolName} →
          </a>
        )}
      </div>
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

function RDivider() {
  return <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />;
}
