// Phase 3 - Device-local analytics
// localStorage key: primAI_analytics
// Tracks tutorial view counts. Completion / started metrics are
// derived from primAI_userProgress when the Analytics tab is rendered.

import type { AnalyticsData } from '@/types';

const KEY = 'primAI_analytics';

function empty(): AnalyticsData {
  return { tutorials: {}, totalViews: 0, lastUpdated: new Date().toISOString() };
}

export function loadAnalytics(): AnalyticsData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...JSON.parse(raw) as AnalyticsData };
  } catch { /* ignore */ }
  return empty();
}

function save(d: AnalyticsData): void {
  localStorage.setItem(KEY, JSON.stringify({ ...d, lastUpdated: new Date().toISOString() }));
}

/** Increment view counter every time a lesson page mounts for a given tutorial. */
export function recordTutorialView(tutorialId: string): void {
  const d = loadAnalytics();
  const existing = d.tutorials[tutorialId] ?? { views: 0, lastViewed: '' };
  d.tutorials[tutorialId] = {
    views: existing.views + 1,
    lastViewed: new Date().toISOString(),
  };
  d.totalViews = (d.totalViews ?? 0) + 1;
  save(d);
}
