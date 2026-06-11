// Courses page placeholder

import { SectionTag } from '@/components/shared/SectionTag';

export default function Courses() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 text-center">
      <SectionTag>What We Teach</SectionTag>
      <h1
        className="text-5xl font-bold mt-4 mb-4 gradient-text"
        style={{ fontFamily: 'var(--font-head)' }}
      >
        Our Courses
      </h1>
      <p style={{ color: 'var(--muted)' }}>Coming soon — Day 3</p>
    </main>
  );
}
