import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TiptapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading2, Heading3, List, ListOrdered, Quote, Code2,
  Minus, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
} from 'lucide-react';

// ── Toolbar primitives ────────────────────────────────────────────────────────

function ToolbarBtn({
  onClick, active = false, title, children,
}: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-2 rounded-lg transition-colors"
      style={{
        background: active ? 'rgba(0,212,255,0.15)' : 'transparent',
        color: active ? 'var(--electric)' : 'var(--muted)',
        minWidth: 36,
        minHeight: 36,
      }}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  function setLink() {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter URL:', prev ?? 'https://');
    if (url === null) return;
    if (!url) { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
  }

  return (
    <div
      className="flex flex-wrap gap-1 p-2"
      style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}
    >
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={16} /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={16} /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon size={16} /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={16} /></ToolbarBtn>

      <div className="w-px mx-1" style={{ background: 'var(--border)' }} />

      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={16} /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 size={16} /></ToolbarBtn>

      <div className="w-px mx-1" style={{ background: 'var(--border)' }} />

      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list"><List size={16} /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list"><ListOrdered size={16} /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote size={16} /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block"><Code2 size={16} /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal rule"><Minus size={16} /></ToolbarBtn>
      <ToolbarBtn onClick={setLink} active={editor.isActive('link')} title="Insert link"><LinkIcon size={16} /></ToolbarBtn>

      <div className="w-px mx-1" style={{ background: 'var(--border)' }} />

      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left"><AlignLeft size={16} /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center"><AlignCenter size={16} /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right"><AlignRight size={16} /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify"><AlignJustify size={16} /></ToolbarBtn>
    </div>
  );
}

// ── Shared RichTextEditor component ───────────────────────────────────────────
// Used by: BlogPostEditor (blog admin) and TutorialsAdmin (lesson block editor).
// One useEditor config; one set of @tiptap packages.

export interface RichTextEditorProps {
  /** Pre-existing HTML to load into the editor (e.g. when editing a saved post/block). */
  content?: string;
  /** Called on every keystroke with the editor's current HTML. */
  onChange?: (html: string) => void;
  /** Called alongside onChange with the current word count. */
  onWordCountChange?: (words: number) => void;
  placeholder?: string;
  /** Minimum content-area height in pixels (default 300). */
  minHeight?: number;
  /** Show "~N words · N min read" footer (default false). */
  showWordCount?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  onWordCountChange,
  placeholder = 'Write here…',
  minHeight = 300,
  showWordCount = false,
}: RichTextEditorProps) {
  // Keep callback refs fresh so stale closures never fire with old handlers.
  const onChangeRef = useRef(onChange);
  const onWordCountRef = useRef(onWordCountChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { onWordCountRef.current = onWordCountChange; }, [onWordCountChange]);

  // Track the last content we pushed in from outside so we can skip no-op setContent.
  const prevExternalContentRef = useRef<string | undefined>(undefined);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      TextAlign.configure({
        types: ['paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'justify',
      }),
    ],
    editorProps: {
      attributes: { class: 'tiptap-editor' },
    },
    onUpdate({ editor }) {
      onChangeRef.current?.(editor.getHTML());
      onWordCountRef.current?.(editor.storage.characterCount?.words() ?? 0);
    },
  });

  // Sync external content prop into editor (handles async loads - e.g. fetching
  // an existing post/lesson from the API after the editor already mounted).
  useEffect(() => {
    if (!editor || content === undefined) return;
    if (content === prevExternalContentRef.current) return;
    prevExternalContentRef.current = content;
    if (editor.getHTML() !== content) {
      // false = don't emit a transaction so onChange isn't called for external updates.
      editor.commands.setContent(content, { emitUpdate: false });
      onWordCountRef.current?.(editor.storage.characterCount?.words() ?? 0);
    }
  }, [editor, content]);

  const wordCount = editor?.storage.characterCount?.words() ?? 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="glass-card overflow-hidden" style={{ borderRadius: '0.75rem' }}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} style={{ minHeight }} />
      {showWordCount && (
        <p className="text-xs px-4 py-2" style={{ color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
          ~{wordCount} words · {readTime} min read
        </p>
      )}
    </div>
  );
}
