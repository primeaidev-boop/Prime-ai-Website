import { forwardRef, useId } from 'react';
import styles from './Certificate.module.css';

/** Real PRIM AI Institute logo (same artwork as the admin sidebar's Asset 16.svg), inlined as
 * JSX so html2canvas captures it via vector paths rather than a base64 raster fallback. */
function PrimLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 233.83 48.84" xmlns="http://www.w3.org/2000/svg">
      <path fill="#fff" d="M.01.14h21.05c1.94,0,3.61-.07,5.54.37,2.69.62,5.16,1.94,7.15,3.84,3.09,3.01,4.88,7.12,4.98,11.43.08,4.39-1.49,8.78-4.58,11.94-2.39,2.48-5.59,4-9.03,4.3-1.21.1-2.94.05-4.18.05-2.28,0-4.56,0-6.84,0-.18,0-.32.14-.32.32-.07,5.35-.06,10.9-.06,16.26-.12.11-7.34.01-8.05,0-.15-5.58.1-11.29,0-16.88-.03-1.79.73-3.78,1.84-5.18,1.3-1.67,3.22-2.76,5.33-3.01.82-.09,2.15-.06,3-.06h4.84c1.36.01,3.32.11,4.6-.21,1.12-.29,2.15-.86,2.99-1.65,4.3-4.04,2.08-12.45-4.08-12.99-.61-.05-1.33-.03-1.94-.03h-3.24s-8.4,0-8.4,0c-1.51,0-3.1.03-4.6,0-.29-.37-.61-.83-.88-1.23C3.49,4.97,1.63,2.59.01.14Z" />
      <path fill="#f36d21" fillRule="evenodd" d="M4.76,11.62c.77,0,1.42.49,1.66,1.18h15.12c.36,0,.71.15.97.41l1.7,1.76c.48.5.51,1.28.06,1.8l-1.73,2.03s-.08.09-.13.13c-.15.58-.68,1.01-1.3,1.01-.5,0-.93-.27-1.17-.67H6.79c-.08,0-.16.04-.21.1l-1.48,1.79h0s0,0,0,0l-1.79,2.14c.12.24.2.51.2.8,0,.96-.78,1.74-1.75,1.74s-1.75-.78-1.75-1.74.78-1.74,1.75-1.74c.28,0,.55.07.79.19l1.73-2.07,1.48-1.79c.26-.31.64-.49,1.04-.49h13.03c.17-.54.68-.94,1.28-.94.38,0,.73.16.98.42l1.37-1.6c.09-.11.08-.26-.01-.36l-1.7-1.76c-.05-.05-.12-.08-.19-.08H6.44c-.22.71-.89,1.23-1.67,1.23-.97,0-1.75-.78-1.75-1.74s.78-1.74,1.75-1.74ZM1.75,23.22c-.49,0-.89.4-.89.89s.4.89.89.89.89-.4.89-.89-.4-.89-.89-.89ZM4.76,12.48c-.49,0-.89.4-.89.89s.4.89.89.89.89-.4.89-.89-.4-.89-.89-.89Z" />
      <path fill="#f36d21" d="M37.66,26.32c.05.27-.36,1.3-.47,1.58-1.01,2.66-2.66,5.03-4.81,6.9-.4.35-.83.68-1.27.98s-.85.56-1.29.81-.87.46-1.32.65-.9.36-1.36.5-.93.26-1.4.36-.97.18-1.45.24-1.01.1-1.51.13-1.05.04-1.58.03c-.27,0-.55,0-.82-.02-.14,0-.28,0-.42-.01-.26-.01-.32-.03-.41.22s-.16.49-.25.74c-.17.5-.35,1-.54,1.5-.71,1.88-1.51,3.77-2.68,5.42-.08.1-.57.72-.57.32v-10.94c0-.45-.01-1.15.05-1.57.11-.13.18-.19.37-.19,2.91-.08,5.89.11,8.8-.05.95-.06,1.9-.2,2.83-.42,4.14-1.02,7.89-3.52,10.12-7.19Z" />
      <path fill="#f36d21" d="M233.83,0v27.72h-7.71V0h7.71Z" />
      <path fill="#f36d21" d="M208.87,23.2h-9.83l-1.49,4.52h-8.1L199.55,0h8.89l10.07,27.72h-8.14l-1.49-4.52ZM206.94,17.3l-2.99-8.97-2.95,8.97h5.94Z" />
      <path fill="#fff" d="M169.19,0v27.72h-7.71v-15.3l-5.23,15.3h-6.45l-5.27-15.41v15.41h-7.71V0h9.32l6.96,18.01,6.8-18.01h9.28Z" />
      <path fill="#fff" d="M127.33,0v27.72h-7.71V0h7.71Z" />
      <path fill="#fff" d="M102.55,27.72l-5.51-10.22h-.83v10.22h-7.71V0h12.15c2.23,0,4.12.39,5.66,1.18,1.55.76,2.71,1.82,3.5,3.19.79,1.34,1.18,2.84,1.18,4.52,0,1.89-.52,3.55-1.57,4.99-1.02,1.42-2.53,2.42-4.52,3.03l6.25,10.81h-8.61ZM96.22,12.23h3.81c1.05,0,1.84-.25,2.36-.75.52-.5.79-1.22.79-2.16,0-.89-.28-1.59-.83-2.08-.52-.52-1.3-.79-2.32-.79h-3.81v5.78Z" />
      <path fill="#fff" d="M80.3,9.24c0,1.68-.39,3.21-1.18,4.6-.76,1.36-1.93,2.46-3.5,3.3-1.55.81-3.45,1.22-5.7,1.22h-3.81v9.36h-7.71V0h11.52c2.23,0,4.12.39,5.66,1.18,1.57.79,2.75,1.87,3.54,3.26s1.18,2.99,1.18,4.8ZM69.17,12.23c2.18,0,3.26-1,3.26-2.99s-1.09-3.03-3.26-3.03h-3.07v6.02h3.07Z" />
      <path fill="#fff" d="M226.06,48.68v-10.01h6.51v1.52h-4.7v2.72h4.36v1.52h-4.36v2.73h4.74v1.52h-6.55Z" />
      <path fill="#fff" d="M203.74,40.19v-1.52h7.99v1.52h-3.09v8.49h-1.8v-8.49h-3.09Z" />
      <path fill="#fff" d="M187.59,38.67h1.81v6.54c0,.72-.17,1.35-.51,1.89-.34.54-.81.97-1.42,1.28-.61.3-1.32.45-2.14.45s-1.53-.15-2.14-.45c-.61-.31-1.08-.73-1.42-1.28-.34-.54-.5-1.17-.5-1.89v-6.54h1.81v6.39c0,.42.09.79.27,1.11.19.33.45.58.78.77.34.18.73.27,1.19.27s.86-.09,1.19-.27c.34-.19.6-.44.78-.77s.27-.7.27-1.11v-6.39Z" />
      <path fill="#fff" d="M158.96,40.19v-1.52h7.99v1.52h-3.09v8.49h-1.8v-8.49h-3.09Z" />
      <path fill="#fff" d="M144.63,38.67v10.01h-1.81v-10.01h1.81Z" />
      <path fill="#fff" d="M120.49,40.19v-1.52h7.99v1.52h-3.09v8.49h-1.8v-8.49h-3.09Z" />
      <path fill="#fff" d="M104.64,41.43c-.05-.43-.24-.76-.58-1-.34-.24-.77-.36-1.31-.36-.38,0-.7.06-.97.17-.27.11-.48.27-.62.46-.14.2-.22.42-.22.67,0,.21.05.39.14.54.1.15.23.28.4.39.17.1.35.19.55.26.2.07.41.13.61.18l.94.23c.38.09.74.21,1.09.36.35.15.67.34.94.57.28.23.5.5.66.83.16.32.24.7.24,1.13,0,.59-.15,1.1-.45,1.55-.3.44-.73.79-1.3,1.04-.56.25-1.25.37-2.05.37s-1.45-.12-2.03-.36c-.57-.24-1.02-.59-1.34-1.06-.32-.46-.49-1.03-.52-1.69h1.78c.03.35.13.64.32.87.19.23.43.4.74.52.31.11.65.17,1.03.17s.74-.06,1.04-.18c.3-.12.53-.29.7-.5.17-.21.26-.47.26-.75,0-.26-.08-.48-.23-.65-.15-.17-.36-.32-.63-.43-.27-.12-.58-.22-.94-.31l-1.14-.29c-.82-.21-1.48-.53-1.95-.96-.48-.43-.71-1.01-.71-1.73,0-.59.16-1.11.48-1.55.32-.44.76-.79,1.31-1.03.55-.25,1.18-.37,1.88-.37s1.33.12,1.87.37c.54.24.96.58,1.27,1.02.31.43.46.93.47,1.5h-1.74Z" />
      <path fill="#fff" d="M84.42,38.67v10.01h-1.61l-4.72-6.82h-.08v6.82h-1.81v-10.01h1.62l4.71,6.82h.09v-6.82h1.8Z" />
      <path fill="#fff" d="M61.43,38.67v10.01h-1.81v-10.01h1.81Z" />
    </svg>
  );
}

export interface CertificateProps {
  /** 1. Learner's full name exactly as it should appear on the certificate */
  recipientName: string;
  /** 2. The completed tutorial's display name */
  tutorialTitle: string;
  /** 3. Pre-formatted completion date, e.g. "23 June 2026" */
  completionDate: string;
  /** 4. Stable certificate ID, e.g. "PRIM-CHAT-2026-0001" - re-downloads must show the same value */
  certificateId: string;
  /** 5. Institute signatory name (admin-set, global setting - same on every certificate) */
  signatoryName: string;
  /** 6. Institute signatory title (admin-set, global setting - same on every certificate) */
  signatoryTitle: string;
}

/**
 * Fixed 1123x794px (A4 landscape @96dpi) for crisp PNG/PDF export.
 * The ref is attached to this exact node so html2canvas captures it at full size
 * regardless of any CSS transform: scale() applied by a parent preview wrapper.
 */
export const Certificate = forwardRef<HTMLDivElement, CertificateProps>(function Certificate(
  { recipientName, tutorialTitle, completionDate, certificateId, signatoryName, signatoryTitle },
  ref,
) {
  const ringId = `cert-ring-${useId()}`;

  return (
    <div ref={ref} className={styles.cert}>
      <div className={styles.texture} />
      <div className={styles.frame} />

      <svg className={`${styles.circuit} ${styles.tl}`} viewBox="0 0 120 120" fill="none">
        <path d="M2 40 H30 L46 24 H86" stroke="#f97316" strokeWidth="2" />
        <path d="M2 64 H22 L40 82 H78" stroke="#22d3ee" strokeWidth="2" />
        <circle cx="86" cy="24" r="4" fill="#f97316" />
        <circle cx="78" cy="82" r="4" fill="#22d3ee" />
        <circle cx="2" cy="40" r="3" fill="#f97316" />
        <circle cx="2" cy="64" r="3" fill="#22d3ee" />
      </svg>
      <svg className={`${styles.circuit} ${styles.br}`} viewBox="0 0 120 120" fill="none">
        <path d="M2 40 H30 L46 24 H86" stroke="#22d3ee" strokeWidth="2" />
        <path d="M2 64 H22 L40 82 H78" stroke="#f97316" strokeWidth="2" />
        <circle cx="86" cy="24" r="4" fill="#22d3ee" />
        <circle cx="78" cy="82" r="4" fill="#f97316" />
      </svg>

      <div className={styles.certInner}>
        <PrimLogo className={styles.logo} />

        <div className={styles.eyebrow}>
          Certificate<span className={styles.dot} />of<span className={styles.dot} />Completion
        </div>

        <div className={styles.present}>This is proudly presented to</div>
        <div className={styles.name}>{recipientName}</div>
        <div className={styles.nameRule} />

        <div className={styles.forLine}>for successfully completing the guided tutorial</div>
        <div className={styles.tutorialTitle}>{tutorialTitle}</div>
        <div className={styles.blurb}>
          A self-paced AI tool tutorial from the PRIM AI Institute Free Tutorials library -
          demonstrating hands-on familiarity with the tool and its core workflows.
        </div>

        <div className={styles.foot}>
          <div className={styles.footCol}>
            <span className={styles.footLabel}>Date of completion</span>
            <span className={styles.footValue}>{completionDate}</span>
            <span className={styles.footLabel} style={{ marginTop: 10 }}>Certificate ID</span>
            <span className={styles.footValue} style={{ fontSize: 12, letterSpacing: '.05em' }}>
              {certificateId}
            </span>
          </div>

          <div className={styles.seal} aria-hidden="true">
            <svg viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="56" stroke="#22d3ee" strokeWidth="1.5" opacity=".5" />
              <circle cx="60" cy="60" r="46" stroke="#22d3ee" strokeWidth="1" opacity=".35" />
              <circle cx="60" cy="60" r="33" fill="#0c1517" stroke="#f97316" strokeWidth="1.5" />
              <path id={ringId} d="M60 18 a42 42 0 1 1 -0.1 0" fill="none" />
              <text fontFamily="Montserrat" fontSize="9.2" fontWeight="700" letterSpacing="2.4" fill="#22d3ee">
                <textPath href={`#${ringId}`} startOffset="0%">PRIM AI INSTITUTE • VERIFIED COMPLETION • </textPath>
              </text>
              <path d="M48 40 H62 L70 33 H82" stroke="#f97316" strokeWidth="2" fill="none" />
              <circle cx="82" cy="33" r="3" fill="#f97316" />
              <text x="60" y="66" textAnchor="middle" fontFamily="Montserrat" fontWeight="800" fontSize="26" fill="#ffffff">P</text>
              <text x="60" y="80" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="7" letterSpacing="1.5" fill="#9fb0b4">ISO 9001:2015</text>
            </svg>
          </div>

          <div className={`${styles.footCol} ${styles.right}`}>
            <div className={styles.sigLine} />
            <span className={styles.footValue}>{signatoryName || '-'}</span>
            <span className={styles.footLabel}>{signatoryTitle}</span>
          </div>
        </div>
      </div>

      <div className={styles.micro}>
        Verify this certificate at <b>primaiinstitute.com/verify</b> &nbsp;•&nbsp; Issued by{' '}
        <b>PRIM AI Institute</b>, Ahmedabad, India &nbsp;•&nbsp; ISO 9001:2015 certified
      </div>
    </div>
  );
});
