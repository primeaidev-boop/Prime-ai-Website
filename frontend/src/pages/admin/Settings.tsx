// Admin settings page — edit site-wide key/value settings

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/shared/GlassCard';
import { getSettings, updateSetting } from '@/api/admin';

const SETTING_LABELS: Record<string, string> = {
  hero_students_count: 'Students Count (Hero)',
  hero_companies_count: 'Companies Count (Hero)',
  hero_years_count: 'Years Count (Hero)',
  new_batch_banner: 'Show New Batch Banner (true/false)',
  new_batch_text: 'New Batch Banner Text',
  admin_whatsapp: 'Admin WhatsApp Number',
  admin_email: 'Admin Email Address',
};

export default function Settings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then((res) => setSettings(res.data as Record<string, string>))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (key: string, value: string) => {
    setSaving(key);
    try {
      await updateSetting(key, value);
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted)' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <h1
        className="text-2xl font-bold mb-2"
        style={{ fontFamily: 'var(--font-head)' }}
      >
        Settings
      </h1>
      <p className="mb-8 text-sm" style={{ color: 'var(--muted)' }}>
        Configure site-wide content and admin contact details.
      </p>

      <div className="flex flex-col gap-4">
        {Object.entries(settings).map(([key, value]) => (
          <GlassCard key={key} className="p-5">
            <label
              className="block text-xs font-semibold mb-2"
              style={{ color: 'var(--electric)' }}
            >
              {SETTING_LABELS[key] ?? key}
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                defaultValue={value}
                onBlur={(e) => {
                  if (e.target.value !== value) {
                    setSettings((prev) => ({ ...prev, [key]: e.target.value }));
                  }
                }}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
              <button
                onClick={() => handleSave(key, settings[key])}
                disabled={saving === key}
                className="btn-primary text-sm px-4 py-2 whitespace-nowrap"
                style={{ minWidth: '80px' }}
              >
                {saving === key ? '...' : saved === key ? '✓' : 'Save'}
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
