import { useState, useEffect, useCallback } from 'react';
import {
  getAdminTutorialLeads,
  getAdminTutorialLeadStats,
  exportTutorialLeadsCsv,
} from '@/api/tutorialLeads';

const USER_TYPES = [
  'School Student',
  'College Student',
  'Working Professional',
  'Business Owner',
  'Freelancer',
  'Job Seeker',
  'Other',
];

interface Lead {
  id: string;
  fullName: string;
  mobile: string;
  city: string;
  userType: string;
  tutorialAccessed: string;
  sourcePage: string;
  tutorialsViewedCount: number;
  createdAt: string;
}

interface Stats {
  total: number;
  todayCount: number;
  weekCount: number;
  topTutorials: Array<{ tutorial: string; count: number }>;
  byUserType: Array<{ userType: string; count: number }>;
}

function StatCard({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <div className="glass-card rounded-xl p-5 flex flex-col gap-1">
      <div className="text-2xl font-black" style={{ color, fontFamily: 'Montserrat, var(--font-head)' }}>
        {value}
      </div>
      <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
        {label}
      </div>
    </div>
  );
}

export default function TutorialLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [tutorialFilter, setTutorialFilter] = useState('');

  const LIMIT = 25;

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminTutorialLeads({
        search: search || undefined,
        city: cityFilter || undefined,
        userType: userTypeFilter || undefined,
        tutorial: tutorialFilter || undefined,
        page,
        limit: LIMIT,
      });
      setLeads(res.data.data);
      setTotal(res.data.total);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, cityFilter, userTypeFilter, tutorialFilter, page]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await getAdminTutorialLeadStats();
      setStats(res.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => { void fetchStats(); }, [fetchStats]);
  useEffect(() => { void fetchLeads(); }, [fetchLeads]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchLeads();
  };

  const clearFilters = () => {
    setSearch('');
    setCityFilter('');
    setUserTypeFilter('');
    setTutorialFilter('');
    setPage(1);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportTutorialLeadsCsv();
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tutorial-leads.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--electric)' }}>
            Admin
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--white)', fontFamily: 'Montserrat, var(--font-head)' }}>
            Tutorial Leads
          </h1>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn-electric text-sm px-5 py-2.5"
          style={exporting ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
        >
          {exporting ? 'Exporting…' : '⬇ Export CSV'}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard value={stats.total} label="Total Leads" color="var(--electric)" />
          <StatCard value={stats.todayCount} label="Today" color="var(--orange)" />
          <StatCard value={stats.weekCount} label="This Week" color="#34d399" />
          <div className="glass-card rounded-xl p-5">
            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
              Top Tutorial
            </div>
            {stats.topTutorials[0] ? (
              <>
                <div className="text-sm font-bold truncate" style={{ color: 'var(--white)' }}>
                  {stats.topTutorials[0].tutorial}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {stats.topTutorials[0].count} views
                </div>
              </>
            ) : (
              <div className="text-xs" style={{ color: 'var(--muted)' }}>No data yet</div>
            )}
          </div>
        </div>
      )}

      {/* Top Tutorials + By User Type */}
      {stats && (stats.topTutorials.length > 0 || stats.byUserType.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Top Tutorials */}
          <div className="glass-card rounded-xl p-5">
            <div className="text-sm font-semibold mb-3" style={{ color: 'var(--white)' }}>
              Top Accessed Tutorials
            </div>
            <div className="flex flex-col gap-2">
              {stats.topTutorials.map((t, i) => (
                <div key={t.tutorial} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold w-4 shrink-0" style={{ color: 'var(--muted)' }}>
                      {i + 1}
                    </span>
                    <span className="text-sm truncate" style={{ color: 'var(--white)' }}>{t.tutorial}</span>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--electric)' }}
                  >
                    {t.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* By User Type */}
          <div className="glass-card rounded-xl p-5">
            <div className="text-sm font-semibold mb-3" style={{ color: 'var(--white)' }}>
              Leads by Profile
            </div>
            <div className="flex flex-col gap-2">
              {stats.byUserType.map((u) => {
                const pct = stats.total > 0 ? Math.round((u.count / stats.total) * 100) : 0;
                return (
                  <div key={u.userType} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--white)' }}>{u.userType}</span>
                      <span style={{ color: 'var(--muted)' }}>{u.count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--electric), var(--orange))' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <form onSubmit={handleSearch} className="glass-card rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Search</label>
          <input
            type="text"
            placeholder="Name, mobile, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm"
            style={{ padding: '8px 12px' }}
          />
        </div>
        <div className="min-w-36">
          <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>City</label>
          <input
            type="text"
            placeholder="Filter by city"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="text-sm"
            style={{ padding: '8px 12px' }}
          />
        </div>
        <div className="min-w-44">
          <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>User Type</label>
          <select
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value)}
            className="text-sm"
            style={{ padding: '8px 12px' }}
          >
            <option value="">All profiles</option>
            {USER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="min-w-36">
          <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Tutorial</label>
          <input
            type="text"
            placeholder="e.g. chatgpt"
            value={tutorialFilter}
            onChange={(e) => setTutorialFilter(e.target.value)}
            className="text-sm"
            style={{ padding: '8px 12px' }}
          />
        </div>
        <button type="submit" className="btn-electric text-sm px-5 py-2">Search</button>
        <button type="button" onClick={clearFilters} className="text-sm px-4 py-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'var(--muted)' }}>
          Clear
        </button>
      </form>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                {['Name', 'Mobile', 'City', 'Profile', 'Tutorial', 'Source', 'Views', 'Date'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: 'var(--muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>
                    Loading…
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>
                    No leads found.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="transition-colors hover:bg-white/[0.025]"
                  >
                    <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--white)' }}>
                      {lead.fullName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>
                      {lead.mobile}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                      {lead.city}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: 'rgba(0,212,255,0.08)', color: 'var(--electric)', border: '1px solid rgba(0,212,255,0.18)' }}
                      >
                        {lead.userType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--white)' }}>
                      {lead.tutorialAccessed}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted)', fontSize: '11px' }}>
                      {lead.sourcePage}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,107,43,0.1)', color: 'var(--orange)' }}
                      >
                        {lead.tutorialsViewedCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--muted)' }}>
                      {fmtDate(lead.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              {total} leads · page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-outline text-xs px-3 py-1.5"
                style={page === 1 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-outline text-xs px-3 py-1.5"
                style={page === totalPages ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
              >
                Next ➞
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
