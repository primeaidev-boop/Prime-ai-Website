import { useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  { id: 'about',        label: '1. About Us' },
  { id: 'definitions',  label: '2. Definitions' },
  { id: 'eligibility',  label: '3. Eligibility' },
  { id: 'enrollment',   label: '4. Enrollment' },
  { id: 'fees',         label: '5. Fees & Payment' },
  { id: 'schedule',     label: '6. Course Schedule' },
  { id: 'attendance',   label: '7. Attendance & Conduct' },
  { id: 'certificate',  label: '8. Certificate' },
  { id: 'placement',    label: '9. Placement Support' },
  { id: 'ip',           label: '10. Intellectual Property' },
  { id: 'liability',    label: '11. Liability' },
  { id: 'privacy-ref',  label: '12. Privacy' },
  { id: 'website',      label: '13. Website Use' },
  { id: 'amendments',   label: '14. Amendments' },
  { id: 'governing',    label: '15. Governing Law' },
  { id: 'grievance-tc', label: '16. Grievance' },
];

export default function TermsConditions() {
  const activeSection = useLegalTOC(TOC_ITEMS, 'about');

  useEffect(() => {
    const prev = document.title;
    document.title = 'Terms & Conditions | PRIM AI Institute';
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
          style={{ color: 'var(--orange)' }}
        >
          Legal
        </p>

        <h1
          className="text-5xl font-bold tracking-[-1.5px] leading-[1.1] mb-4"
          style={{ fontFamily: 'var(--font-head)', color: 'var(--white)' }}
        >
          Terms &amp; Conditions
        </h1>

        <div className="flex gap-8 flex-wrap mb-6">
          {[
            { icon: '📅', text: 'Effective: June 16, 2026' },
            { icon: '🔄', text: 'Last Updated: June 16, 2026' },
            { icon: '⚖️', text: 'Governed by: Laws of India' },
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
            background: 'rgba(255,107,43,0.06)',
            border: '1px solid rgba(255,107,43,0.2)',
            color: 'var(--muted)',
          }}
        >
          <strong style={{ color: 'var(--orange)' }}>Please Read Carefully:</strong>{' '}
          By enrolling in any course, booking a demo class, or using our website, you agree to be
          bound by these Terms & Conditions. If you do not agree, please do not use our services.
        </div>
      </div>

      {/* ── 2-column layout ──────────────────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-16">
        <LegalTOC
          items={TOC_ITEMS}
          activeSection={activeSection}
          accentColor="var(--orange)"
          accentBg="rgba(255,107,43,0.06)"
        />

        <div className="min-w-0">

          {/* 1 */}
          <LegalSection id="about" title="1. About Us">
            <P>
              <strong style={{ color: 'var(--white)' }}>PRIM AI Institute</strong> is an ISO
              9001:2015 certified AI training institute headquartered in Ahmedabad, Gujarat, India.
              These Terms & Conditions govern the relationship between PRIM AI Institute
              ("Institute", "We", "Us") and anyone who uses our website or enrolls in our programs
              ("Student", "You", "User").
            </P>
          </LegalSection>

          {/* 2 */}
          <LegalSection id="definitions" title="2. Definitions">
            <LegalTable
              headers={['Term', 'Meaning']}
              rows={[
                ['<strong>Institute</strong>', 'PRIM AI Institute, Ahmedabad, Gujarat'],
                ['<strong>Student / User</strong>', 'Any person who enrolls or inquires about our courses'],
                ['<strong>Course</strong>', 'Any AI training program offered by PRIM AI Institute'],
                ['<strong>Demo Class</strong>', 'A free introductory class before enrollment'],
                ['<strong>Fee</strong>', 'The course fee payable at time of enrollment'],
                ['<strong>Certificate</strong>', 'ISO 9001:2015 certified course completion document'],
              ]}
            />
          </LegalSection>

          {/* 3 */}
          <LegalSection id="eligibility" title="3. Eligibility">
            <H3>3.1 Age Requirements</H3>
            <UL>
              <LI><strong style={{ color: 'var(--white)' }}>Level 1 - AI Foundation:</strong> 12 years or older</LI>
              <LI><strong style={{ color: 'var(--white)' }}>Level 2A - AI Generalist:</strong> 16 years or older</LI>
              <LI><strong style={{ color: 'var(--white)' }}>Level 2B - AI Developer:</strong> 17 years or older</LI>
            </UL>
            <H3>3.2 Minors (Under 18 Years)</H3>
            <UL>
              <LI>Students under 18 must have written consent from a parent or legal guardian</LI>
              <LI>Parent or guardian must be present during enrollment</LI>
              <LI>Parent or guardian accepts these Terms on behalf of the minor</LI>
              <LI>The Institute reserves the right to refuse enrollment without proper parental consent</LI>
            </UL>
            <H3>3.3 No Prior Qualification Required</H3>
            <P>
              We do not require any specific educational qualification for enrollment. Basic computer
              usage ability is expected for all courses.
            </P>
          </LegalSection>

          {/* 4 */}
          <LegalSection id="enrollment" title="4. Enrollment & Registration">
            <H3>4.1 Demo Class</H3>
            <UL>
              <LI>Demo classes are <strong style={{ color: 'var(--white)' }}>free of charge</strong> and carry no obligation to enroll</LI>
              <LI>Demo class seats are limited and subject to availability</LI>
              <LI>We reserve the right to reschedule or cancel demo classes with prior notice</LI>
            </UL>
            <H3>4.2 Enrollment Process</H3>
            <UL>
              <LI>Enrollment is confirmed only upon receipt of full course fee or agreed installment</LI>
              <LI>Submission of enrollment form does not guarantee a seat</LI>
              <LI>We reserve the right to accept or decline any enrollment at our discretion</LI>
            </UL>
            <H3>4.3 Batch Allocation</H3>
            <P>
              Students will be allocated to a batch based on availability and timing preferences. We
              reserve the right to merge or restructure batches if required.
            </P>
          </LegalSection>

          {/* 5 */}
          <LegalSection id="fees" title="5. Course Fees & Payment">
            <H3>5.1 Fee Structure</H3>
            <UL>
              <LI>Course fees are communicated at the time of enrollment at our center</LI>
              <LI>Fees are not displayed on our website - please visit or contact us for current pricing</LI>
              <LI>All fees are in Indian Rupees (INR) inclusive of applicable taxes</LI>
            </UL>
            <H3>5.2 Payment Terms</H3>
            <UL>
              <LI>Fees must be paid as per the payment schedule agreed at enrollment</LI>
              <LI>Accepted payment modes: Cash, UPI, Bank Transfer, and other available modes</LI>
              <LI>A receipt will be issued for all payments made</LI>
            </UL>
            <H3>5.3 Refund Policy</H3>
            <WarningBox>
              <strong style={{ color: 'var(--orange)' }}>
                All course fees paid to PRIM AI Institute are strictly non-refundable.
              </strong>{' '}
              Please refer to our{' '}
              <Link
                to="/refund-policy"
                className="hover:underline transition-colors"
                style={{ color: 'var(--orange)' }}
              >
                Refund Policy
              </Link>{' '}
              for full details.
            </WarningBox>
          </LegalSection>

          {/* 6 */}
          <LegalSection id="schedule" title="6. Course Delivery & Schedule">
            <LegalTable
              headers={['Course', 'Duration', 'Training Days']}
              rows={[
                ['Level 1 - AI Foundation', '6 to 8 Weeks', 'Monday to Friday'],
                ['Level 2A - AI Generalist', '6 to 8 Weeks', 'Monday to Friday'],
                ['Level 2B - AI Developer', '8 to 10 Weeks', 'Monday to Friday'],
              ]}
            />
            <P>
              Classes will not be held on national and state public holidays. Missed classes due to
              holidays will be compensated with makeup sessions. In case of unforeseen circumstances,
              classes may be temporarily suspended without liability on our part.
            </P>
          </LegalSection>

          {/* 7 */}
          <LegalSection id="attendance" title="7. Attendance & Student Responsibilities">
            <H3>7.1 Attendance</H3>
            <UL>
              <LI>Minimum <strong style={{ color: 'var(--white)' }}>75% attendance</strong> is required to be eligible for the course completion certificate</LI>
              <LI>Students with attendance below 75% may not receive a certificate</LI>
            </UL>
            <H3>7.2 Student Conduct</H3>
            <P>Students are expected to:</P>
            <UL>
              <LI>Behave respectfully with trainers, staff, and fellow students</LI>
              <LI>Not record, photograph, or distribute any class content without written permission</LI>
              <LI>Complete assigned exercises and projects sincerely</LI>
              <LI>Not share login credentials for any Institute platforms with unauthorized persons</LI>
            </UL>
            <H3>7.3 Disciplinary Action</H3>
            <P>
              The Institute reserves the right to issue warnings, suspend, or terminate enrollment
              for serious misconduct without refund, and to take legal action for theft of
              intellectual property or harassment.
            </P>
          </LegalSection>

          {/* 8 */}
          <LegalSection id="certificate" title="8. Certificate">
            <P>A course completion certificate will be issued to students who:</P>
            <UL>
              <LI>Complete the course with minimum <strong style={{ color: 'var(--white)' }}>75% attendance</strong></LI>
              <LI>Submit the required capstone project or final assignment</LI>
              <LI>Clear all outstanding fee payments</LI>
            </UL>
            <P>
              Certificates are issued within{' '}
              <strong style={{ color: 'var(--white)' }}>15 working days</strong> of course
              completion. Please ensure your name is correctly provided at enrollment as it will
              appear on the certificate.
            </P>
          </LegalSection>

          {/* 9 */}
          <LegalSection id="placement" title="9. Placement Support">
            <HighlightBox>
              <strong style={{ color: 'var(--electric)' }}>
                PRIM AI Institute does not guarantee job placement or employment
              </strong>{' '}
              to any student. Placement support is provided on a best-effort basis. Final hiring
              decisions rest entirely with the employer companies.
            </HighlightBox>
            <P>What we provide:</P>
            <UL>
              <LI>Access to our network of 1500+ hiring partner companies</LI>
              <LI>Resume review and guidance</LI>
              <LI>Mock interview preparation</LI>
              <LI>Referrals to companies for suitable openings</LI>
            </UL>
          </LegalSection>

          {/* 10 */}
          <LegalSection id="ip" title="10. Intellectual Property">
            <H3>10.1 Course Materials</H3>
            <P>
              All course content, study materials, presentations, videos, and resources provided by
              PRIM AI Institute are the{' '}
              <strong style={{ color: 'var(--white)' }}>
                exclusive intellectual property of the Institute
              </strong>
              . Reproduction, distribution, resale, or sharing of course materials in any form is
              strictly prohibited.
            </P>
            <H3>10.2 Third-Party Tools</H3>
            <P>
              Courses involve third-party AI tools (ChatGPT, Canva AI, GitHub Copilot, etc.). Use of
              these tools is subject to each tool's own Terms of Service. PRIM AI Institute is not
              affiliated with, endorsed by, or responsible for any third-party tool.
            </P>
          </LegalSection>

          {/* 11 */}
          <LegalSection id="liability" title="11. Limitation of Liability">
            <P>
              PRIM AI Institute makes no warranty that the course will result in specific career
              outcomes, salary increases, or business success. To the maximum extent permitted by
              Indian law, our total liability to any student shall not exceed the course fee paid by
              that student.
            </P>
            <P>
              We are not liable for any indirect, incidental, or consequential losses, or for failure
              to deliver services due to circumstances beyond our reasonable control including natural
              disasters, pandemics, government orders, or power failures.
            </P>
          </LegalSection>

          {/* 12 */}
          <LegalSection id="privacy-ref" title="12. Privacy">
            <P>
              Your personal data is handled in accordance with our{' '}
              <Link
                to="/privacy"
                className="hover:underline transition-colors"
                style={{ color: 'var(--electric)' }}
              >
                Privacy Policy
              </Link>
              , which forms part of these Terms & Conditions. By enrolling, you agree to our Privacy
              Policy.
            </P>
          </LegalSection>

          {/* 13 */}
          <LegalSection id="website" title="13. Website Use">
            <P>
              You agree not to use our website for any unlawful purpose, attempt to hack or disrupt
              our website, post harmful or misleading content, or scrape website content without
              permission. We do not guarantee uninterrupted access to our website.
            </P>
          </LegalSection>

          {/* 14 */}
          <LegalSection id="amendments" title="14. Amendments to Terms">
            <P>
              PRIM AI Institute reserves the right to update these Terms at any time. Updated terms
              will be posted on our website with a revised "Last Updated" date. Enrolled students
              will be notified of significant changes via WhatsApp or email. Continued enrollment
              after changes constitutes acceptance of the updated terms.
            </P>
          </LegalSection>

          {/* 15 */}
          <LegalSection id="governing" title="15. Governing Law & Jurisdiction">
            <P>
              These Terms are governed by the{' '}
              <strong style={{ color: 'var(--white)' }}>laws of India</strong>. Any dispute arising
              out of these Terms shall be subject to the exclusive jurisdiction of the courts in{' '}
              <strong style={{ color: 'var(--white)' }}>Ahmedabad, Gujarat, India</strong>. We
              encourage resolution of disputes through direct communication before any legal action.
            </P>
          </LegalSection>

          {/* 16 */}
          <LegalSection id="grievance-tc" title="16. Grievance Redressal">
            <P>If you have any complaint or concern regarding our services:</P>
            <ContactBlock
              linkColor="var(--orange)"
              items={[
                { icon: '📧', text: 'info@primai.in', href: 'mailto:info@primai.in' },
                { icon: '📞', text: '+91 7573055577', href: 'tel:+917573055577' },
                { icon: '💬', text: 'WhatsApp: +91 7573055577' },
                { icon: '🕐', text: 'Response: 72 hours · Resolution: 30 days' },
              ]}
            />
            <P className="mt-4">
              If unresolved, you may approach the appropriate{' '}
              <strong style={{ color: 'var(--white)' }}>
                Consumer Disputes Redressal Forum
              </strong>{' '}
              under the Consumer Protection Act, 2019.
            </P>
          </LegalSection>

          {/* Disclaimer */}
          <div
            className="rounded-xl p-5 mt-10"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs leading-[1.7]" style={{ color: 'var(--muted)' }}>
              <strong style={{ color: 'var(--white)' }}>Disclaimer:</strong>{' '}
              These Terms & Conditions have been prepared as a general framework for an AI training
              institute operating in India. It is strongly recommended that you have these reviewed
              by a qualified legal professional before publishing.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
