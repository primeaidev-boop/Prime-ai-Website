import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { fetchPostBySlug, fetchPublicPosts, type BlogPost as BlogPostType } from '@/api/blog';
import { sanitizeHtml } from '@/lib/sanitize';

// ─── Reading progress bar ──────────────────────────────────────────────────

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-16 left-0 right-0 z-30 h-0.5" style={{ background: 'var(--border)' }}>
      <div
        className="h-full transition-all duration-100"
        style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--electric), var(--orange))' }}
      />
    </div>
  );
}

// ─── Table of contents ─────────────────────────────────────────────────────

interface TocItem { id: string; text: string; level: number; }

function buildToc(html: string): TocItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headings = doc.querySelectorAll('h2, h3');
  return Array.from(headings).map((h, i) => ({
    id: `heading-${i}`,
    text: h.textContent ?? '',
    level: parseInt(h.tagName[1], 10),
  }));
}

function injectIds(html: string): string {
  let index = 0;
  return html.replace(/<(h[23])([ >])/g, (_match, tag, rest) => {
    return `<${tag} id="heading-${index++}"${rest}`;
  });
}

function TableOfContents({ items, activeId }: { items: TocItem[]; activeId: string }) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!activeId || !navRef.current) return;
    const el = navRef.current.querySelector<HTMLElement>(`[href="#${activeId}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeId]);

  if (!items.length) return null;

  return (
    <div
      className="glass-card p-5 rounded-2xl sticky top-24 flex flex-col"
      style={{ maxHeight: 'calc(100vh - 8rem)' }}
    >
      <h4 className="text-xs font-bold uppercase tracking-widest mb-4 shrink-0" style={{ color: 'var(--muted)' }}>
        On this page
      </h4>
      <nav ref={navRef} className="overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`toc-link${activeId === item.id ? ' toc-active' : ''}`}
            style={{ paddingLeft: item.level === 3 ? '0.75rem' : 0 }}
          >
            <span className="toc-bar" />
            <span className="toc-text">{item.text}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

// ─── Share buttons ─────────────────────────────────────────────────────────

function ShareButtons({ title }: { title: string }) {
  const url = window.location.href;
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(url)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
      .catch(() => {});
  }

  return (
    <div className="flex flex-col gap-4 w-full md:w-auto shrink-0">
      <span className="text-xs font-semibold uppercase" style={{ color: 'var(--orange2)', letterSpacing: '2.5px' }}>
        Share Research
      </span>
      <div className="flex gap-3">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
          target="_blank" rel="noopener noreferrer"
          title="Share on X (Twitter)"
          className="share-btn w-10 h-10 rounded-full flex items-center justify-center"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank" rel="noopener noreferrer"
          title="Share on LinkedIn"
          className="share-btn w-10 h-10 rounded-full flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
        <button
          onClick={copyLink}
          title="Copy link"
          className="share-btn w-10 h-10 rounded-full flex items-center justify-center"
          style={copied ? { background: 'rgba(0,212,255,0.2)', color: 'var(--electric)', borderColor: 'rgba(0,212,255,0.5)' } : undefined}
        >
          <LinkIcon size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Author bio ────────────────────────────────────────────────────────────

function AuthorBio({ author }: { author: BlogPostType['author'] }) {
  return (
    <div
      className="flex gap-5 flex-1 p-6 rounded-2xl"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.05)',
        maxWidth: '28rem',
      }}
    >
      {author.avatarUrl ? (
        <img
          src={author.avatarUrl}
          alt={author.name}
          loading="lazy"
          className="w-16 h-16 rounded-full object-cover shrink-0"
          style={{ border: '2px solid rgba(0,212,255,0.2)' }}
        />
      ) : (
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
          style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--electric)', border: '2px solid rgba(0,212,255,0.2)' }}
        >
          {author.name[0]}
        </div>
      )}
      <div className="flex flex-col gap-1.5 min-w-0">
        <h4 className="text-lg font-bold leading-tight" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>
          {author.name}
        </h4>
        {author.designation && (
          <span className="text-xs font-semibold uppercase" style={{ color: 'var(--electric)', letterSpacing: '1.5px' }}>
            {author.designation}
          </span>
        )}
        {author.bio && (
          <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--muted)' }}>{author.bio}</p>
        )}
      </div>
    </div>
  );
}

// ─── Keep Reading ──────────────────────────────────────────────────────────

function KeepReadingCard({ post }: { post: BlogPostType }) {
  return (
    <Link to={`/blog/${post.slug}`} className="keep-reading-card glass-card rounded-2xl overflow-hidden block">
      <div className="h-48 w-full relative overflow-hidden">
        <div
          className="absolute inset-0 z-10"
          style={{ background: 'linear-gradient(to top, var(--navy), transparent)' }}
        />
        {post.coverImageUrl ? (
          <img src={post.coverImageUrl} alt={post.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${post.category.color}15, ${post.category.color}05)` }}
          >
            <span className="text-4xl opacity-20">✍️</span>
          </div>
        )}
      </div>
      <div className="p-6 relative z-20">
        <div className="flex justify-between items-center mb-4">
          <span
            className="px-2 py-1 rounded-full text-xs font-bold"
            style={{
              background: post.category.color + '18',
              color: post.category.color,
              border: `1px solid ${post.category.color}33`,
            }}
          >
            {post.category.name}
          </span>
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              : ''}
          </span>
        </div>
        <h4
          className="keep-reading-title text-lg font-semibold leading-snug line-clamp-2 transition-colors duration-300"
          style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
        >
          {post.title}
        </h4>
      </div>
    </Link>
  );
}

function KeepReading({ posts }: { posts: BlogPostType[] }) {
  if (!posts.length) return null;
  return (
    <section className="max-w-6xl mx-auto px-6 md:px-12 pt-12 pb-20" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="flex items-center gap-4 mb-10">
        <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
        <h3 className="text-xs font-semibold uppercase" style={{ color: 'var(--orange2)', letterSpacing: '2.5px' }}>
          Keep Reading
        </h3>
        <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <KeepReadingCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchPostBySlug(slug)
      .then((data) => {
        setPost(data);
        if (data.content) setTocItems(buildToc(data.content));
        // Fetch latest posts (not filtered by category) so Keep Reading always has content
        return fetchPublicPosts({ limit: 4 });
      })
      .then((res) => {
        setRelatedPosts(res.posts.filter((p) => p.slug !== slug).slice(0, 3));
      })
      .catch(() => navigate('/blog'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  useEffect(() => {
    if (!tocItems.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -60% 0px' },
    );
    document.querySelectorAll('[id^="heading-"]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [tocItems, post]);

  if (loading) {
    return (
      <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>
        <ReadingProgressBar />
        <div className="pt-28 pb-20 px-6 md:px-12">
          <div className="max-w-6xl mx-auto animate-pulse">
            <div className="h-8 rounded mb-4" style={{ background: 'rgba(255,255,255,0.06)', width: '70%' }} />
            <div className="h-5 rounded mb-2" style={{ background: 'rgba(255,255,255,0.04)', width: '50%' }} />
            <div className="h-64 rounded-2xl mt-8" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const processedContent = post.content ? sanitizeHtml(injectIds(post.content)) : '';
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>
      <ReadingProgressBar />

      {/* Cover hero */}
      <div className="relative pt-16" style={{ minHeight: '420px' }}>
        {post.coverImageUrl ? (
          <>
            <img src={post.coverImageUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(2,8,24,0.4) 0%, rgba(2,8,24,0.95) 100%)' }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(255,107,43,0.06))' }}
          />
        )}

        <div className="relative z-10 px-6 md:px-12 pt-16 pb-12 max-w-6xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-white"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          <div className="mb-4 flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: post.category.color + '22', color: post.category.color, border: `1px solid ${post.category.color}44` }}
            >
              {post.category.name}
            </span>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag.id} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}>
                #{tag.name}
              </span>
            ))}
          </div>

          <h1
            className="text-3xl md:text-5xl font-bold leading-tight max-w-3xl"
            style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
          >
            {post.title}
          </h1>
          <p className="mt-4 text-lg max-w-2xl" style={{ color: 'var(--muted)' }}>{post.excerpt}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--muted)' }}>
            {post.showAuthor && (
              <>
                <div
                  className="flex items-center gap-2 rounded-full pl-1 pr-4 py-1"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  {post.author.avatarUrl ? (
                    <img src={post.author.avatarUrl} alt={post.author.name} loading="lazy" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--electric)' }}
                    >
                      {post.author.name[0]}
                    </div>
                  )}
                  <span className="font-medium" style={{ color: 'var(--white)' }}>{post.author.name}</span>
                </div>
                <div className="w-1 h-1 rounded-full" style={{ background: 'var(--muted)' }} />
              </>
            )}
            {formattedDate && <span>{formattedDate}</span>}
            <div className="w-1 h-1 rounded-full" style={{ background: 'var(--muted)' }} />
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{post.readTimeMin} min read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content + sidebar - 70/30 */}
      <div className="px-6 md:px-12 pb-16 max-w-6xl mx-auto">
        <div className="flex gap-8">
          {/* Article (70%) */}
          <article className="flex-1 min-w-0">
            <div
              ref={contentRef}
              className="prose-blog"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
            <div
              className={`mt-8 pt-8 flex flex-col md:flex-row gap-8 items-start${post.showAuthor ? ' justify-between' : ''}`}
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <ShareButtons title={post.title} />
              {post.showAuthor && <AuthorBio author={post.author} />}
            </div>
          </article>

          {/* Sidebar (30%) - TOC only */}
          <aside className="hidden lg:block w-72 shrink-0">
            <TableOfContents items={tocItems} activeId={activeId} />
          </aside>
        </div>
      </div>

      {/* Keep Reading - full-width, outside the 70/30 grid */}
      <KeepReading posts={relatedPosts} />

      <style>{`
        /* Article prose */
        .prose-blog { color: var(--white); line-height: 1.8; font-size: 1.0625rem; font-family: var(--font-body); }
        .prose-blog h2 { font-family: var(--font-head); font-size: 1.6rem; font-weight: 700; color: var(--white); margin: 2.5rem 0 1rem; }
        .prose-blog h3 { font-family: var(--font-head); font-size: 1.25rem; font-weight: 600; color: var(--white); margin: 2rem 0 0.75rem; }
        .prose-blog p { margin: 1.25rem 0; color: var(--muted); text-align: justify; text-justify: inter-word; hyphens: auto; }
        .prose-blog a { color: var(--electric); text-decoration: underline; }
        .prose-blog strong { color: var(--white); font-weight: 600; }
        .prose-blog em { color: var(--muted); }
        .prose-blog ul, .prose-blog ol { margin: 1.25rem 0; padding-left: 1.5rem; color: var(--muted); }
        .prose-blog li { margin: 0.4rem 0; }
        .prose-blog blockquote { border-left: 3px solid var(--electric); padding: 0.75rem 1.25rem; margin: 1.5rem 0; background: rgba(0,212,255,0.05); border-radius: 0 0.5rem 0.5rem 0; color: var(--white); font-style: italic; }
        .prose-blog pre { background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem; overflow-x: auto; margin: 1.5rem 0; }
        .prose-blog code { font-family: 'Fira Code', 'Cascadia Code', monospace; font-size: 0.88rem; color: var(--electric); }
        .prose-blog pre code { color: var(--white); }
        .prose-blog img { border-radius: 0.75rem; width: 100%; margin: 1.5rem 0; }
        .prose-blog hr { border: none; border-top: 1px solid var(--border); margin: 2.5rem 0; }

        /* Share buttons */
        .share-btn { background: rgba(255,255,255,0.04); border: 1px solid var(--border); color: var(--white); transition: all 0.3s ease; }
        .share-btn:hover { background: rgba(0,212,255,0.2); color: var(--electric); border-color: rgba(0,212,255,0.5); transform: translateY(-4px); }

        /* TOC link - growing bar indicator */
        .toc-link { display: flex; align-items: flex-start; gap: 0.75rem; padding: 4px 0; text-decoration: none; }
        .toc-link .toc-bar { width: 2px; height: 0; margin-top: 7px; background: var(--electric); transition: height 0.3s ease; flex-shrink: 0; }
        .toc-link .toc-text { font-size: 0.875rem; line-height: 1.625; transition: color 0.2s ease; color: var(--muted); }
        .toc-link:hover .toc-bar { height: 1rem; }
        .toc-link:hover .toc-text { color: var(--white); }
        .toc-link.toc-active .toc-bar { height: 1rem; }
        .toc-link.toc-active .toc-text { color: var(--electric); font-weight: 500; }

        /* Keep Reading cards */
        .keep-reading-card { transition: transform 0.5s ease, box-shadow 0.5s ease; }
        .keep-reading-card:hover { transform: translateY(-8px); box-shadow: 0 10px 30px rgba(0,212,255,0.15); }
        .keep-reading-card:hover .keep-reading-title { color: var(--electric); }
        .keep-reading-card img { transition: transform 0.7s ease; }
        .keep-reading-card:hover img { transform: scale(1.05); }
      `}</style>
    </div>
  );
}
