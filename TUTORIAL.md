# Tutorial System - Complete Technical Reference

> **Project:** PRIM AI Institute  
> **Module:** Tutorials (`/tutorials`, `/tutorials/:slug`, `/tutorials/:slug/:lesson`)  
> **Built in:** Phase 1 (listing page + CMS) + Phase 2 (lesson reader + content builder)  
> **Last updated:** 2026-06-22

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Data Layer](#2-data-layer)
3. [TypeScript Types](#3-typescript-types)
4. [Content Block System](#4-content-block-system)
5. [Lesson Reader Page - TutorialPage.tsx](#5-lesson-reader-page--tutorialpagetsx)
6. [BlockRenderer Component](#6-blockrenderer-component)
7. [Admin CMS - TutorialsAdmin.tsx](#7-admin-cms--tutorialsadmintsx)
8. [Routes](#8-routes)
9. [Design Tokens & CSS Rules](#9-design-tokens--css-rules)
10. [Data Flow Diagram](#10-data-flow-diagram)
11. [Adding New Content - Step-by-Step](#11-adding-new-content--step-by-step)
12. [Phase 3 Roadmap](#12-phase-3-roadmap)

---

## 1. Overview & Architecture

The tutorial system is a **fully client-side, localStorage-backed CMS**. There is no backend API for tutorials - all data lives in the browser under the key `primAI_tutorials`.

```
User visits /tutorials/:slug/:lesson
        │
        ▼
TutorialPage.tsx
  └── loadTutorialData()         ← reads localStorage
        │ falls back to
        └── DEFAULT_TUTORIAL_DATA  ← tutorialData.ts (source of truth)
              │
              ▼
      Tutorial { chapters[ Chapter { lessons[ Lesson { blocks[ ContentBlock ] } ] } ] }
```

**Key principle:** The admin saves changes via `saveTutorialData()` ➞ JSON is written to localStorage ➞ the public page reads it back on next load. The default data in `tutorialData.ts` is what new users (or after a clear) will see.

### File map

| File | Role |
|---|---|
| `src/data/tutorialData.ts` | Default data + `loadTutorialData` / `saveTutorialData` / `generateId` / `slugify` |
| `src/types/index.ts` | All TypeScript interfaces - `Tutorial`, `Chapter`, `Lesson`, `ContentBlock` union |
| `src/pages/TutorialPage.tsx` | 3-column lesson reader (public-facing) |
| `src/components/tutorial/BlockRenderer.tsx` | Renders all 16 content block types |
| `src/pages/admin/TutorialsAdmin.tsx` | Admin CMS - 4 tabs: Tutorials / Categories / Lessons / Page Content |
| `src/pages/Tutorials.tsx` | Tutorial listing page (Phase 1 - not modified in Phase 2) |

---

## 2. Data Layer

### `src/data/tutorialData.ts`

#### `loadTutorialData(): TutorialPageData`
Reads `localStorage.getItem('primAI_tutorials')`, parses JSON, returns it. If nothing is stored or JSON is invalid, returns `DEFAULT_TUTORIAL_DATA`.

#### `saveTutorialData(data: TutorialPageData): void`
Writes `JSON.stringify(data)` to `localStorage.setItem('primAI_tutorials', ...)`.

#### `generateId(): string`
Returns a collision-resistant ID: `` `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` ``  
Example output: `"1719043200000-xk7q2"`

#### `slugify(text: string): string`
Lowercases, trims, replaces non-alphanumeric runs with `-`, strips leading/trailing dashes.  
`"How ChatGPT Works"` ➞ `"how-chatgpt-works"`

#### `DEFAULT_TUTORIAL_DATA`
Exported constant of type `TutorialPageData`. This is the fallback when localStorage is empty and is also used in the ContentTab as placeholder text. **This is the source of truth for default content.**

### localStorage key

```
primAI_tutorials   ←  full TutorialPageData JSON blob
```

The blob includes hero content, newsletter strip, upsell CTA, categories array, and tutorials array (each tutorial optionally containing `chapters` and `toolsAndStats`).

---

## 3. TypeScript Types

All types live in `src/types/index.ts` under the `// ─── Tutorial Module` section.

### Top-level

```typescript
type TutorialDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'

interface TutorialPageData {
  hero:        TutorialHero
  categories:  TutorialCategory[]
  tutorials:   Tutorial[]
  newsletter:  TutorialNewsletter
  upsell:      TutorialUpsell
}
```

### `TutorialCategory`

```typescript
interface TutorialCategory {
  id:        string   // generateId()
  name:      string   // "AI Assistants"
  slug:      string   // "ai-assistants"
  color:     string   // hex accent "#00D4FF"
  order:     number   // sort order for listing
  isVisible: boolean  // hide from listing without deleting
}
```

### `Tutorial`

```typescript
interface Tutorial {
  id:              string
  categorySlug:    string               // matches TutorialCategory.slug
  name:            string               // "ChatGPT"
  slug:            string               // "chatgpt" ➞ URL: /tutorials/chatgpt
  logoColor:       string               // hex "#10a37f"
  logoInitials:    string               // "GPT" (max 4 chars)
  description:     string
  tags:            string[]             // ["Writing", "Coding"]
  difficulty:      TutorialDifficulty
  isPremium:       boolean
  lessonCount:     number               // display number on card (not auto-counted)
  isFeatured:      boolean              // only one tutorial should be featured
  isVisible:       boolean
  order:           number               // within category
  ctaEnrollLink:   string               // "/courses"
  ctaDownloadLink: string               // "/contact"
  chapters?:       Chapter[]            // undefined = no lesson content yet
  toolsAndStats?:  ToolsAndStats        // right-sidebar Tools & Stats data
}
```

### `Chapter`

```typescript
interface Chapter {
  id:      string
  title:   string   // "Week 1 - AI Fundamentals"
  order:   number   // sorted ascending when rendering
  lessons: Lesson[]
}
```

### `Lesson`

```typescript
type UnlockRule = 'sequential' | 'free' | 'quiz' | 'manual'

interface Lesson {
  id:           string
  title:        string              // "How ChatGPT Works"
  slug:         string              // "how-chatgpt-works" ➞ URL segment
  lessonNumber: number              // display number (01, 02…)
  isFree:       boolean             // shows FREE badge in sidebar + header
  readTime:     number              // minutes, shown in meta row
  difficulty:   TutorialDifficulty
  toolName:     string              // "ChatGPT" - shown in meta row
  intro:        string              // subheading under the h1
  blocks:       ContentBlock[]      // ordered content blocks
  visible:      boolean
  locked:       boolean             // 🔒 state in sidebar, cannot navigate
  unlockRule:   UnlockRule          // informational only in Phase 2
}
```

### `ToolsAndStats`

```typescript
interface ToolsAndStatsTool { id: string; name: string; icon: string }

interface ToolsAndStats {
  sessionLabel:        string              // "Session" label above timer
  liveTools:           ToolsAndStatsTool[] // shown as pill rows in right sidebar
  promptTemplatesLink: string             // href for "Prompt Templates" link
}
```

If a tutorial has no `toolsAndStats`, the right sidebar falls back to a single tool entry using `tutorial.name` and icon `"🤖"`.

---

## 4. Content Block System

Every lesson contains an ordered `blocks: ContentBlock[]` array. Blocks are rendered sequentially by `BlockRenderer`. Each block has a unique `id` field used for TOC anchoring (heading blocks only) and React keys.

### The `ContentBlock` union

```typescript
type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | VideoBlock
  | HighlightBoxBlock
  | PromptBlock
  | TableBlock
  | CodeBlock
  | CalloutBlock
  | ComparisonBlock
  | ChecklistBlock
  | DownloadBlock
  | QuizBlock
  | FaqBlock
  | AiToolCardBlock
  | DividerBlock
```

### Block type reference

| Type | Discriminant (`type`) | Key fields | Interactive? |
|---|---|---|---|
| Heading | `'heading'` | `level: 1|2|3`, `text` | No - creates TOC anchor |
| Paragraph | `'paragraph'` | `html` (HTML string) | No |
| Image | `'image'` | `src`, `alt`, `caption?` | No |
| Video | `'video'` | `url` (YouTube/Vimeo), `caption?` | No - auto-embed |
| Highlight Box | `'highlightBox'` | `icon` (emoji), `title`, `content` | No |
| Prompt | `'prompt'` | `label`, `promptText`, `tryInTool` | Yes - Copy + Try button |
| Table | `'table'` | `headers: string[]`, `rows: string[][]` | No |
| Code | `'code'` | `language`, `code`, `caption?` | Yes - Copy button |
| Callout | `'callout'` | `variant`, `title?`, `content` | No |
| Comparison | `'comparison'` | `leftTitle`, `rightTitle`, `leftItems[]`, `rightItems[]` | No |
| Checklist | `'checklist'` | `items[]: { id, text, checked }` | Yes - toggle checked state |
| Download | `'download'` | `label`, `href`, `fileType?`, `size?` | No - `<a download>` |
| Quiz | `'quiz'` | `question`, `options[]`, `correctIndex`, `explanation?` | Yes - select + submit |
| FAQ | `'faq'` | `items[]: { id, question, answer }` | Yes - accordion |
| AI Tool Card | `'aiToolCard'` | `toolName`, `logoColor`, `logoInitials`, `description`, `tryLink?` | Conditional link |
| Divider | `'divider'` | *(none)* | No |

### Block-specific type details

#### `PromptBlock`
```typescript
type PromptTool = 'chatgpt' | 'gemini' | 'claude' | 'none'

interface PromptBlock {
  id: string; type: 'prompt'
  label:       string      // header label e.g. "Study Assistant Prompt"
  promptText:  string      // the actual prompt content
  tryInTool:   PromptTool  // 'none' hides the Try button
}
```

#### `CalloutBlock`
```typescript
type CalloutVariant = 'info' | 'success' | 'warning' | 'error'

interface CalloutBlock {
  id: string; type: 'callout'
  variant: CalloutVariant
  title?:  string
  content: string
}
```

Visual mapping for variants:

| Variant | Background | Border | Icon | Title color |
|---|---|---|---|---|
| `info` | cyan 6% | cyan 25% | ℹ️ | `var(--electric)` |
| `success` | green 6% | green 25% | ✅ | `#34d399` |
| `warning` | amber 6% | amber 25% | ⚠️ | `#FBBF24` |
| `error` | red 6% | red 25% | ❌ | `#ef4444` |

#### `QuizBlock`
```typescript
interface QuizOption { id: string; text: string }

interface QuizBlock {
  id: string; type: 'quiz'
  question:      string
  options:       QuizOption[]
  correctIndex:  number       // 0-based index into options[]
  explanation?:  string       // shown after submission
}
```

#### `ChecklistBlock`
Items have a `checked` boolean in the data. In Phase 2, initial state comes from this field, but toggling is local component state only - it does **not** write back to localStorage. Phase 3 should add persistence.

---

## 5. Lesson Reader Page - TutorialPage.tsx

**Route:** `/tutorials/:slug/:lesson`  
**File:** `src/pages/TutorialPage.tsx`

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Navbar (fixed top-0, h-16)                                   │
├────────────┬─────────────────────────────────┬───────────────┤
│ Left       │                                 │ Right         │
│ Sidebar    │  Center Content                 │ Sidebar       │
│ 260px      │  max-w-[860px] px-6 md:px-12   │ 280px         │
│ fixed      │  pt-24 pb-28                    │ fixed         │
│ top-16     │                                 │ top-16        │
│ lg:flex    │  lg:pl-[260px] xl:pr-[280px]   │ xl:flex       │
│ hidden     │                                 │ hidden        │
└────────────┴─────────────────────────────────┴───────────────┘
  Mobile: ☰ Lessons button (fixed top-[68px] left-3)
  Mobile: Bottom nav bar (fixed bottom-0) - Prev / Mark Complete / Next
```

All three columns are independently scrollable. Left and right sidebars are `fixed` and do not scroll with the page - only the center scrolls.

### Breakpoints

| Breakpoint | Left sidebar | Right sidebar | Bottom nav |
|---|---|---|---|
| < `lg` (< 1024px) | Hidden - accessible via ☰ overlay | Hidden | Visible |
| `lg` to `xl` | Visible (fixed) | Hidden | Hidden |
| `xl`+ (≥ 1280px) | Visible (fixed) | Visible (fixed) | Hidden |

### Hooks

#### `useSessionTimer(): string`
- Starts counting from 0 on mount using `setInterval(1000)`
- Cleared with `clearInterval` on unmount
- Format: `"45s"` under 60 seconds, `"2m 05s"` after that
- Displayed in the right sidebar Tools & Stats section

#### `useScrollSpy(ids: string[]): string`
- Takes an array of element IDs (heading block anchors: `heading-${block.id}`)
- Creates an `IntersectionObserver` with `rootMargin: '-64px 0px -60% 0px'`
- Returns the `id` of the first heading currently intersecting the viewport
- Re-subscribes only when the `ids.join(',')` key changes
- Used by the right sidebar TOC to highlight the active heading

**Important:** `rootMargin: '-64px 0px -60% 0px'` means:
- Top: ignore the top 64px (navbar height)
- Bottom: ignore the bottom 60% of the viewport - so a heading activates only when it's in the top 40% of the visible area

### State

| State | Type | Purpose |
|---|---|---|
| `completedIds` | `Set<string>` | Lesson IDs marked complete in this session |
| `sidebarOpen` | `boolean` | Mobile sidebar overlay visibility |

Note: `completedIds` is in-memory only. Refreshing resets it. Phase 3 should persist to localStorage.

### Navigation logic

```typescript
// All lessons flattened from chapters sorted by order
const allLessons = chapters.flatMap((ch) => ch.lessons)

// currentLesson found by slug param
const currentLesson = allLessons.find((l) => l.slug === lessonSlug)
const currentIndex  = allLessons.indexOf(currentLesson)
const prevLesson    = currentIndex > 0 ? allLessons[currentIndex - 1] : null
const nextLesson    = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
```

Lessons navigate linearly across chapters - chapter boundaries are transparent to the prev/next arrows.

### Auto-redirect

```typescript
useEffect(() => {
  if (!lessonSlug && allLessons.length > 0 && tutorial) {
    navigate(`/tutorials/${slug}/${allLessons[0].slug}`, { replace: true })
  }
}, [lessonSlug, allLessons.length, tutorial?.slug])
```

Visiting `/tutorials/chatgpt` with no lesson segment redirects to `/tutorials/chatgpt/what-is-ai` (first lesson slug).

### Mark Complete + auto-advance

```typescript
const handleMarkComplete = () => {
  setCompletedIds((prev) => new Set(prev).add(currentLesson.id))
  if (nextLesson) setTimeout(() => handleLessonNav(nextLesson), 450)
}
```

After 450ms the user is automatically navigated to the next lesson. The 450ms delay lets the green "✓ Lesson Complete" state flash before navigation.

### Lesson states (sidebar)

| State | Icon | Style |
|---|---|---|
| `active` | `▶` cyan | cyan bg + left border, `borderLeft: 2px solid var(--electric)` |
| `completed` | `✓` cyan | strikethrough text, `color: var(--muted)` |
| `locked` | `🔒` | `opacity: 0.45`, `cursor: not-allowed`, disabled |
| `available` | `○` muted | default white text |

### Empty states

Three distinct cases handled cleanly:

1. **Tutorial slug not found** ➞ Full-page 404 with "Browse All Tutorials" CTA
2. **Tutorial found but no chapters** ➞ Full-page "coming soon" with tutorial logo
3. **Chapter exists but lesson slug not found** ➞ Minimal "Lesson not found" with back link

### `LeftSidebar` - chapter accordion

- `openChapterId` state controls which chapter is expanded
- `useEffect` syncs `openChapterId` to the chapter containing `currentLessonId` whenever the lesson changes (auto-expands active chapter)
- Clicking the chapter header toggles it (collapse/expand)
- Double-clicking the title in admin is separate - that's ChapterBlock in TutorialsAdmin

### `RightSidebar` - TOC + Tools

- TOC is auto-generated from `lesson.blocks.filter(b => b.type === 'heading')`
- H2 headings: `paddingLeft: 8px`
- H3 headings: `paddingLeft: 20px` (visually indented)
- Active heading highlighted with cyan color + left border (driven by `useScrollSpy`)
- Clicking a TOC item smooth-scrolls to it: `window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 80, behavior: 'smooth' })`
- The `- 80` accounts for the fixed navbar height

### `CenterContent` - article structure

1. Breadcrumb nav: `Tutorials › ChatGPT › Lesson title`
2. Badge row: `FREE` pill (if `isFree`) + `LESSON 03` label
3. `<h1>` - Montserrat font, `text-2xl md:text-4xl`
4. Intro paragraph (`lesson.intro`)
5. Meta row: `⏱ X min read` · `🤖 ToolName` · `📊 Difficulty`
6. `<article>` - maps `lesson.blocks` through `<BlockRenderer />`
7. Empty content placeholder when `blocks.length === 0`
8. Desktop Prev / Mark Complete / Next row

---

## 6. BlockRenderer Component

**File:** `src/components/tutorial/BlockRenderer.tsx`  
**Export:** `BlockRenderer({ block }: { block: ContentBlock })`

Pure switch-case dispatcher - reads `block.type` and renders the matching sub-component. Returns `null` for unknown types (TypeScript should prevent this, but safe).

### Heading anchors (TOC integration)

Every heading block renders with:
```tsx
<Tag id={`heading-${block.id}`} style={{ scrollMarginTop: 80 }} />
```
The `id` is what `useScrollSpy` observes. `scrollMarginTop: 80` prevents the heading from hiding under the navbar when jumped to via TOC.

### Prompt block - tool URLs

```typescript
const TOOL_URLS = {
  chatgpt: 'https://chat.openai.com/',
  gemini:  'https://gemini.google.com/',
  claude:  'https://claude.ai/',
}
```

When `tryInTool === 'none'`, the Try button is hidden. Otherwise a cyan button opens the URL in `_blank`.

### Video embed detection

```typescript
const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)
// ➞ https://www.youtube.com/embed/{id}

const vm = url.match(/vimeo\.com\/(\d+)/)
// ➞ https://player.vimeo.com/video/{id}
```

Any URL that doesn't match YouTube or Vimeo is used as-is in the `src` attribute.

### Interactive block state summary

| Block | Local state | Persisted? |
|---|---|---|
| `prompt` | `copied: boolean` (2s flash) | No |
| `code` | `copied: boolean` (2s flash) | No |
| `checklist` | `checked: Set<string>` | No - Phase 3 |
| `quiz` | `selected: number | null`, `submitted: boolean` | No |
| `faq` | `openId: string | null` | No |

### `dangerouslySetInnerHTML` in ParagraphBlock

Used deliberately - paragraph content is authored in the admin panel (not from public user input), so XSS risk is negligible. This enables `<strong>`, `<em>`, `<a>`, and other inline HTML tags in lesson body text.

---

## 7. Admin CMS - TutorialsAdmin.tsx

**File:** `src/pages/admin/TutorialsAdmin.tsx`  
**Route:** `/admin/tutorials` (protected by `PrivateRoute`)

### Tab structure

```
┌────────────┬────────────┬───────────┬──────────────────┐
│ 📚 Tutorials │ 🗂 Categories │ 🎯 Lessons │ ✏️ Page Content │
└────────────┴────────────┴───────────┴──────────────────┘
```

All four tabs share the same `data` state. Changes are **in-memory only** until "Save Changes" is clicked. The Save button calls `saveTutorialData(data)` and shows a 2.5s "✓ Saved!" confirmation or "✕ Error" on failure.

### `AdminTab` type

```typescript
type AdminTab = 'tutorials' | 'categories' | 'content' | 'lessons'
```

### Tab: Tutorials

- Filter dropdown by category
- Tutorial cards sorted by category order ➞ tutorial order within category
- Featured toggle (star icon) - clicking sets that tutorial as featured, unfeaturing all others
- Visibility toggle (● On / ○ Off pill)
- Edit button ➞ `TutorialModal`
- Delete with `confirm()` dialog
- `+ Add Tutorial` ➞ `TutorialModal` with `isNew: true`

**`TutorialModal`** fields: Tool Name, Slug (auto-generated from name in add mode), Category, Difficulty, Logo Color + Initials, Lesson Count, Description, Tags (comma-separated), Enroll CTA Link, Download CTA Link, Display Order, checkboxes for Premium / Featured / Visible.

### Tab: Categories

- List sorted by `order`
- Shows tutorial count per category
- Visibility toggle
- Edit ➞ `CategoryModal`
- Delete: warns if tutorials are assigned to the category

**`CategoryModal`** fields: Name, Slug (auto-generated in add mode), Accent Color (color picker + hex input), Order, Visible checkbox.

### Tab: Lessons

Three-level hierarchy: **Tutorial ➞ Chapters ➞ Lessons**

```
[Select Tutorial dropdown]
  └── Chapter 1 (▸ collapse) [↑] [↓] [✏️] [✕]
        ├── Lesson 01 - Title          [Edit] [✕]
        ├── Lesson 02 - Title          [Edit] [✕]
        └── [+ Add Lesson]
  └── Chapter 2 ...
  [+ Add Chapter]
```

#### `ChapterBlock` component

- `expanded` state (default true) - toggled by ▸/▾ button
- `editingTitle` state - activated by double-clicking the title or clicking ✏️
- Title saved on blur or Enter key
- Up/Down buttons reorder chapters and re-assign `.order` field
- Delete with confirmation

#### `LessonEditorModal`

Full-screen modal (z-50) with two sections:

**Section 1 - Basic fields:**
- Title (auto-generates slug when empty)
- Slug (manual override)
- Tool Name
- Lesson Number
- Read Time (min)
- Difficulty
- Unlock Rule (sequential / free / after quiz / manual)
- Intro textarea
- Checkboxes: Free lesson / Visible / Locked

**Section 2 - Content Builder:**
- `AddBlockSelect` - native `<select>` dropdown listing all 16 block types
- Block list with preview text, ↑/↓ reorder, Edit, ✕ delete
- Clicking Edit opens `BlockEditorModal` for that block
- Adding a new block immediately opens `BlockEditorModal` for it

#### `BlockEditorModal` (z-60, above the lesson modal)

Type-specific field editor via `BlockFieldEditor` switch. Opens on top of `LessonEditorModal`. Fields per type:

| Block type | Fields in editor |
|---|---|
| heading | Level (H1/H2/H3) + Text |
| paragraph | Content (HTML textarea, 5 rows) |
| highlightBox | Icon (emoji) + Title + Content |
| prompt | Label + Prompt Text + Try In Tool (select) |
| image | Image URL + Alt Text + Caption |
| video | YouTube/Vimeo URL + Caption |
| code | Language + Code (monospace textarea, 6 rows) + Caption |
| callout | Variant (select) + Title + Content |
| comparison | Left Title + Right Title + Left Items (textarea, one per line) + Right Items |
| checklist | Items (textarea, one per line - existing IDs preserved, new lines get new IDs) |
| download | Label + File URL + File Type + Size |
| quiz | Question + Options (add/remove) with radio for correct + Explanation |
| faq | FAQ items (add/remove) each with Question + Answer |
| aiToolCard | Tool Name + Logo Color (color picker) + Initials + Description + Try Link |
| table | Headers (comma-separated) + Rows (pipe-separated, one per line) |
| divider | No fields - informational message only |

#### `createDefaultBlock(type)`

Factory that returns a correctly typed block with `id: generateId()` and sensible default values. Called when a block type is selected in `AddBlockSelect`.

#### `BlockPreview(block)` helper

Returns a human-readable one-line preview string shown in the block list. Examples:
- Heading: `"H2: Try This Prompt"`
- Paragraph: first 60 chars of text (HTML stripped)
- Quiz: first 60 chars of the question
- FAQ: `"3 FAQ item(s)"`
- Table: `"5 row(s) × 3 col(s)"`

### Tab: Page Content

Edits the `hero`, `newsletter`, and `upsell` fields of `TutorialPageData`.

- **Hero:** Badge text, heading line 1, heading line 2, stats array (add/remove/edit value+label), show graphic toggle
- **Newsletter strip:** Show toggle, heading, input placeholder, button label
- **Upsell CTA:** Show toggle, heading, subtitle, three button labels

---

## 8. Routes

Defined in `src/App.tsx`:

```tsx
// Public
<Route path="/tutorials"               element={<Tutorials />} />
<Route path="/tutorials/:slug"          element={<TutorialPage />} />
<Route path="/tutorials/:slug/:lesson"  element={<TutorialPage />} />

// Protected (inside PrivateRoute)
<Route path="/admin/tutorials"          element={<TutorialsAdmin />} />
```

`/tutorials/:slug` with no lesson segment triggers the auto-redirect in `TutorialPage` to the first lesson.

### URL structure

```
/tutorials                          ➞ Listing page
/tutorials/chatgpt                  ➞ Auto-redirects to first lesson
/tutorials/chatgpt/what-is-ai       ➞ Lesson reader (lesson slug in URL)
/tutorials/chatgpt/how-chatgpt-works ➞ Different lesson
```

---

## 9. Design Tokens & CSS Rules

All `TutorialPage` and `BlockRenderer` components follow the design system from `globals.css`. No Tailwind `@apply` - uses CSS variables via `style={}` props or Tailwind utilities.

### CSS variables used

```css
--navy:     #020818   /* page bg, sidebar bg */
--electric: #00D4FF   /* active states, TOC highlight, headings in some blocks */
--orange:   #FF6B2B   /* FREE badge bg start, btn-primary gradient start */
--orange2:  #FF9500   /* btn-primary gradient end */
--white:    #F0F4FF   /* primary text */
--muted:    #8A9BC0   /* secondary text, disabled states */
--card:     rgba(255,255,255,0.045)
--border:   rgba(255,255,255,0.09)
--font-head: 'Space Grotesk', sans-serif
--font-body: 'Plus Jakarta Sans', sans-serif
```

### Montserrat font

Used for lesson `<h1>` and chapter heading in sidebar:
```tsx
fontFamily: 'Montserrat, var(--font-head)'
```
Montserrat is loaded in `index.html` via Google Fonts (added in Phase 1).

### Sidebar backgrounds

Both sidebars use `rgba(2,6,18,0.97)` - slightly elevated above the navy page background for visual separation without breaking the dark theme.

### Utility classes used in tutorial components

| Class | Applied to |
|---|---|
| `.glass-card` | Quiz, FAQ, Comparison, Download, AI Tool Card, admin modals |
| `.btn-primary` | Mark Complete, Save Changes, modal save buttons |
| `.btn-outline` | Cancel buttons, Back links |
| `.btn-electric` | (not used in tutorial - reserved for navbar) |

### No UI libraries

All modals, accordions, dropdowns, and interactive elements are built with raw HTML + CSS variables. No Radix, no Headless UI, no Shadcn.

---

## 10. Data Flow Diagram

```
Admin panel (TutorialsAdmin.tsx)
  │
  │  user edits ➞ setData(newData)  [in-memory]
  │
  ├── "Save Changes" clicked
  │     └── saveTutorialData(data) ➞ localStorage['primAI_tutorials']
  │
  │
Public site (TutorialPage.tsx, Tutorials.tsx)
  │
  └── loadTutorialData()
        ├── localStorage['primAI_tutorials'] ➞ parse ➞ return
        └── (if empty/error) ➞ DEFAULT_TUTORIAL_DATA from tutorialData.ts
```

```
TutorialPageData
  ├── hero          ➞ Tutorials.tsx listing page header
  ├── categories    ➞ Tutorials.tsx filter sidebar
  ├── tutorials[]
  │     ├── (basic fields)    ➞ Tutorials.tsx card rendering
  │     ├── chapters[]
  │     │     └── lessons[]
  │     │           └── blocks[] ➞ TutorialPage.tsx ➞ BlockRenderer
  │     └── toolsAndStats    ➞ TutorialPage.tsx right sidebar
  ├── newsletter    ➞ Tutorials.tsx newsletter strip
  └── upsell        ➞ Tutorials.tsx upsell CTA section
```

---

## 11. Adding New Content - Step-by-Step

### Add a new tutorial with lessons

1. Go to `/admin/tutorials` ➞ **Tutorials** tab ➞ **+ Add Tutorial**
2. Fill: Tool Name, select a Category, set Difficulty and order
3. Save Changes (persists basic tutorial card)
4. Switch to **Lessons** tab ➞ select the new tutorial from dropdown
5. Click **+ Add Chapter** ➞ double-click to rename
6. Inside the chapter ➞ click **+ Add Lesson** ➞ `LessonEditorModal` opens
7. Fill: Title (slug auto-generates), Lesson #, Read Time, intro
8. In Content Builder ➞ **+ Add Block** dropdown ➞ select block type ➞ `BlockEditorModal` opens
9. Fill block fields ➞ **Save Block** ➞ block appears in list
10. Repeat for all blocks ➞ **Save Lesson**
11. Click **Save Changes** at the top-right

### Add a block type to an existing lesson

1. Admin ➞ **Lessons** tab ➞ select tutorial
2. Find the lesson ➞ click **Edit**
3. In Content Builder ➞ `+ Add Block` ➞ choose type
4. Fill fields in `BlockEditorModal` ➞ **Save Block**
5. Reorder with ↑/↓ arrows if needed
6. **Save Lesson** ➞ **Save Changes**

### Add a heading for TOC

Use a `Heading` block (H2 or H3). It will automatically:
- Appear in the right-sidebar TOC on the lesson reader
- Highlight as the active section during scroll
- Be navigable by clicking in the TOC

### Update default data (checked into code)

Edit `DEFAULT_TUTORIAL_DATA` in `src/data/tutorialData.ts` directly. This affects all users who have never opened the admin (fresh installs, cleared localStorage). To push the update to existing users, they must clear localStorage or the admin must re-save.

---

## 12. Phase 3 Roadmap

Features not yet built, in rough priority order:

### High priority

| Feature | Notes |
|---|---|
| Persist `completedIds` to localStorage | Key: `primAI_progress_{tutorialSlug}` - survives page refresh |
| Persist checklist checked state | Store per-lesson in same progress key |
| Unlock rule enforcement | `unlockRule: 'sequential'` should actually lock subsequent lessons until prior is marked complete |
| Mobile TOC | Drawer or bottom sheet - right sidebar hidden on mobile currently |
| Progress bar in left sidebar | `completed / total` ratio per chapter |

### Medium priority

| Feature | Notes |
|---|---|
| Search within tutorial | Filter lesson list in sidebar by keyword |
| Multiple chapters per tutorial | Data model supports it already - just add more chapters via admin |
| Backend API for tutorial data | Replace localStorage with `GET /api/tutorials` + `PATCH /api/tutorials` |
| Image upload in admin | Currently requires a hosted URL - add S3/Cloudinary integration |
| Certificate on tutorial completion | Generate a PDF or show a shareable page when all lessons complete |

### Low priority / Phase 4

| Feature | Notes |
|---|---|
| Comments / discussion per lesson | Requires backend + auth for public users |
| Video hosting | Integrate Mux or Bunny.net for self-hosted video instead of YouTube |
| AI-generated lesson summaries | Hit Claude API from admin to draft lesson content |
| Multi-language support | i18n for lesson blocks |
| Analytics | Track which lessons have most drop-offs |

---

*End of TUTORIAL.md*
