import { useEffect } from 'react';
import {
  ContactBlock,
  H3,
  HighlightBox,
  LegalSection,
  LegalTable,
  LegalTOC,
  LI,
  P,
  TocItem,
  UL,
  WarningBox,
  useLegalTOC,
} from '@/components/legal/LegalComponents';

const TOC_ITEMS: TocItem[] = [
  { id: 'who-we-are',      label: '1. Who We Are' },
  { id: 'what-we-collect', label: '2. What We Collect' },
  { id: 'why-we-collect',  label: '3. Why We Collect' },
  { id: 'legal-basis',     label: '4. Legal Basis' },
  { id: 'minors',          label: '5. Minors Under 18' },
  { id: 'sharing',         label: '6. How We Share Data' },
  { id: 'your-rights',     label: '7. Your Rights' },
  { id: 'retention',       label: '8. Data Retention' },
  { id: 'security',        label: '9. Data Security' },
  { id: 'cookies',         label: '10. Cookies' },
  { id: 'whatsapp',        label: '11. WhatsApp' },
  { id: 'changes',         label: '12. Changes' },
  { id: 'grievance',       label: '13. Grievance Officer' },
  { id: 'contact-privacy', label: '14. Contact Us' },
];

export default function PrivacyPolicy() {
  const activeSection = useLegalTOC(TOC_ITEMS, 'who-we-are');

  useEffect(() => {
    const prev = document.title;
    document.title = 'Privacy Policy | PRIM AI Institute';
    return () => { document.title = prev; };
  }, []);

  return (
    <main style={{ background: 'var(--navy)' }}>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div
        className="pt-36 pb-16 px-6 max-w-[900px] mx-auto border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-[2.5px] mb-4"
          style={{ color: 'var(--electric)' }}
        >
          Legal
        </p>

        <h1
          className="text-5xl font-bold tracking-[-1.5px] leading-[1.1] mb-4"
          style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
        >
          Privacy Policy
        </h1>

        <div className="flex gap-8 flex-wrap mb-6">
          {[
            { icon: '📅', text: 'Effective: June 16, 2026' },
            { icon: '🔄', text: 'Last Updated: June 16, 2026' },
            { icon: '⚖️', text: 'Governed by: DPDP Act, 2023' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl p-5 text-sm leading-relaxed"
          style={{
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.2)',
            color: 'var(--muted)',
          }}
        >
          <strong style={{ color: 'var(--electric)' }}>Plain Language Commitment:</strong>{' '}
          This Privacy Policy is written in simple, clear English so that every visitor - student,
          parent, or professional - can understand how we handle your personal data. This policy
          complies with India's Digital Personal Data Protection (DPDP) Act, 2023 and the DPDP
          Rules, 2025.
        </div>
      </div>

      {/* ── 2-column layout ──────────────────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-16">
        <LegalTOC
          items={TOC_ITEMS}
          activeSection={activeSection}
          accentColor="var(--electric)"
          accentBg="rgba(0,212,255,0.06)"
        />

        <div className="min-w-0">

          {/* 1 */}
          <LegalSection id="who-we-are" title="1. Who We Are">
            <P>
              <strong style={{ color: 'var(--white)' }}>PRIM AI Institute</strong> is an ISO
              9001:2015 certified AI training institute headquartered in Ahmedabad, Gujarat, India.
              We offer offline, hands-on AI education programs for students, working professionals,
              and entrepreneurs.
            </P>
            <P>For the purposes of this Privacy Policy:</P>
            <UL>
              <LI><strong style={{ color: 'var(--white)' }}>"We", "Us", "Our"</strong> - refers to PRIM AI Institute</LI>
              <LI><strong style={{ color: 'var(--white)' }}>"You", "User"</strong> - refers to any person visiting our website or enrolling in our programs</LI>
              <LI><strong style={{ color: 'var(--white)' }}>"Personal Data"</strong> - any information that can identify you directly or indirectly</LI>
            </UL>
          </LegalSection>

          {/* 2 */}
          <LegalSection id="what-we-collect" title="2. What Personal Data We Collect">
            <P>We collect only the data that is necessary to provide our services. We do not collect more than what is needed.</P>
            <H3>2.1 Data You Provide Directly</H3>
            <UL>
              <LI>Full name</LI>
              <LI>WhatsApp number and phone number</LI>
              <LI>Email address</LI>
              <LI>City and location</LI>
              <LI>Educational background and current profession</LI>
              <LI>Course interest and enrollment details</LI>
              <LI>Payment information (processed securely via third-party payment gateways)</LI>
            </UL>
            <H3>2.2 Data We Collect Automatically</H3>
            <UL>
              <LI>Browser type and device information</LI>
              <LI>IP address and approximate location</LI>
              <LI>Pages visited and time spent on our website</LI>
              <LI>Referral source - how you found us</LI>
            </UL>
            <H3>2.3 Data We Do NOT Collect</H3>
            <UL>
              <LI>Government ID numbers (Aadhaar, PAN) - unless legally required for certification</LI>
              <LI>Sensitive financial data beyond payment confirmation</LI>
              <LI>Biometric data</LI>
              <LI>Precise real-time location</LI>
            </UL>
          </LegalSection>

          {/* 3 */}
          <LegalSection id="why-we-collect" title="3. Why We Collect Your Data">
            <LegalTable
              headers={['Purpose', 'Data Used']}
              rows={[
                ['Responding to your demo class inquiry', 'Name, phone, WhatsApp'],
                ['Enrolling you in a course', 'Name, contact, education details'],
                ['Sending course updates and schedules', 'Phone, email, WhatsApp'],
                ['Placement support and referrals', 'Name, skills, contact'],
                ['Issuing course completion certificates', 'Name, course details'],
                ['Improving our website and services', 'Anonymized usage data'],
                ['Compliance with legal requirements', 'As required by law'],
              ]}
            />
            <HighlightBox>
              We will <strong style={{ color: 'var(--electric)' }}>never</strong> use your data for
              purposes not listed above without obtaining your separate consent.
            </HighlightBox>
          </LegalSection>

          {/* 4 */}
          <LegalSection id="legal-basis" title="4. Legal Basis for Processing">
            <P>Under the DPDP Act, 2023, we process your personal data based on:</P>
            <UL>
              <LI><strong style={{ color: 'var(--white)' }}>Your consent</strong> - given freely when you fill our inquiry or enrollment form</LI>
              <LI><strong style={{ color: 'var(--white)' }}>Contractual necessity</strong> - to fulfill the course enrollment agreement</LI>
              <LI><strong style={{ color: 'var(--white)' }}>Legitimate interest</strong> - to improve our services and communicate with enrolled students</LI>
              <LI><strong style={{ color: 'var(--white)' }}>Legal obligation</strong> - when required by law or government authority</LI>
            </UL>
          </LegalSection>

          {/* 5 */}
          <LegalSection id="minors" title="5. Special Provisions for Minors (Under 18 Years)">
            <P>
              The DPDP Act, 2023 includes specific provisions requiring verifiable parental consent
              before processing data of individuals under 18 years of age.
            </P>
            <P><strong style={{ color: 'var(--white)' }}>For students under 18 years:</strong></P>
            <UL>
              <LI>We will obtain <strong style={{ color: 'var(--white)' }}>verifiable consent from a parent or legal guardian</strong> before enrolling a minor</LI>
              <LI>Parents/guardians will be clearly informed about what data is collected and why</LI>
              <LI>We do <strong style={{ color: 'var(--white)' }}>not</strong> conduct behavioral tracking, targeted advertising, or profiling of minors</LI>
              <LI>We apply data minimization - collecting only what is strictly necessary</LI>
              <LI>Parents/guardians may withdraw consent at any time by contacting us</LI>
            </UL>
            <WarningBox>
              If we discover that we have collected data from a minor without proper parental
              consent, we will <strong style={{ color: 'var(--white)' }}>delete it immediately</strong>.
            </WarningBox>
          </LegalSection>

          {/* 6 */}
          <LegalSection id="sharing" title="6. How We Share Your Data">
            <HighlightBox>
              We do <strong style={{ color: 'var(--electric)' }}>not sell your personal data to anyone. Ever.</strong>
            </HighlightBox>
            <P>We may share your data only in the following limited circumstances:</P>
            <H3>6.1 Hiring Partners - Placement Support</H3>
            <P>
              With your explicit consent, we may share your name, skills, and contact details with
              companies in our hiring partner network for placement purposes. You can opt out at any time.
            </P>
            <H3>6.2 Service Providers</H3>
            <P>
              We work with trusted third-party providers - payment gateways, SMS/WhatsApp providers,
              email services. These providers are contractually bound to protect your data.
            </P>
            <H3>6.3 Legal Requirements</H3>
            <P>
              We may disclose your data if required by law, court order, or government authority in India.
            </P>
          </LegalSection>

          {/* 7 */}
          <LegalSection id="your-rights" title="7. Your Rights Under the DPDP Act, 2023">
            <LegalTable
              headers={['Your Right', 'What It Means']}
              rows={[
                ['<strong>Right to Access</strong>', 'Ask us what personal data we hold about you'],
                ['<strong>Right to Correction</strong>', 'Ask us to correct any inaccurate data'],
                ['<strong>Right to Erasure</strong>', 'Ask us to delete your data (subject to legal retention requirements)'],
                ['<strong>Right to Withdraw Consent</strong>', 'Withdraw your consent at any time'],
                ['<strong>Right to Grievance Redressal</strong>', 'Raise a complaint if your data has been mishandled'],
                ['<strong>Right to Nominate</strong>', 'Nominate someone to exercise your rights in case of death or incapacity'],
              ]}
            />
            <P>
              To exercise any of these rights, contact us at{' '}
              <strong style={{ color: 'var(--white)' }}>privacy@primai.in</strong>. We will respond
              within <strong style={{ color: 'var(--white)' }}>30 days</strong>.
            </P>
          </LegalSection>

          {/* 8 */}
          <LegalSection id="retention" title="8. Data Retention">
            <LegalTable
              headers={['Data Type', 'Retention Period']}
              rows={[
                ['Inquiry / Demo form data', '12 months from last contact'],
                ['Enrolled student data', 'Duration of course + 5 years'],
                ['Certificate records', '10 years (for verification purposes)'],
                ['Payment records', '7 years (as required by Indian tax law)'],
                ['Website usage data', '12 months'],
              ]}
            />
            <P>After the retention period, your data is securely deleted or anonymized.</P>
          </LegalSection>

          {/* 9 */}
          <LegalSection id="security" title="9. Data Security">
            <P>We implement reasonable safeguards including:</P>
            <UL>
              <LI>Encrypted data storage and transmission (HTTPS)</LI>
              <LI>Access controls - only authorized staff can access your data</LI>
              <LI>Regular security reviews</LI>
              <LI>Secure payment processing via certified payment gateways - we never store card details</LI>
            </UL>
            <P>
              In the event of a data breach likely to cause harm, we will notify you as required
              under the DPDP Act.
            </P>
          </LegalSection>

          {/* 10 */}
          <LegalSection id="cookies" title="10. Cookies & Tracking">
            <P>
              Our website uses basic cookies to keep you logged in, understand how visitors use our
              site, and remember your preferences.
            </P>
            <P>
              We do <strong style={{ color: 'var(--white)' }}>not</strong> use cookies for
              behavioral advertising or to track you across other websites. You can control cookie
              settings through your browser at any time.
            </P>
          </LegalSection>

          {/* 11 */}
          <LegalSection id="whatsapp" title="11. WhatsApp Communication">
            <P>When you contact us via WhatsApp or provide your WhatsApp number:</P>
            <UL>
              <LI>We use it only to respond to your inquiry and send course-related updates</LI>
              <LI>We will not add you to bulk marketing groups without your consent</LI>
              <LI>You can ask us to stop messaging you at any time by sending <strong style={{ color: 'var(--white)' }}>"STOP"</strong></LI>
            </UL>
          </LegalSection>

          {/* 12 */}
          <LegalSection id="changes" title="12. Changes to This Policy">
            <P>
              We may update this Privacy Policy from time to time. When we do, we will update the
              "Last Updated" date at the top. For significant changes, enrolled students will be
              notified via WhatsApp or email. Continued use of our website after changes constitutes
              acceptance of the updated policy.
            </P>
          </LegalSection>

          {/* 13 */}
          <LegalSection id="grievance" title="13. Grievance Officer">
            <P>
              As required under Indian law, we have appointed a Grievance Officer for data privacy matters:
            </P>
            <ContactBlock
              items={[
                { icon: '📧', text: 'privacy@primai.in', href: 'mailto:privacy@primai.in' },
                { icon: '📞', text: '+91 7573055577', href: 'tel:+917573055577' },
                { icon: '📍', text: 'PRIM AI Institute, Ahmedabad, Gujarat, India' },
                { icon: '🕐', text: 'Response: 72 hours acknowledgment · 30 days resolution' },
              ]}
            />
            <P className="mt-4">
              If not satisfied with our response, you may escalate to the{' '}
              <strong style={{ color: 'var(--white)' }}>Data Protection Board of India</strong>{' '}
              once fully operational.
            </P>
          </LegalSection>

          {/* 14 */}
          <LegalSection id="contact-privacy" title="14. Contact Us">
            <ContactBlock
              items={[
                { icon: '📍', text: 'Ahmedabad, Gujarat, India' },
                { icon: '📞', text: '+91 7573055577', href: 'tel:+917573055577' },
                { icon: '✉️', text: 'info@primai.in', href: 'mailto:info@primai.in' },
                { icon: '💬', text: 'WhatsApp: +91 7573055577' },
                { icon: '🕐', text: 'Monday to Friday, 9 AM – 7 PM' },
              ]}
            />
          </LegalSection>

          {/* Disclaimer */}
          <div
            className="rounded-xl p-5 mt-10"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs leading-[1.7]" style={{ color: 'var(--muted)' }}>
              <strong style={{ color: 'var(--white)' }}>Disclaimer:</strong>{' '}
              This Privacy Policy has been prepared based on the Digital Personal Data Protection
              Act, 2023 and DPDP Rules, 2025. It is recommended that you consult a qualified legal
              professional before finalizing and publishing this policy.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
