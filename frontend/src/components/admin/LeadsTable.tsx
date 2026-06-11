// Reusable leads table for bookings and enquiries admin pages

import type { DemoBooking, Enquiry, LeadStatus } from '@/types';

type Lead = (DemoBooking | Enquiry) & { type?: 'booking' | 'enquiry' };

interface LeadsTableProps {
  leads: Lead[];
  onStatusChange?: (id: string, status: LeadStatus) => void;
  onDelete?: (id: string) => void;
  showType?: boolean;
}

const statusColors: Record<LeadStatus, string> = {
  NEW: '#00D4FF',
  CONTACTED: '#FF9500',
  CONVERTED: '#22c55e',
  LOST: '#ef4444',
};

const profileLabels: Record<string, string> = {
  SCHOOL_STUDENT: 'School',
  COLLEGE_STUDENT: 'College',
  WORKING_PROFESSIONAL: 'Professional',
  BUSINESS_OWNER: 'Business',
  OTHER: 'Other',
};

const courseLabels: Record<string, string> = {
  LEVEL_1_FOUNDATION: 'L1 Foundation',
  LEVEL_2A_GENERALIST: 'L2A Generalist',
  LEVEL_2B_DEVELOPER: 'L2B Developer',
  NOT_SURE: 'Not Sure',
};

export function LeadsTable({
  leads,
  onStatusChange,
  onDelete,
  showType = false,
}: LeadsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
            {showType && <th className="text-left py-3 px-4 font-medium">Type</th>}
            <th className="text-left py-3 px-4 font-medium">Name</th>
            <th className="text-left py-3 px-4 font-medium">Phone</th>
            <th className="text-left py-3 px-4 font-medium">Profile</th>
            <th className="text-left py-3 px-4 font-medium">Course</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-left py-3 px-4 font-medium">Date</th>
            {(onStatusChange || onDelete) && (
              <th className="text-left py-3 px-4 font-medium">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="transition-colors hover:bg-white/[0.02]"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              {showType && (
                <td className="py-3 px-4" style={{ color: 'var(--muted)' }}>
                  {lead.type === 'booking' ? '📅' : '📩'}{' '}
                  {lead.type === 'booking' ? 'Booking' : 'Enquiry'}
                </td>
              )}
              <td className="py-3 px-4 font-medium">{lead.name}</td>
              <td className="py-3 px-4" style={{ color: 'var(--muted)' }}>
                {lead.phone}
              </td>
              <td className="py-3 px-4" style={{ color: 'var(--muted)' }}>
                {profileLabels[lead.profile] ?? lead.profile}
              </td>
              <td className="py-3 px-4" style={{ color: 'var(--muted)' }}>
                {courseLabels[lead.courseInterest] ?? lead.courseInterest}
              </td>
              <td className="py-3 px-4">
                <span
                  className="px-2 py-0.5 rounded text-xs font-semibold"
                  style={{
                    color: statusColors[lead.status],
                    background: `${statusColors[lead.status]}18`,
                    border: `1px solid ${statusColors[lead.status]}40`,
                  }}
                >
                  {lead.status}
                </span>
              </td>
              <td className="py-3 px-4 text-xs" style={{ color: 'var(--muted)' }}>
                {new Date(lead.createdAt).toLocaleDateString('en-IN')}
              </td>
              {(onStatusChange || onDelete) && (
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {onStatusChange && (
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          onStatusChange(lead.id, e.target.value as LeadStatus)
                        }
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border)',
                          color: 'var(--white)',
                          minHeight: 'unset',
                        }}
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="CONVERTED">Converted</option>
                        <option value="LOST">Lost</option>
                      </select>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(lead.id)}
                        className="text-xs px-2 py-1 rounded hover:bg-red-500/20 transition-colors"
                        style={{ color: '#ef4444' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {leads.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--muted)' }}>
          No leads found.
        </div>
      )}
    </div>
  );
}
