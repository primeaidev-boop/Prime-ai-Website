// Admin enquiries page - list, filter, status update, CSV export, delete

import { useEffect, useState } from 'react';
import { LeadsTable } from '@/components/admin/LeadsTable';
import { SearchInput } from '@/components/ui/SearchInput';
import {
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
  exportEnquiriesCsv,
} from '@/api/admin';
import type { Enquiry, LeadStatus, PaginatedResponse } from '@/types';

export default function Enquiries() {
  const [data, setData] = useState<PaginatedResponse<Enquiry> | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = () => {
    setLoading(true);
    getEnquiries({
      search: search || undefined,
      status: statusFilter || undefined,
      page,
      limit: 20,
    })
      .then((res) => setData(res.data as PaginatedResponse<Enquiry>))
      .catch(() => { /* backend offline */ })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEnquiries(); }, [page, statusFilter]);

  const handleExport = async () => {
    const res = await exportEnquiriesCsv();
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enquiries.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStatus = async (id: string, status: LeadStatus) => {
    await updateEnquiryStatus(id, status);
    fetchEnquiries();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this enquiry?')) return;
    await deleteEnquiry(id);
    fetchEnquiries();
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-head)' }}>
            Enquiries
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {data?.total ?? 0} total enquiries
          </p>
        </div>
        <button onClick={handleExport} className="btn-outline text-sm px-4 py-2">
          Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form
          onSubmit={(e) => { e.preventDefault(); setPage(1); fetchEnquiries(); }}
          className="sm:max-w-xs w-full"
        >
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name or phone..."
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as LeadStatus | ''); setPage(1); }}
          className="sm:max-w-xs"
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="CONVERTED">Converted</option>
          <option value="LOST">Lost</option>
        </select>
      </div>

      <div className="glass-card">
        {loading ? (
          <div className="p-12 text-center" style={{ color: 'var(--muted)' }}>Loading...</div>
        ) : (
          <LeadsTable
            leads={data?.data ?? []}
            onStatusChange={handleStatus}
            onDelete={handleDelete}
          />
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-outline text-sm px-4 py-2 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-outline text-sm px-4 py-2 disabled:opacity-40"
          >
            Next ➞
          </button>
        </div>
      )}
    </div>
  );
}
