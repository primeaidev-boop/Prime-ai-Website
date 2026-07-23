import { useState, useEffect, useCallback } from 'react';
import {
  getAdminProgramEnrollments,
  getAdminProgramEnrollmentStats,
  updateProgramEnrollment,
  exportProgramEnrollmentsCsv,
  type ProgramEnrollment,
  type ProgramEnrollmentStats,
  type EnrollmentStatus,
} from '@/api/programEnrollments';

const STATUS_OPTIONS: EnrollmentStatus[] = ['NEW', 'CONTACTED', 'CONFIRMED', 'CANCELLED'];

const statusColors: Record<EnrollmentStatus, string> = {
  NEW: '#00D4FF',
  CONTACTED: '#FF9500',
  CONFIRMED: '#22c55e',
  CANCELLED: '#ef4444',
};

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

export default function ProgramEnrollments() {
  const [rows, setRows] = useState<ProgramEnrollment[]>([]);
  const [stats, setStats] = useState<ProgramEnrollmentStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const LIMIT = 25;

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminProgramEnrollments({
        search: search || undefined,
        program: programFilter || undefined,
        batch: batchFilter || undefined,
        status: statusFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: LIMIT,
      });
      setRows(res.data.data);
      setTotal(res.data.total);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, programFilter, batchFilter, statusFilter, dateFrom, dateTo, page]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await getAdminProgramEnrollmentStats();
      setStats(res.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => { void fetchStats(); }, [fetchStats]);
  useEffect(() => { void fetchRows(); }, [fetchRows]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchRows();
  };

  const clearFilters = () => {
    setSearch('');
    setProgramFilter('');
    setBatchFilter('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleStatusChange = async (id: string, status: EnrollmentStatus) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await updateProgramEnrollment(id, { status });
      void fetchStats();
    } catch {
      void fetchRows();
    }
  };

  const handleNotesSave = async (id: string) => {
    const notes = notesDraft[id] ?? '';
    setSavingNotesId(id);
    try {
      await updateProgramEnrollment(id, { notes });
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, notes } : r)));
    } catch {
      alert('Failed to save note. Please try again.');
    } finally {
      setSavingNotesId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportProgramEnrollmentsCsv();
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'program-enrollments.csv';
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
            Program Enrollments
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
          <StatCard value={stats.total} label="Total Enrollments" color="var(--electric)" />
          <StatCard value={stats.todayCount} label="Today" color="var(--orange)" />
          <StatCard
            value={stats.last7Days.reduce((sum, d) => sum + d.count, 0)}
            label="Last 7 Days"
            color="#34d399"
          />
          <div className="glass-card rounded-xl p-5">
            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
              Top Batch
            </div>
            {stats.byBatch[0] ? (
              <>
                <div className="text-sm font-bold truncate" style={{ color: 'var(--white)' }}>
                  {stats.byBatch[0].batchName}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {stats.byBatch[0].count} enrollments
                </div>
              </>
            ) : (
              <div className="text-xs" style={{ color: 'var(--muted)' }}>No data yet</div>
            )}
          </div>
        </div>
      )}

      {/* By Program + By Batch */}
      {stats && (stats.byProgram.length > 0 || stats.byBatch.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="glass-card rounded-xl p-5">
            <div className="text-sm font-semibold mb-3" style={{ color: 'var(--white)' }}>
              By Program
            </div>
            <div className="flex flex-col gap-2">
              {stats.byProgram.map((p) => {
                const pct = stats.total > 0 ? Math.round((p.count / stats.total) * 100) : 0;
                return (
                  <div key={p.programSlug} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--white)' }}>{p.programTitle}</span>
                      <span style={{ color: 'var(--muted)' }}>{p.count} ({pct}%)</span>
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

          <div className="glass-card rounded-xl p-5">
            <div className="text-sm font-semibold mb-3" style={{ color: 'var(--white)' }}>
              By Batch
            </div>
            <div className="flex flex-col gap-2">
              {stats.byBatch.map((b) => (
                <div key={`${b.programSlug}-${b.batchName}`} className="flex items-center justify-between gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm truncate" style={{ color: 'var(--white)' }}>{b.batchName}</span>
                    <span className="text-xs truncate" style={{ color: 'var(--muted)' }}>{b.programTitle}</span>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--electric)' }}
                  >
                    {b.count}
                  </span>
                </div>
              ))}
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
            placeholder="Name or WhatsApp number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm"
            style={{ padding: '8px 12px' }}
          />
        </div>
        <div className="min-w-36">
          <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Program</label>
          <input
            type="text"
            placeholder="Program slug"
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="text-sm"
            style={{ padding: '8px 12px' }}
          />
        </div>
        <div className="min-w-36">
          <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Batch</label>
          <input
            type="text"
            placeholder="Batch name"
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="text-sm"
            style={{ padding: '8px 12px' }}
          />
        </div>
        <div className="min-w-40">
          <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EnrollmentStatus | '')}
            className="text-sm"
            style={{ padding: '8px 12px' }}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="min-w-36">
          <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-sm"
            style={{ padding: '8px 12px' }}
          />
        </div>
        <div className="min-w-36">
          <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
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
                {['Name', 'WhatsApp', 'City', 'Program', 'Batch', 'Date', 'Status', 'Notes', 'Action'].map((h) => (
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
                  <td colSpan={9} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>
                    No enrollments found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="transition-colors hover:bg-white/[0.025]"
                  >
                    <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--white)' }}>
                      {row.fullName}
                      {row.submissionCount > 1 && (
                        <span
                          className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,107,43,0.12)', color: 'var(--orange)' }}
                          title={`Submitted ${row.submissionCount} times`}
                        >
                          ×{row.submissionCount}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>
                      {row.whatsappNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                      {row.city || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--white)' }}>
                      {row.programTitle}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                      {row.batchName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--muted)' }}>
                      {fmtDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.status}
                        onChange={(e) => handleStatusChange(row.id, e.target.value as EnrollmentStatus)}
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          background: `${statusColors[row.status]}18`,
                          border: `1px solid ${statusColors[row.status]}40`,
                          color: statusColors[row.status],
                          minHeight: 'unset',
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3" style={{ minWidth: '180px' }}>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Add note…"
                          value={notesDraft[row.id] ?? row.notes ?? ''}
                          onChange={(e) => setNotesDraft((prev) => ({ ...prev, [row.id]: e.target.value }))}
                          className="text-xs"
                          style={{ padding: '6px 8px', minWidth: '120px' }}
                        />
                        <button
                          onClick={() => handleNotesSave(row.id)}
                          disabled={savingNotesId === row.id || (notesDraft[row.id] ?? row.notes ?? '') === (row.notes ?? '')}
                          className="text-xs px-2 py-1 rounded transition-colors hover:bg-white/5 shrink-0"
                          style={{
                            color: 'var(--electric)',
                            opacity: savingNotesId === row.id || (notesDraft[row.id] ?? row.notes ?? '') === (row.notes ?? '') ? 0.4 : 1,
                          }}
                        >
                          {savingNotesId === row.id ? '…' : 'Save'}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <a
                        href={`https://wa.me/${row.whatsappNumber.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 rounded transition-colors hover:bg-white/5"
                        style={{ color: '#22c55e' }}
                      >
                        💬 Chat
                      </a>
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
              {total} enrollments · page {page} of {totalPages}
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
