// Home page — hero placeholder (Day 2 will have full content)

import { useModal } from '@/hooks/useModal';
import { DemoModal } from '@/components/shared/DemoModal';
import { SectionTag } from '@/components/shared/SectionTag';

export default function Home() {
  const modal = useModal();

  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-16 text-center">
        <SectionTag>India's Premier AI Training Institute</SectionTag>
        <h1
          className="text-5xl md:text-7xl font-bold mt-4 mb-6 leading-tight"
          style={{ fontFamily: 'var(--font-head)' }}
        >
          Learn{' '}
          <span className="gradient-text">Practical AI</span>
          <br />
          for Real Results
        </h1>
        <p
          className="text-lg md:text-xl max-w-2xl mb-10"
          style={{ color: 'var(--muted)' }}
        >
          From foundation to advanced — courses built for students, professionals,
          and business owners who want to harness AI today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={modal.open} className="btn-primary text-base px-8 py-3">
            Book Free Demo →
          </button>
          <a href="/courses" className="btn-outline text-base px-8 py-3">
            Explore Courses
          </a>
        </div>

        <div
          className="mt-20 px-8 py-4 rounded-2xl text-sm"
          style={{
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.15)',
            color: 'var(--muted)',
          }}
        >
          Full homepage with hero animations, course cards, testimonials, and stats coming on Day 2.
        </div>
      </main>

      <DemoModal isOpen={modal.isOpen} onClose={modal.close} />
    </>
  );
}
