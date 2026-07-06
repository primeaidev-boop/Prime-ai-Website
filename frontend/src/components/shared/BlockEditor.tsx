import { useState } from 'react';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { generateId } from '@/data/tutorialData';
import type {
  ContentBlock,
  CalloutVariant,
  PromptTool,
  QuizBlockType,
} from '@/types';

// ── Block type registry ───────────────────────────────────────────────────────

export const BLOCK_TYPES: { value: ContentBlock['type']; label: string }[] = [
  { value: 'richText',    label: '✍️ Rich Text' },
  { value: 'heading',     label: '📝 Heading' },
  { value: 'paragraph',  label: '📄 Paragraph' },
  { value: 'image',      label: '🖼 Image' },
  { value: 'video',      label: '🎬 Video' },
  { value: 'highlightBox', label: '💡 Highlight Box' },
  { value: 'prompt',     label: '⌨ Prompt Block' },
  { value: 'table',      label: '📊 Table' },
  { value: 'code',       label: '💻 Code Block' },
  { value: 'callout',    label: '📣 Callout' },
  { value: 'comparison', label: '↔ Comparison' },
  { value: 'checklist',  label: '✓ Checklist' },
  { value: 'download',   label: '⬇ Download' },
  { value: 'quiz',       label: '❓ Quiz' },
  { value: 'faq',        label: '💬 FAQ' },
  { value: 'aiToolCard', label: '🤖 AI Tool Card' },
  { value: 'divider',    label: '── Divider' },
];

// Restricted subset for Projects – no tutorial-only types
export const PROJECT_ALLOWED_BLOCK_TYPES: ContentBlock['type'][] = [
  'richText', 'image', 'video', 'highlightBox', 'callout', 'divider',
];

// ── Factory ───────────────────────────────────────────────────────────────────

export function createDefaultBlock(type: ContentBlock['type']): ContentBlock {
  const id = generateId();
  switch (type) {
    case 'richText':     return { id, type, html: '' };
    case 'heading':      return { id, type, level: 2, text: '' };
    case 'paragraph':    return { id, type, html: '' };
    case 'image':        return { id, type, src: '', alt: '' };
    case 'video':        return { id, type, url: '' };
    case 'highlightBox': return { id, type, icon: '💡', title: '', content: '' };
    case 'prompt':       return { id, type, label: '', promptText: '', tryInTool: 'chatgpt' };
    case 'table':        return { id, type, headers: ['Column 1', 'Column 2'], rows: [['', '']] };
    case 'code':         return { id, type, language: 'javascript', code: '' };
    case 'callout':      return { id, type, variant: 'info', content: '' };
    case 'comparison':   return { id, type, leftTitle: 'Before', rightTitle: 'After', leftItems: [], rightItems: [] };
    case 'checklist':    return { id, type, items: [] };
    case 'download':     return { id, type, label: '', href: '' };
    case 'quiz':         return { id, type, question: '', options: [{ id: generateId(), text: '' }, { id: generateId(), text: '' }], correctIndex: 0 };
    case 'faq':          return { id, type, items: [] };
    case 'aiToolCard':   return { id, type, toolName: '', logoColor: '#00D4FF', logoInitials: 'AI', description: '' };
    case 'divider':      return { id, type };
  }
}

// ── Preview text for block list rows ─────────────────────────────────────────

export function BlockPreview(block: ContentBlock): string {
  switch (block.type) {
    case 'richText':     return block.html.replace(/<[^>]+>/g, '').slice(0, 80) || '(empty - click to write)';
    case 'heading':      return `H${block.level}: ${block.text}`;
    case 'paragraph':    return block.html.replace(/<[^>]+>/g, '').slice(0, 60) || '(empty)';
    case 'highlightBox': return block.title;
    case 'prompt':       return block.label;
    case 'callout':      return block.title ?? block.content.slice(0, 50);
    case 'quiz':         return block.question.slice(0, 60);
    case 'faq':          return `${block.items.length} FAQ item(s)`;
    case 'code':         return block.language;
    case 'comparison':   return `${block.leftTitle} vs ${block.rightTitle}`;
    case 'checklist':    return `${block.items.length} item(s)`;
    case 'image':        return block.alt || block.src;
    case 'video':        return block.url.slice(0, 50);
    case 'download':     return block.label;
    case 'aiToolCard':   return block.toolName;
    case 'table':        return `${block.rows.length} row(s) × ${block.headers.length} col(s)`;
    case 'divider':      return '── horizontal rule ──';
  }
}

// ── Field editors per block type ─────────────────────────────────────────────

export function BlockFieldEditor({ block, onChange }: { block: ContentBlock; onChange: (b: ContentBlock) => void }) {
  switch (block.type) {
    case 'richText':
      return (
        <RichTextEditor
          content={block.html}
          onChange={(html) => onChange({ ...block, html })}
          placeholder="Write lesson content here…"
          minHeight={240}
          showWordCount
        />
      );

    case 'heading':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Level</label>
            <select value={block.level} onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 1 | 2 | 3 })}>
              <option value={1}>H1</option><option value={2}>H2</option><option value={3}>H3</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Text</label>
            <input type="text" value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} />
          </div>
        </div>
      );

    case 'paragraph':
      return (
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Content (HTML allowed)</label>
          <textarea rows={5} value={block.html} onChange={(e) => onChange({ ...block, html: e.target.value })} placeholder="<p>Your text here...</p>" />
        </div>
      );

    case 'highlightBox':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Icon (emoji)</label>
            <input type="text" value={block.icon} onChange={(e) => onChange({ ...block, icon: e.target.value })} placeholder="💡" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Title</label>
            <input type="text" value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Content</label>
            <textarea rows={3} value={block.content} onChange={(e) => onChange({ ...block, content: e.target.value })} />
          </div>
        </div>
      );

    case 'prompt':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Label</label>
            <input type="text" value={block.label} onChange={(e) => onChange({ ...block, label: e.target.value })} placeholder="Study Assistant Prompt" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Prompt Text</label>
            <textarea rows={4} value={block.promptText} onChange={(e) => onChange({ ...block, promptText: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Try In Tool</label>
            <select value={block.tryInTool} onChange={(e) => onChange({ ...block, tryInTool: e.target.value as PromptTool })}>
              <option value="chatgpt">ChatGPT</option><option value="gemini">Gemini</option><option value="claude">Claude</option><option value="none">None</option>
            </select>
          </div>
        </div>
      );

    case 'image':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Image URL</label>
            <input type="text" value={block.src} onChange={(e) => onChange({ ...block, src: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Alt Text</label>
            <input type="text" value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Caption (optional)</label>
            <input type="text" value={block.caption ?? ''} onChange={(e) => onChange({ ...block, caption: e.target.value })} />
          </div>
        </div>
      );

    case 'video':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>YouTube or Vimeo URL</label>
            <input type="text" value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Caption (optional)</label>
            <input type="text" value={block.caption ?? ''} onChange={(e) => onChange({ ...block, caption: e.target.value })} />
          </div>
        </div>
      );

    case 'code':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Language</label>
            <input type="text" value={block.language} onChange={(e) => onChange({ ...block, language: e.target.value })} placeholder="javascript" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Code</label>
            <textarea rows={6} value={block.code} onChange={(e) => onChange({ ...block, code: e.target.value })} style={{ fontFamily: 'monospace', fontSize: 12 }} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Caption (optional)</label>
            <input type="text" value={block.caption ?? ''} onChange={(e) => onChange({ ...block, caption: e.target.value })} />
          </div>
        </div>
      );

    case 'callout':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Variant</label>
            <select value={block.variant} onChange={(e) => onChange({ ...block, variant: e.target.value as CalloutVariant })}>
              <option value="info">Info</option><option value="success">Success</option><option value="warning">Warning</option><option value="error">Error</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Title (optional)</label>
            <input type="text" value={block.title ?? ''} onChange={(e) => onChange({ ...block, title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Content</label>
            <textarea rows={3} value={block.content} onChange={(e) => onChange({ ...block, content: e.target.value })} />
          </div>
        </div>
      );

    case 'comparison':
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Left Title</label>
            <input type="text" value={block.leftTitle} onChange={(e) => onChange({ ...block, leftTitle: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Right Title</label>
            <input type="text" value={block.rightTitle} onChange={(e) => onChange({ ...block, rightTitle: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Left Items (one per line)</label>
            <textarea rows={4} value={block.leftItems.join('\n')} onChange={(e) => onChange({ ...block, leftItems: e.target.value.split('\n').filter(Boolean) })} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Right Items (one per line)</label>
            <textarea rows={4} value={block.rightItems.join('\n')} onChange={(e) => onChange({ ...block, rightItems: e.target.value.split('\n').filter(Boolean) })} />
          </div>
        </div>
      );

    case 'checklist': {
      const updateItems = (text: string) => {
        const items = text.split('\n').map((t, i) => ({
          id: block.items[i]?.id ?? generateId(),
          text: t,
          checked: block.items[i]?.checked ?? false,
        })).filter((item) => item.text);
        onChange({ ...block, items });
      };
      return (
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Items (one per line)</label>
          <textarea rows={5} value={block.items.map((i) => i.text).join('\n')} onChange={(e) => updateItems(e.target.value)} />
        </div>
      );
    }

    case 'download':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Label</label>
            <input type="text" value={block.label} onChange={(e) => onChange({ ...block, label: e.target.value })} placeholder="Prompt Cheat Sheet" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>File URL</label>
            <input type="text" value={block.href} onChange={(e) => onChange({ ...block, href: e.target.value })} placeholder="/files/prompt-cheatsheet.pdf" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>File Type</label>
              <input type="text" value={block.fileType ?? ''} onChange={(e) => onChange({ ...block, fileType: e.target.value })} placeholder="PDF" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Size</label>
              <input type="text" value={block.size ?? ''} onChange={(e) => onChange({ ...block, size: e.target.value })} placeholder="2.4 MB" />
            </div>
          </div>
        </div>
      );

    case 'quiz': {
      const qType: QuizBlockType = block.quizType ?? 'mcq';
      const isMulti = qType === 'multiselect';
      const correctIndices: Set<number> = new Set(block.correctIndices ?? [block.correctIndex]);

      const updateOption = (id: string, text: string) =>
        onChange({ ...block, options: block.options.map((o) => o.id === id ? { ...o, text } : o) });
      const addOption = () => onChange({ ...block, options: [...block.options, { id: generateId(), text: '' }] });
      const removeOption = (id: string) => onChange({ ...block, options: block.options.filter((o) => o.id !== id) });

      const toggleMultiCorrect = (i: number) => {
        const next = new Set(correctIndices);
        next.has(i) ? next.delete(i) : next.add(i);
        const arr = [...next].sort((a, b) => a - b);
        onChange({ ...block, correctIndices: arr, correctIndex: arr[0] ?? 0 });
      };

      return (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Quiz Type</label>
              <select value={qType} onChange={(e) => onChange({ ...block, quizType: e.target.value as QuizBlockType, correctIndices: undefined })}>
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="truefalse">True / False</option>
                <option value="multiselect">Multi-select</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Pass Threshold (%)</label>
              <input type="number" min={1} max={100} value={block.passThreshold ?? 100} onChange={(e) => onChange({ ...block, passThreshold: Math.min(100, Math.max(1, Number(e.target.value))) })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Question</label>
            <textarea rows={2} value={block.question} onChange={(e) => onChange({ ...block, question: e.target.value })} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                Options {isMulti ? '(checkboxes = correct)' : '(radio = correct)'}
              </label>
              <button onClick={addOption} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--electric)' }}>+ Add</button>
            </div>
            {block.options.map((opt, i) => (
              <div key={opt.id} className="flex gap-2 items-center mb-1.5">
                {isMulti ? (
                  <input type="checkbox" checked={correctIndices.has(i)} onChange={() => toggleMultiCorrect(i)} />
                ) : (
                  <input type="radio" name={`quiz-correct-${block.id}`} checked={block.correctIndex === i} onChange={() => onChange({ ...block, correctIndex: i })} />
                )}
                <input type="text" value={opt.text} onChange={(e) => updateOption(opt.id, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + i)}`} className="flex-1" />
                <button onClick={() => removeOption(opt.id)} className="text-xs" style={{ color: '#ef4444' }}>✕</button>
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Explanation (shown after answer)</label>
            <textarea rows={2} value={block.explanation ?? ''} onChange={(e) => onChange({ ...block, explanation: e.target.value })} />
          </div>
        </div>
      );
    }

    case 'faq': {
      const updateItem = (id: string, field: 'question' | 'answer', value: string) =>
        onChange({ ...block, items: block.items.map((i) => i.id === id ? { ...i, [field]: value } : i) });
      const addItem = () => onChange({ ...block, items: [...block.items, { id: generateId(), question: '', answer: '' }] });
      const removeItem = (id: string) => onChange({ ...block, items: block.items.filter((i) => i.id !== id) });
      return (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>FAQ Items</label>
            <button onClick={addItem} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--electric)' }}>+ Add Item</button>
          </div>
          <div className="flex flex-col gap-3">
            {block.items.map((item, i) => (
              <div key={item.id} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>Item {i + 1}</span>
                  <button onClick={() => removeItem(item.id)} className="text-xs" style={{ color: '#ef4444' }}>✕</button>
                </div>
                <input type="text" value={item.question} onChange={(e) => updateItem(item.id, 'question', e.target.value)} placeholder="Question" className="mb-2" />
                <textarea rows={2} value={item.answer} onChange={(e) => updateItem(item.id, 'answer', e.target.value)} placeholder="Answer" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'aiToolCard':
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Tool Name</label>
            <input type="text" value={block.toolName} onChange={(e) => onChange({ ...block, toolName: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Logo Color</label>
              <input type="color" value={block.logoColor} onChange={(e) => onChange({ ...block, logoColor: e.target.value })} className="h-10 w-full rounded cursor-pointer" style={{ border: '1px solid var(--border)', padding: 2 }} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Initials</label>
              <input type="text" value={block.logoInitials} onChange={(e) => onChange({ ...block, logoInitials: e.target.value.slice(0, 4).toUpperCase() })} maxLength={4} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Description</label>
            <textarea rows={2} value={block.description} onChange={(e) => onChange({ ...block, description: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Try Link (optional)</label>
            <input type="text" value={block.tryLink ?? ''} onChange={(e) => onChange({ ...block, tryLink: e.target.value })} placeholder="https://..." />
          </div>
        </div>
      );

    case 'table': {
      const updateHeaders = (text: string) => onChange({ ...block, headers: text.split(',').map((h) => h.trim()).filter(Boolean) });
      const updateRows = (text: string) => onChange({ ...block, rows: text.split('\n').filter(Boolean).map((row) => row.split('|').map((c) => c.trim())) });
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Headers (comma-separated)</label>
            <input type="text" value={block.headers.join(', ')} onChange={(e) => updateHeaders(e.target.value)} placeholder="Name, Description, Example" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted)' }}>Rows (one per line, pipe-separated)</label>
            <textarea rows={5} value={block.rows.map((r) => r.join(' | ')).join('\n')} onChange={(e) => updateRows(e.target.value)} style={{ fontFamily: 'monospace', fontSize: 12 }} />
          </div>
        </div>
      );
    }

    case 'divider':
      return <p className="text-sm text-center py-4" style={{ color: 'var(--muted)' }}>Horizontal divider – no fields needed.</p>;

    default:
      return null;
  }
}

// ── Block editor modal (for non-richText blocks) ──────────────────────────────

export function BlockEditorModal({ block, onChange, onSave, onClose }: {
  block: ContentBlock;
  onChange: (b: ContentBlock) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6"
        style={{
          background: 'rgba(4, 11, 28, 0.97)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold" style={{ color: 'var(--white)' }}>
            Edit Block — {BLOCK_TYPES.find((bt) => bt.value === block.type)?.label}
          </h3>
          <button onClick={onClose} style={{ color: 'var(--muted)' }}>✕</button>
        </div>
        <BlockFieldEditor block={block} onChange={onChange} />
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} className="btn-outline px-5 py-2 text-sm">Cancel</button>
          <button onClick={onSave} className="btn-primary px-5 py-2 text-sm">Save Block</button>
        </div>
      </div>
    </div>
  );
}

// ── Add block dropdown ────────────────────────────────────────────────────────

export function AddBlockSelect({
  onAdd,
  allowedBlockTypes,
}: {
  onAdd: (type: ContentBlock['type']) => void;
  allowedBlockTypes?: ContentBlock['type'][];
}) {
  const types = allowedBlockTypes
    ? BLOCK_TYPES.filter((bt) => allowedBlockTypes.includes(bt.value))
    : BLOCK_TYPES;

  return (
    <select
      onChange={(e) => { if (e.target.value) { onAdd(e.target.value as ContentBlock['type']); e.target.value = ''; } }}
      defaultValue=""
      style={{ width: 'auto', minHeight: 36, padding: '4px 10px', fontSize: 12 }}
    >
      <option value="">+ Add Block</option>
      {types.map((bt) => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
    </select>
  );
}

// ── Complete block editor section (drop-in for any admin form) ────────────────

export function BlockEditorSection({
  blocks,
  onChange,
  allowedBlockTypes,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  allowedBlockTypes?: ContentBlock['type'][];
}) {
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState<ContentBlock | null>(null);

  const showRichTextBtn = !allowedBlockTypes || allowedBlockTypes.includes('richText');

  function addBlock(type: ContentBlock['type']) {
    const b = createDefaultBlock(type);
    onChange([...blocks, b]);
    if (type !== 'richText') {
      setBlockForm(b);
      setShowBlockModal(true);
    }
  }

  function openEditBlock(block: ContentBlock) {
    setBlockForm({ ...block });
    setShowBlockModal(true);
  }

  function saveBlock() {
    if (!blockForm) return;
    const exists = blocks.some((b) => b.id === blockForm.id);
    onChange(exists
      ? blocks.map((b) => b.id === blockForm.id ? blockForm : b)
      : [...blocks, blockForm]);
    setShowBlockModal(false);
  }

  function deleteBlock(id: string) {
    if (!confirm('Delete this block?')) return;
    onChange(blocks.filter((b) => b.id !== id));
  }

  function moveBlock(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold" style={{ color: 'var(--electric)' }}>
          Content Blocks ({blocks.length})
        </span>
        <div className="flex gap-2">
          {showRichTextBtn && (
            <button
              type="button"
              onClick={() => addBlock('richText')}
              className="text-xs px-3 py-1.5 rounded-lg font-medium"
              style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--electric)', border: '1px solid rgba(0,212,255,0.2)' }}
            >
              ✍️ Rich Text
            </button>
          )}
          <AddBlockSelect onAdd={addBlock} allowedBlockTypes={allowedBlockTypes} />
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-2">
        {blocks.map((block, i) => {
          const isFirst = i === 0;
          const isLast = i === blocks.length - 1;

          if (block.type === 'richText') {
            return (
              <div key={block.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <div
                  className="flex items-center justify-between px-3 py-1.5"
                  style={{ background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid var(--border)' }}
                >
                  <span className="text-xs font-medium" style={{ color: 'var(--electric)' }}>✍️ Rich Text</span>
                  <div className="flex gap-1">
                    <button onClick={() => moveBlock(i, -1)} disabled={isFirst} className="text-xs px-1.5 py-1 disabled:opacity-30" style={{ color: 'var(--muted)' }}>↑</button>
                    <button onClick={() => moveBlock(i, 1)} disabled={isLast} className="text-xs px-1.5 py-1 disabled:opacity-30" style={{ color: 'var(--muted)' }}>↓</button>
                    <button onClick={() => deleteBlock(block.id)} className="text-xs px-1.5 py-1" style={{ color: '#ef4444' }}>✕</button>
                  </div>
                </div>
                <RichTextEditor
                  content={block.html}
                  onChange={(html) => {
                    onChange(blocks.map((b) => {
                      if (b.id === block.id && b.type === 'richText') return { ...b, html };
                      return b;
                    }));
                  }}
                  placeholder="Write content here…"
                  minHeight={120}
                />
              </div>
            );
          }

          return (
            <div key={block.id} className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <span className="text-xs shrink-0 w-28 truncate" style={{ color: 'var(--electric)' }}>
                {BLOCK_TYPES.find((bt) => bt.value === block.type)?.label ?? block.type}
              </span>
              <span className="flex-1 text-xs truncate" style={{ color: 'var(--muted)' }}>{BlockPreview(block)}</span>
              <button onClick={() => moveBlock(i, -1)} disabled={isFirst} className="text-xs px-1.5 py-1 disabled:opacity-30" style={{ color: 'var(--muted)' }}>↑</button>
              <button onClick={() => moveBlock(i, 1)} disabled={isLast} className="text-xs px-1.5 py-1 disabled:opacity-30" style={{ color: 'var(--muted)' }}>↓</button>
              <button onClick={() => openEditBlock(block)} className="text-xs px-2 py-1" style={{ color: 'var(--electric)' }}>Edit</button>
              <button onClick={() => deleteBlock(block.id)} className="text-xs px-2 py-1" style={{ color: '#ef4444' }}>✕</button>
            </div>
          );
        })}

        {blocks.length === 0 && (
          <div className="text-center py-6 text-xs rounded-xl" style={{ color: 'var(--muted)', border: '1px dashed var(--border)' }}>
            No blocks yet. Click <strong>✍️ Rich Text</strong> to start writing, or choose a block type from the dropdown.
          </div>
        )}
      </div>

      {showBlockModal && blockForm && (
        <BlockEditorModal
          block={blockForm}
          onChange={setBlockForm}
          onSave={saveBlock}
          onClose={() => setShowBlockModal(false)}
        />
      )}
    </>
  );
}
