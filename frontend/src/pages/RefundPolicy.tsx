import { useEffect } from 'react';

const PURPLE = '#a78bfa';

// ── Info section wrapper ──────────────────────────────────────────────────────

function InfoSection({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-12">
      <h2
        className="flex items-center gap-2 text-xl font-bold tracking-[-0.3px] mb-4"
        style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
      >
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-[1.8] mb-3" style={{ color: 'var(--muted)' }}>
      {children}
    </p>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function RefundPolicy() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'Refund Policy | PRIM AI Institute';
    return () => { document.title = prev; };
  }, []);

  return (
    <main style={{ background: 'var(--navy)' }}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        className="pt-36 pb-16 px-6 max-w-[900px] mx-auto border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-[2.5px] mb-4"
          style={{ color: PURPLE }}
        >
          Legal
        </p>

        <h1
          className="text-5xl font-bold tracking-[-1.5px] leading-[1.1] mb-4"
          style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
        >
          Refund Policy
        </h1>

        <div className="flex gap-8 flex-wrap">
          {[
            { icon: '📅', text: 'Effective: June 16, 2026' },
            { icon: '🔄', text: 'Last Updated: June 16, 2026' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-[900px] mx-auto px-6 py-16 pb-24">

        {/* Policy Statement Card */}
        <div
          className="rounded-3xl p-10 mb-12"
          style={{
            background: 'rgba(167,139,250,0.06)',
            border: `1px solid rgba(167,139,250,0.25)`,
          }}
        >
          <h2
            className="text-2xl font-bold tracking-[-0.5px] mb-4"
            style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
          >
            Our Refund Policy
          </h2>

          <p className="text-sm leading-[1.8] mb-3" style={{ color: 'var(--muted)' }}>
            <strong style={{ color: PURPLE }}>
              All course fees paid to PRIM AI Institute are strictly non-refundable.
            </strong>
          </p>

          <p className="text-sm leading-[1.8] mb-4" style={{ color: 'var(--muted)' }}>
            This applies to all enrollments across all courses and all payment modes without exception.
          </p>

          <ul className="flex flex-col gap-2">
            {[
              'All course enrollments - Level 1, Level 2A, Level 2B',
              'All payment modes - UPI, Cash, Bank Transfer, or any other mode',
              'All circumstances including change of mind, personal reasons, relocation, or inability to attend',
              'All installment payments made toward a course',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm" style={{ color: 'var(--muted)' }}>
                <span
                  className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                  style={{ background: PURPLE }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Section 1 - Why */}
        <InfoSection icon="💡" title="Why We Have This Policy">
          <Prose>
            We offer a{' '}
            <strong style={{ color: 'var(--white)' }}>completely free demo class</strong> before
            any payment is made - specifically so that every student can experience our teaching
            quality, meet their trainer, ask all questions, and make a fully informed decision
            before committing financially.
          </Prose>
          <Prose>
            We strongly encourage every prospective student to attend the free demo class before
            making any payment. Our goal is that you are 100% confident before you enroll.
          </Prose>
        </InfoSection>

        {/* Section 2 - Before You Pay */}
        <InfoSection icon="✅" title="Before You Pay - Please Ensure">
          <div className="flex flex-col gap-3">
            {[
              'You have attended the free demo class and are satisfied',
              'You are fully satisfied with the course content and trainer',
              'You have confirmed the batch timing suits your schedule',
              'You have read and understood our Terms & Conditions',
              'You are making the payment willingly and without any pressure',
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-5 py-4 rounded-xl text-sm leading-relaxed transition-all duration-300"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  color: 'var(--muted)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'rgba(167,139,250,0.2)';
                  el.style.color = 'var(--white)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--border)';
                  el.style.color = 'var(--muted)';
                }}
              >
                <span className="font-bold flex-shrink-0 mt-0.5" style={{ color: PURPLE }}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </InfoSection>

        {/* Section 3 - Instead of Refunds */}
        <InfoSection icon="🤝" title="What We Offer Instead of Refunds">
          <Prose>
            While fees are non-refundable, we are fully committed to your learning success:
          </Prose>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {[
              {
                icon: '🎯',
                title: 'Pace Adjustment',
                desc: 'Struggling with the pace? We adjust. 1-to-1 mentorship means your trainer works at your speed - always.',
              },
              {
                icon: '📅',
                title: 'Makeup Sessions',
                desc: 'Missed a class for a valid reason? We provide makeup sessions wherever possible.',
              },
              {
                icon: '💬',
                title: 'Open Communication',
                desc: 'Facing personal difficulties? Speak to us. We will do our best to accommodate your situation.',
              },
              {
                icon: '🔧',
                title: 'Content Concerns',
                desc: 'Not satisfied with something in the content? Raise it immediately - we will address it directly.',
              },
            ].map((card, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 transition-all duration-300"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(167,139,250,0.25)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                }}
              >
                <div className="text-2xl mb-3">{card.icon}</div>
                <h4
                  className="text-sm font-bold mb-2"
                  style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
                >
                  {card.title}
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </InfoSection>

        {/* Section 4 - Free Demo Class */}
        <InfoSection icon="🎓" title="Free Demo Class">
          <Prose>
            Our free demo class is your opportunity to experience PRIM AI Institute before any
            commitment:
          </Prose>
          <ul className="pl-5 space-y-2">
            {[
              'Completely free - no payment, no obligation',
              'Meet your trainer and see the teaching style firsthand',
              'See the course content and tools you will be working with',
              'Ask any questions about the curriculum, schedule, or outcomes',
              'Take your time - enroll only when you are ready',
            ].map((item, i) => (
              <li
                key={i}
                className="text-sm leading-[1.7] list-disc"
                style={{ color: 'var(--muted)' }}
              >
                {item}
              </li>
            ))}
          </ul>
        </InfoSection>

        {/* Section 5 - Contact */}
        <InfoSection icon="📞" title="Questions? Talk to Us First">
          <Prose>
            If you have any concerns before or after enrollment, please reach out. We are here to help.
          </Prose>
          <div
            className="rounded-2xl p-6"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            {[
              { icon: '📧', text: 'info@primai.in',           href: 'mailto:info@primai.in' },
              { icon: '📞', text: '+91 7573055577',          href: 'tel:+917573055577' },
              { icon: '💬', text: 'WhatsApp: +91 7573055577' },
              { icon: '📍', text: 'Ahmedabad, Gujarat, India' },
              { icon: '🕐', text: 'Monday to Friday, 9 AM – 7 PM' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm py-3 border-b last:border-0"
                style={{ color: 'var(--muted)', borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <span>{item.icon}</span>
                {item.href ? (
                  <a
                    href={item.href}
                    className="hover:underline transition-colors"
                    style={{ color: PURPLE }}
                  >
                    {item.text}
                  </a>
                ) : (
                  <span>{item.text}</span>
                )}
              </div>
            ))}
          </div>
        </InfoSection>

        {/* Disclaimer */}
        <div
          className="rounded-xl p-5 mt-10"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
        >
          <p className="text-xs leading-[1.7]" style={{ color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--white)' }}>Disclaimer:</strong>{' '}
            This Refund Policy is recommended to be reviewed by a qualified legal professional
            before publishing. PRIM AI Institute is not liable for any legal consequences arising
            from the use of this document without professional legal review. Under the Consumer
            Protection Act, 2019, students retain the right to approach the appropriate Consumer
            Disputes Redressal Forum if they believe their consumer rights have been violated.
          </p>
        </div>

      </div>
    </main>
  );
}
