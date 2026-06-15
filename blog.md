# Blog Module - Build Log & Architecture Notes

**Date:** 15 June 2026  
**Developer:** Mouryrajsinh Jadeja  
**Project:** PRIM AI Institute  
**Commit:** `7fb640d`

---

## What Was Built

A full-stack blog system in four parts:

1. **Media Upload Module** - backend image pipeline (WebP conversion via `sharp`, DigitalOcean Spaces CDN)
2. **Blog CRUD API** - NestJS backend with public + admin routes for posts, categories, tags, authors
3. **Public Frontend** - `/blog` listing page + `/blog/:slug` post detail page
4. **Admin Frontend** - blog post list + TipTap rich-text editor at `/admin/blog`

Everything is TypeScript-strict, zero `any` types, zero compilation errors on both backend and frontend.

---

## Why a Blog? Why Now?

The contact form and demo booking system capture leads who are already interested. The blog serves a different funnel stage - it brings in people who are searching for terms like *"how to use ChatGPT for work"* or *"AI tools for students"*, turns them into readers, and then converts them via the existing `DemoModal` CTA that lives in the Navbar.

Content marketing is how PRIM AI gets organic traffic without paying per click. One good article can keep generating leads for years.

---

## Backend - Architecture Decisions

### Prisma Schema Design

Five new models were added to `schema.prisma`:

```prisma
BlogPost → belongs to BlogCategory and BlogAuthor
BlogPost → many-to-many with BlogTag via BlogPostTag (join table)
BlogCategory → has many BlogPosts
BlogTag → has many BlogPosts (through join table)
BlogAuthor → has many BlogPosts
```

**Why a join table (`BlogPostTag`) instead of a scalar array?**  
Prisma + PostgreSQL supports proper relational many-to-many. A join table lets you query "all posts with tag X" efficiently with an index. A JSON array of tag names would require a full table scan. Since the blog will grow to hundreds of posts, this matters.

**Why `content String @db.Text`?**  
TipTap generates HTML. A full article with formatting, code blocks, and headings can easily exceed Prisma's default `varchar(191)` or `varchar(255)` limit. `@db.Text` maps to PostgreSQL's unlimited `TEXT` column. Never use `String` for rich HTML content.

**Why separate `BlogAuthor` instead of linking to `Admin`?**  
Admins are the people who log into the dashboard. Authors are the people whose name appears on published articles. These could be industry guests, different team members, or even the "PRIM AI Team" persona. Keeping them separate means you can publish as a named expert without that person having admin access.

**Why `publishedAt DateTime?` separate from `status BlogStatus`?**  
Status controls visibility (`DRAFT` = hidden, `PUBLISHED` = live). `publishedAt` records the *exact moment* it went live. These are different concepts. If you save a draft on Monday and publish it Wednesday, the publish date is Wednesday - that's what shows up in the article header and gets used for SEO `datePublished` meta. The status field gives you a quick `WHERE status = PUBLISHED` filter without date math.

**The `readTimeMin Int @default(0)` field:**  
Stored at write time, not computed at read time. Every time you save a post, the service strips HTML tags, counts words, divides by 200 (average adult reading speed in WPM), and rounds up. Storing it means the blog listing page can show "5 min read" without parsing HTML on every request.

---

### Media Module (`backend/src/media/`)

**Why `sharp` for WebP conversion?**  
`sharp` is the fastest Node.js image processing library. It uses `libvips` under the hood which is significantly faster than ImageMagick or Jimp. WebP files are typically 25–35% smaller than JPEG at equivalent visual quality, which matters for Core Web Vitals (LCP score). Smaller cover images = faster page loads = better SEO.

**Three variants, not one:**

| Variant | Dimensions | Use case |
|---|---|---|
| `cover` | 1600×900px (16:9, cropped) | Blog post cover images |
| `content` | 1200px wide (aspect preserved) | Inline article images |
| `avatar` | 200×200px (square, cropped) | Author profile photos |

The caller passes `?variant=cover` (or `content` or `avatar`) as a query param to the upload endpoint. The editor uses `cover` for the featured image dropzone. The frontend could use `content` for inline images in the future. `avatar` is ready for the author management UI.

**Why DigitalOcean Spaces and not Supabase Storage or S3?**  
The project is already using Neon (PostgreSQL) and planning Railway (backend hosting). DigitalOcean Spaces is S3-compatible - same SDK, same API calls - but with predictable flat pricing. The `@aws-sdk/client-s3` works with DO Spaces by just changing the `endpoint` URL. No vendor lock-in.

**Why `memoryStorage()` instead of disk storage for multer?**  
`memoryStorage()` holds the uploaded file in RAM as a `Buffer`. This is passed directly to `sharp` without writing to disk first. On Railway (or any container), there's no guarantee of persistent disk between requests. Writing temp files to disk and then reading them back adds two unnecessary I/O operations. RAM → sharp → S3 is the cleanest path.

**The 8 MB cap:**  
The multer `limits: { fileSize: 8 * 1024 * 1024 }` config rejects oversized files before they even reach the controller. This protects against accidental uploads of 50 MB RAW photos that would spike memory.

**`CacheControl: 'public, max-age=31536000, immutable'`:**  
Once an image is uploaded to DO Spaces with a unique timestamped filename, it never changes. The `immutable` directive tells CDN edge nodes and browsers they can cache this file forever. This is what makes the CDN fast - subsequent visitors hit the edge cache, not the origin.

---

### Blog Service (`backend/src/blog/blog.service.ts`)

**Why a `flattenTags` helper?**  
Prisma's join table query returns `tags: [{ tag: { id, name, slug } }]` - a nested structure because it's selecting through the join model. Every consumer of the API expects `tags: [{ id, name, slug }]`. The `flattenTags` function strips the extra nesting once, at the service boundary, so the controller and every API client get clean data.

**Why `$transaction([findMany, count])` for list endpoints?**  
Without a transaction, two separate queries could return inconsistent totals - a post could be created between the `findMany` and `count` calls. The transaction ensures both queries run against the same database snapshot. It also saves a round trip: both queries execute in one database call.

**`calcReadTime(html)` - stripping HTML before counting words:**  
```typescript
const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const words = text.split(' ').filter((w) => w.length > 0).length;
return Math.max(1, Math.ceil(words / 200));
```
If you count words in raw HTML you'll count `<strong>`, `</p>`, `class="..."` as words. The regex replaces every HTML tag with a space (not empty string, to avoid `"word</p>word"` becoming `"wordword"`), then collapses whitespace. `Math.max(1, ...)` ensures articles shorter than 200 words still show "1 min read" instead of "0 min read".

**Route ordering in the controller - fixed paths before `:slug`:**  
```
GET blog/categories   ← registered FIRST
GET blog/tags         ← registered SECOND
GET blog/:slug        ← registered LAST
```
NestJS matches routes in declaration order. If `blog/:slug` came first, a request to `blog/categories` would be captured with `slug = "categories"` and fail with a 404 from `findBySlug`. This is the same principle as the `admin/bookings/export` rule in CLAUDE.md - specific paths must come before parameterized ones.

---

## Frontend - Architecture Decisions

### `api/blog.ts`

A dedicated API client file (not mixed into `admin.ts`) because:
- Blog has both public and admin endpoints - `admin.ts` is JWT-only
- The public endpoints are called from `BlogListing.tsx` and `BlogPost.tsx` which are public pages with no auth
- Keeping it separate makes it clear which functions need auth and which don't

The `uploadMedia()` function in this file uses `multipart/form-data` with a manually built `FormData` object. The Axios instance already has the JWT interceptor attached (reads from Zustand `authStore`), so the auth header is added automatically.

---

### `ImageUploadDropzone.tsx`

**Why not a library component?**  
CLAUDE.md rule: "No UI libraries - no shadcn, no MUI, no Radix, no Headless UI." A dropzone from a library would bring styling conflicts and fight against the navy/glass design system. Custom component = exact control over colors, transitions, and error states.

**State machine:**
```
idle (no value) → dragging → uploading → success (value set) → toast shown
idle (no value) → error state → retry available
value present → hover shows Replace / Remove overlay
```

**Why `useRef` for the hidden input?**  
The file input is hidden (`className="hidden"`) and triggered programmatically via `inputRef.current?.click()`. This avoids the ugly default file input styling while keeping the native file picker working. The `e.target.value = ''` after reading the file resets the input so selecting the same file again fires a new `onChange` event.

**`e.preventDefault()` on `onDragOver`:**  
Without this, the browser's default drag behavior takes over and shows a "no drop" cursor. The `preventDefault()` tells the browser "I'm handling this drop myself."

---

### `BlogListing.tsx` (`/blog`)

**Page structure:**
```
Hero section (badge, h1, search form)
Category filter pills (all, then each category with post count)
3-col responsive grid (1 col mobile → 2 col tablet → 3 col desktop)
Pagination (numbered buttons)
Empty state (different messages for search vs. no posts)
Skeleton loading state (pulse animation, matches card dimensions)
```

**Why client-side search triggers a new API call, not local filtering?**  
The listing page fetches one page at a time (9 posts). If there are 50 posts and you filter client-side, you only filter the 9 you fetched, missing the other 41. The search form submission updates the `search` state which triggers a new `fetchPublicPosts()` call with the search term. The backend does `ILIKE` on title and excerpt.

**Skeleton cards vs. spinner:**  
Skeleton cards preserve the page layout during load so content doesn't jump in. A spinner would show a blank area while loading. Skeleton cards give users a preview of the content shape, which feels faster even if it takes the same time.

**`useCallback` on the `load` function:**  
Without `useCallback`, the `load` function would be recreated on every render. Since `load` is in the `useEffect` dependency array, this would cause an infinite re-render loop (render → new `load` → effect runs → state changes → render → ...). `useCallback` memoizes it and only recreates when `page`, `search`, or `activeCategory` change.

---

### `BlogPost.tsx` (`/blog/:slug`)

**`ReadingProgressBar`:**  
A fixed-position bar under the Navbar (`top-16 = 4rem`) that fills left-to-right as you scroll. Calculation:
```typescript
const progress = (scrollY / (docHeight - windowHeight)) * 100;
```
Uses `{ passive: true }` on the scroll event listener so the browser knows this handler never calls `preventDefault()` and can optimize scrolling performance. Progress bar transitions have `duration-100` (0.1s) to feel responsive without being laggy.

**How the "ON THIS PAGE" Table of Contents is built - complete data flow:**

```
TipTap editor (admin writes H2/H3 headings)
        ↓
HTML string stored in PostgreSQL  content TEXT
  e.g. "<h2>What is AI?</h2><p>...</p><h2>How it works</h2>..."
        ↓
GET /api/blog/:slug  →  { content: "<h2>What is AI?...</h2>" }
        ↓ (arrives in BlogPost.tsx)
buildToc(content)  →  TocItem[]   (sidebar data)
injectIds(content) →  HTML string  (rendered article)
        ↓
dangerouslySetInnerHTML renders the injected HTML into the DOM
        ↓
IntersectionObserver watches the injected id="heading-N" elements
        ↓
Active heading highlights in the sidebar TOC as you scroll
```

**Pass 1 - `buildToc(html)`: extract heading text for the sidebar**

```typescript
interface TocItem { id: string; text: string; level: number; }

function buildToc(html: string): TocItem[] {
  const parser = new DOMParser();                      // browser's built-in HTML parser
  const doc = parser.parseFromString(html, 'text/html'); // parse the raw HTML string into a DOM
  const headings = doc.querySelectorAll('h2, h3');     // find every H2 and H3 in order
  return Array.from(headings).map((h, i) => ({
    id: `heading-${i}`,          // sequential: heading-0, heading-1, heading-2...
    text: h.textContent ?? '',   // the visible text inside the tag (strips any inner HTML)
    level: parseInt(h.tagName[1], 10), // h.tagName is "H2" or "H3" → parseInt("2") = 2
  }));
}
```

`DOMParser` is the key. The `html` variable is a raw string like `"<h2>What is AI?</h2><p>Text</p><h3>History</h3>"`. You cannot reliably extract heading text with a regex because headings can contain `<strong>`, `<em>`, or `<a>` tags inside them. `DOMParser` gives you a real DOM where `h.textContent` gives the clean text with all inner tags stripped.

The result is an array like:
```
[
  { id: 'heading-0', text: 'What is AI?', level: 2 },
  { id: 'heading-1', text: 'A Brief History', level: 3 },
  { id: 'heading-2', text: 'How it Works Today', level: 2 },
  ...
]
```
This array is stored in React state (`tocItems`) and rendered in the `TableOfContents` sidebar component. Each item becomes an `<a href="#heading-N">` link.

**Pass 2 - `injectIds(html)`: add anchor IDs to the rendered article HTML**

```typescript
function injectIds(html: string): string {
  let index = 0;
  return html.replace(
    /<(h[23])([ >])/g,          // matches <h2 or <h3 followed by a space or >
    (_match, tag, rest) => {
      return `<${tag} id="heading-${index++}"${rest}`;
      // inserts: id="heading-0", id="heading-1", etc.
      // index++ increments AFTER each replacement → same order as buildToc
    }
  );
}
```

The regex `/<(h[23])([ >])/g` does two things at once:
- `h[23]` - matches `h2` or `h3` only (not `h1`, `h4`, `h5`, `h6`)
- `([ >])` - captures what comes immediately after the tag name: either a space (meaning attributes follow, e.g. `<h2 class="..."`) or `>` (meaning the tag closes immediately, e.g. `<h2>`)

The captured `rest` is put back verbatim, so `<h2 class="foo">` becomes `<h2 id="heading-0" class="foo">` and `<h2>` becomes `<h2 id="heading-0">`. The original attributes are never lost.

The `index++` counter starts at 0, just like the `map((h, i) => ...)` counter in `buildToc`. Both iterate H2 and H3 elements in document order. **This is why the IDs stay in sync** - both functions count headings in the same order from the same source HTML.

The returned string is assigned to `processedContent` and passed to `dangerouslySetInnerHTML`. After React renders it, the DOM has real elements like `<h2 id="heading-0">What is AI?</h2>` that the `IntersectionObserver` can query by ID.

**Why two separate passes, not one?**

`buildToc` needs to extract heading *text* (for the sidebar label) and assign an *id* (for the anchor link).  
`injectIds` needs to inject those same *ids* into the rendered HTML.

Combining them into one function is not possible because they work on two different things:
- `buildToc` works on a parsed DOM object (`DOMParser` → `querySelectorAll`)
- `injectIds` works on a raw string (regex replace → new string returned to `dangerouslySetInnerHTML`)

You can't `dangerouslySetInnerHTML` a DOM object - it must be a string. And you can't do `querySelectorAll` on a raw string. So they're separate: one parses for data, one rewrites the string for rendering.

**`IntersectionObserver` - tracking the active heading**

```typescript
useEffect(() => {
  if (!tocItems.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) setActiveId(visible[0].target.id); // first visible = active
    },
    { rootMargin: '-80px 0px -60% 0px' }
    //             ↑         ↑
    //         top offset  bottom offset
  );
  document.querySelectorAll('[id^="heading-"]').forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}, [tocItems, post]);
```

`document.querySelectorAll('[id^="heading-"]')` uses the CSS attribute selector `[id^="heading-"]` which means "elements whose `id` starts with `heading-`". This works because `injectIds` already injected those IDs into the DOM via `dangerouslySetInnerHTML`.

**The `rootMargin: '-80px 0px -60% 0px'` explained:**

The `rootMargin` shrinks the observation viewport (like CSS margin, but subtractive):
```
'-80px 0px -60% 0px'
   ↑               → top: subtract 80px (accounts for fixed Navbar height)
         ↑         → right: no change
              ↑    → bottom: subtract 60% of viewport height
                 ↑ → left: no change
```

Without the `-80px` top margin: a heading becomes "active" the moment it scrolls behind the Navbar, before the user can even see it.

Without the `-60%` bottom margin: any heading that's anywhere on screen counts as "active", so at the bottom of the page where content is sparse, multiple headings trigger at once and the sidebar flickers.

With these settings, a heading only becomes "active" when it's in the narrow band between 80px from the top and 40% from the top. That's the reading zone - where your eyes actually are while scrolling. The result is that the TOC item that highlights is always the section you're currently reading.

**Where the heading text comes from (tracing it to the source)**

The user types in the TipTap editor. When they press Enter and select "Heading 2" from the toolbar, TipTap wraps that text in `<h2>` tags internally. When `handleSave()` is called:

```typescript
const content = editor.getHTML(); // → "<h2>What is AI?</h2><p>...</p>"
await adminSavePost({ ..., content });
```

The backend receives this HTML string and stores it directly in the `content TEXT` column in PostgreSQL. No transformation, no sanitisation (the admin is trusted). On read, `findBySlug()` returns the raw HTML string back to the frontend.

So the TOC items are literally whatever H2 and H3 headings the admin typed in the TipTap editor. If an article has no H2 or H3 headings, `buildToc` returns `[]` and `TableOfContents` renders nothing (`if (!items.length) return null`). The sidebar collapses gracefully.

**70/30 layout:**  
`flex-1 min-w-0` (article, 70%) + `w-72 shrink-0` (sidebar, ~30%). The sidebar is `hidden lg:flex` - it only appears on large screens. On mobile, the sidebar content (TOC, share, author) is omitted entirely rather than stacking, keeping the mobile reading experience clean.

**`ShareButtons` - `navigator.clipboard.writeText`:**  
The clipboard API requires HTTPS in production (or `localhost` in dev). Since the site deploys to Vercel (HTTPS), this works correctly in production. The Twitter and LinkedIn links use standard web intent URLs that open the platform's share dialog.

---

### `BlogPosts.tsx` (`/admin/blog`)

Admin list table with these columns: thumbnail, title/slug, category badge, status badge, read time, published date, actions.

**Why `window.confirm` for delete instead of a modal?**  
A custom modal would add complexity (open state, animation, confirm button). For a destructive action in an admin panel - not a public-facing UI - the native browser confirm dialog is fast to implement, clearly communicates permanence ("This cannot be undone"), and requires no styling. Admin users understand browser dialogs.

**`deletingId` state instead of a global `deleting` boolean:**  
If you had multiple rows and clicked delete on two at once (unlikely but possible), a single boolean would leave the wrong row showing the disabled state. Tracking the specific ID being deleted means only that row's button is disabled during the API call.

---

### `BlogPostEditor.tsx` (`/admin/blog/new` + `/admin/blog/:id/edit`)

The most complex component in the project. Two-column layout: main content area (left, scrollable) + publishing sidebar (right, fixed width).

**TipTap configuration:**
```typescript
extensions: [
  StarterKit,           // bold, italic, strike, headings, lists, blockquote, code, HR
  Underline,            // not in StarterKit by default
  TiptapLink,           // clickable links with URL editing
  Placeholder,          // "Write your article here…" ghost text
  CharacterCount,       // word count for read-time estimate
]
```
`StarterKit` is TipTap's batteries-included bundle. Only the extensions not in it were added individually. This keeps the bundle small.

**Why `openOnClick: false` on the Link extension?**  
In the editor, clicking a link would navigate away from the page. `openOnClick: false` disables that - links are only navigable in the published public view. The editor shows links visually (cyan underlined) but keeps focus in the editor when clicked.

**Slug auto-generation:**  
```typescript
function toSlug(text: string) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // strip special chars
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/-+/g, '-')            // collapse multiple hyphens
    .slice(0, 100);                 // max length
}
```
The `slugManual` boolean tracks whether the user has manually edited the slug. If they haven't, typing in the title automatically updates the slug. Once they manually edit the slug field, auto-generation stops - they've taken control.

**`QuickAddInput` component for categories/tags/authors:**  
Instead of a separate settings page, admins can create new categories, tags, and authors inline while writing a post. The `adminCreateCategory()` API call runs, the new item is added to local state, and it's selected immediately. This is the "happy path" - zero context switching.

**`handleSave(publishNow = false)`:**  
Two entry points: "Publish Now" button (passes `publishNow = true`) and "Save Draft" button (passes default `false`). Both call the same function. If `publishNow = true`, the status in the API payload is forced to `PUBLISHED` regardless of the radio button state. This lets the admin save a draft multiple times and then publish with a single confident click.

**Why `useCallback` on `loadRefs`:**  
`loadRefs` fetches categories, tags, and authors. It's called in `useEffect` which would cause an infinite loop if `loadRefs` wasn't memoized. `useCallback` with empty deps `[]` means it's created once and never recreated.

**The `isValid` check:**  
```typescript
const isValid = title.trim().length >= 5 && slug.trim().length >= 3 && categoryId && authorId;
```
Save buttons are `disabled` when invalid. This prevents saving a post with no title, no slug, no category, or no author - all of which would fail backend validation anyway. Catching it in the UI gives instant feedback instead of an API error.

---

## Navbar - Why "Blog" is Hardcoded

All other nav links (`Home`, `About`, `Courses`, `Contact`) come from `useSettingsStore` - they're editable by the admin via the Settings page. `Blog` is hardcoded as the string `'Blog'` because:

1. The blog is a structural section, not marketing copy that changes
2. It would need its own settings key (`nav_link_blog`) in the `PUBLIC_KEYS` set and seed data - added complexity with no real benefit
3. Admins don't need to rename "Blog" - that would confuse visitors

This is consistent with the Sidebar where "Blog Posts" is also a hardcoded string.

---

## What Is NOT Included (and Why)

**SEO meta tags (`<head>` updates):**  
Each blog post should have `<title>`, `<meta name="description">`, `og:image`, `og:title`, `datePublished`, `author` schema. This requires either React Helmet or a framework-level solution. Left out of Phase 2 scope - will be added when the site moves to SSR or adds a head management library.

**Blog post preview (frontend before publishing):**  
The editor shows the raw TipTap output. A "Preview" mode would render the HTML in the same `prose-blog` CSS as the public post. Nice to have but not critical for a Phase 2 launch - you can preview by publishing as `DRAFT` and navigating to the post URL directly (the public page is accessible to anyone with the URL even in DRAFT status... actually wait - no it isn't. The `findBySlug` service filters `status: BlogStatus.PUBLISHED`. So drafts are truly private.)

**Image uploads inside article body:**  
TipTap has an Image extension (`@tiptap/extension-image`) that's not installed. Inline images in articles would need the `ImageUploadDropzone` to be embedded inside the editor toolbar. The cover image dropzone is functional. Inline images are Phase 3 scope.

**Comments:**  
Not planned for this project.

**RSS feed:**  
Phase 3. Would be a NestJS endpoint returning XML using the `rss` npm package, fed from `listPublished()`.

---

## Checklist - What to Do Before Going Live

- [ ] Set `DO_SPACES_KEY`, `DO_SPACES_SECRET`, `DO_SPACES_ENDPOINT`, `DO_SPACES_BUCKET`, `DO_SPACES_CDN_URL` in Railway environment variables
- [ ] Run `npx prisma migrate deploy` on the production database (Neon) - the `20260615070745_add_blog_module` migration must be applied
- [ ] Create at least one BlogCategory, BlogAuthor, and BlogPost via the admin panel at `/admin/blog`
- [ ] Create the DigitalOcean Space named `primai-media` with public read access
- [ ] Enable CDN for the Space in the DO dashboard (this activates the CDN URL)
- [ ] Add `FRONTEND_URL=https://yourdomain.com` to Railway env so the CORS policy allows the production domain

---

## File Index

```
backend/prisma/schema.prisma                      ← 5 new models + BlogStatus enum
backend/prisma/migrations/20260615070745_*/       ← migration SQL applied to local DB
backend/src/media/media.service.ts                ← sharp WebP pipeline + S3 upload
backend/src/media/media.controller.ts             ← POST admin/media/upload
backend/src/media/media.module.ts                 ← NestJS module
backend/src/blog/dto/create-blog-post.dto.ts      ← class-validator DTO
backend/src/blog/dto/update-blog-post.dto.ts      ← PartialType of create
backend/src/blog/dto/create-category.dto.ts       ← category DTO
backend/src/blog/dto/create-tag.dto.ts            ← tag DTO
backend/src/blog/dto/create-author.dto.ts         ← author DTO
backend/src/blog/blog.service.ts                  ← all business logic
backend/src/blog/blog.controller.ts               ← public + admin routes
backend/src/blog/blog.module.ts                   ← NestJS module
backend/src/app.module.ts                         ← MediaModule + BlogModule registered

frontend/src/styles/globals.css                   ← --gold var + .glass-card inset shadow
frontend/src/api/blog.ts                          ← typed API client (public + admin)
frontend/src/components/admin/ImageUploadDropzone.tsx ← drag-drop WebP uploader
frontend/src/pages/BlogListing.tsx                ← /blog public listing
frontend/src/pages/BlogPost.tsx                   ← /blog/:slug public detail
frontend/src/pages/admin/BlogPosts.tsx            ← /admin/blog list table
frontend/src/pages/admin/BlogPostEditor.tsx       ← /admin/blog/new + /admin/blog/:id/edit
frontend/src/components/layout/Navbar.tsx         ← Blog link added
frontend/src/components/admin/Sidebar.tsx         ← Blog Posts link added
frontend/src/App.tsx                              ← 5 new routes wired
```
