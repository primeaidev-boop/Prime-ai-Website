// Admin dashboard — shows aggregated stats and recent leads

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/admin/StatCard';
import { LeadsTable } from '@/components/admin/LeadsTable';
import { getStats, getRecentLeads } from '@/api/admin';
import type { DashboardStats, DemoBooking, Enquiry } from '@/types';

type RecentLead = (DemoBooking | Enquiry) & { type: 'booking' | 'enquiry' };

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getRecentLeads(10)])
      .then(([statsRes, leadsRes]) => {
        setStats(statsRes.data as DashboardStats);
        setRecentLeads(leadsRes.data as RecentLead[]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted)' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      <h1
        className="text-2xl font-bold mb-2"
        style={{ fontFamily: 'var(--font-head)' }}
      >
        Dashboard
      </h1>
      <p className="mb-8 text-sm" style={{ color: 'var(--muted)' }}>
        Overview of all leads and activity
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <StatCard label="Total Leads" value={stats?.totalLeads ?? 0} icon="👥" color="var(--electric)" />
        <StatCard label="New Leads" value={stats?.newLeads ?? 0} icon="🔔" color="#00D4FF" trend="up" />
        <StatCard label="This Week" value={stats?.thisWeekLeads ?? 0} icon="📅" color="var(--orange2)" />
        <StatCard label="Converted" value={stats?.convertedLeads ?? 0} icon="✅" color="#22c55e" trend="up" />
        <StatCard label="Bookings" value={stats?.bookingsCount ?? 0} icon="📋" />
        <StatCard label="Enquiries" value={stats?.enquiriesCount ?? 0} icon="📩" />
      </div>

      <div className="glass-card p-6">
        <h2
          className="text-lg font-bold mb-4"
          style={{ fontFamily: 'var(--font-head)' }}
        >
          Recent Leads
        </h2>
        <LeadsTable leads={recentLeads} showType />
      </div>
    </div>
  );
}
