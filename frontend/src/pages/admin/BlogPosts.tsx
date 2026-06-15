import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Clock, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { adminFetchPosts, adminDeletePost, type BlogPost } from '@/api/blog';

export default function BlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminFetchPosts({ page, limit: 20, search: search || undefined, status: statusFilter || undefined })
      .then((data) => { setPosts(data.posts); setTotal(data.total); })
      .catch(() => { setPosts([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(inputValue);
    setPage(1);
  }

  async function handleDelete(post: BlogPost) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setDeletingId(post.id);
    try {
      await adminDeletePost(post.id);
      load();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-8" style={{ color: 'var(--white)' }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-head)' }}>Blog Posts</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{total} total posts</p>
        </div>
        <Link to="/admin/blog/new" className="btn-primary text-sm px-5 py-2 flex items-center gap-2">
          <Plus size={16} /> New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search posts…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-9"
            />
          </div>
          <button type="submit" className="btn-electric text-sm px-4 py-2">Search</button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ width: '160px' }}
        >
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center" style={{ color: 'var(--muted)' }}>Loading…</div>
        ) : posts.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-4xl mb-3 opacity-30">📝</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {search ? `No posts matched "${search}"` : 'No posts yet - create your first one!'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Title', 'Category', 'Status', 'Read time', 'Date', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      {post.coverImageUrl && (
                        <img src={post.coverImageUrl} alt="" className="w-10 h-8 rounded object-cover shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-sm leading-snug" style={{ color: 'var(--white)' }}>{post.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>/{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{ background: post.category.color + '20', color: post.category.color }}
                    >
                      {post.category.name}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: post.status === 'PUBLISHED' ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.06)',
                        color: post.status === 'PUBLISHED' ? 'var(--electric)' : 'var(--muted)',
                      }}
                    >
                      {post.status === 'PUBLISHED' ? '● Published' : '○ Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
                      <Clock size={12} />{post.readTimeMin} min
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs" style={{ color: 'var(--muted)' }}>
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {post.status === 'PUBLISHED' && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: 'var(--muted)' }}
                          title="View live"
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}
                      <Link
                        to={`/admin/blog/${post.id}/edit`}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--electric)' }}
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => handleDelete(post)}
                        disabled={deletingId === post.id}
                        className="p-2 rounded-lg transition-colors disabled:opacity-40"
                        style={{ color: 'var(--orange)' }}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
