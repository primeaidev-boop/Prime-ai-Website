import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchPublicPosts, fetchPublicCategories, type BlogPost, type BlogCategory } from '@/api/blog';

const PAGE_SIZE = 9;

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="glass-card glass-card-hover flex flex-col overflow-hidden rounded-2xl group"
    >
      <div className="relative overflow-hidden" style={{ paddingTop: '56.25%' }}>
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(255,107,43,0.08))' }}
          >
            <span className="text-4xl opacity-30">✍️</span>
          </div>
        )}
        <div
          className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold"
          style={{ background: post.category.color + '22', color: post.category.color, border: `1px solid ${post.category.color}44` }}
        >
          {post.category.name}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-5 flex-1">
        <h3
          className="font-bold leading-snug line-clamp-2"
          style={{ fontFamily: 'var(--font-head)', color: 'var(--white)', fontSize: '1.05rem' }}
        >
          {post.title}
        </h3>
        <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--muted)' }}>
          {post.excerpt}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            {post.author.avatarUrl ? (
              <img src={post.author.avatarUrl} alt={post.author.name} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--electric)' }}>
                {post.author.name[0]}
              </div>
            )}
            <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{post.author.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
            <Clock size={12} />
            <span>{post.readTimeMin} min read</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
      <div style={{ paddingTop: '56.25%', background: 'rgba(255,255,255,0.05)', position: 'relative' }} />
      <div className="p-5 space-y-3">
        <div className="h-4 rounded" style={{ background: 'rgba(255,255,255,0.06)', width: '80%' }} />
        <div className="h-4 rounded" style={{ background: 'rgba(255,255,255,0.04)', width: '60%' }} />
        <div className="h-3 rounded mt-4" style={{ background: 'rgba(255,255,255,0.04)', width: '40%' }} />
      </div>
    </div>
  );
}

export default function BlogListing() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicCategories().then(setCategories).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetchPublicPosts({ page, limit: PAGE_SIZE, search: search || undefined, category: activeCategory || undefined })
      .then((data) => { setPosts(data.posts); setTotal(data.total); })
      .catch(() => { setPosts([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [page, search, activeCategory]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(inputValue);
    setPage(1);
  }

  function handleCategory(slug: string) {
    setActiveCategory(slug === activeCategory ? '' : slug);
    setPage(1);
  }

  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="pt-28 pb-16 px-6 md:px-12 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="section-tag">PRIM AI Blog</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>
            Insights on <span className="gradient-text">AI & the Future</span>
          </h1>
          <p className="mt-4 text-lg" style={{ color: 'var(--muted)' }}>
            Tutorials, case studies, and career guidance from the PRIM AI team.
          </p>

          <form onSubmit={handleSearch} className="mt-8 flex gap-3 max-w-lg mx-auto">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
              <input
                type="text"
                placeholder="Search articles…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pl-9 pr-4"
                style={{ borderRadius: '9999px' }}
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-2 text-sm">Search</button>
          </form>
        </div>
      </section>

      {/* Category filters */}
      {categories.length > 0 && (
        <div className="px-6 md:px-12 pb-8">
          <div className="max-w-6xl mx-auto flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handleCategory('')}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: !activeCategory ? 'rgba(0,212,255,0.15)' : 'transparent',
                color: !activeCategory ? 'var(--electric)' : 'var(--muted)',
                border: `1px solid ${!activeCategory ? 'rgba(0,212,255,0.3)' : 'var(--border)'}`,
              }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategory(cat.slug)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                style={{
                  background: activeCategory === cat.slug ? cat.color + '22' : 'transparent',
                  color: activeCategory === cat.slug ? cat.color : 'var(--muted)',
                  border: `1px solid ${activeCategory === cat.slug ? cat.color + '55' : 'var(--border)'}`,
                }}
              >
                {cat.name}
                {cat._count && <span className="ml-1 opacity-60">({cat._count.posts})</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4 opacity-30">📝</div>
              <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}>
                No articles found
              </h3>
              <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
                {search ? `Nothing matched "${search}" - try a different term.` : 'No posts published yet - check back soon!'}
              </p>
              {search && (
                <button onClick={() => { setSearch(''); setInputValue(''); setPage(1); }} className="btn-outline mt-6 text-sm px-6 py-2">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => <PostCard key={post.id} post={post} />)}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg transition-colors disabled:opacity-30"
                    style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: page === i + 1 ? 'rgba(0,212,255,0.15)' : 'transparent',
                        color: page === i + 1 ? 'var(--electric)' : 'var(--muted)',
                        border: `1px solid ${page === i + 1 ? 'rgba(0,212,255,0.3)' : 'var(--border)'}`,
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg transition-colors disabled:opacity-30"
                    style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}

              <p className="text-center text-xs mt-4" style={{ color: 'var(--muted)' }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} articles
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
