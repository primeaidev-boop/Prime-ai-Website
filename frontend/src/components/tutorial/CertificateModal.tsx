import { useState, useRef, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Certificate as CertificateRecord } from '@/types';
import { Certificate } from './Certificate';
import { setLearnerName } from '@/data/userProgress';
import {
  getStoredTutorialUser, setStoredTutorialUser,
  getOrCreateCertificateId, formatCertDate,
} from '@/data/certificates';
import { useSettingsStore } from '@/store/settingsStore';

interface Props {
  certificate: CertificateRecord;
  onClose: () => void;
  onNameSaved?: (name: string) => void;
}

const CERT_WIDTH = 1123;
const CERT_HEIGHT = 794;

export function CertificateModal({ certificate, onClose, onNameSaved }: Props) {
  const signatoryName = useSettingsStore((s) => s.s.signatoryName);
  const signatoryTitle = useSettingsStore((s) => s.s.signatoryTitle);

  // ── Name source fallback chain ───────────────────────────────────────────────
  // 1) name captured by the tutorial lead-gate (primAI_tutorialUser)
  // 2) learnerName already attached to this progress's certificate record
  // 3) manual "Enter your full name" gate below, persisted for next time
  const stored = getStoredTutorialUser();
  const initialName = stored?.name || certificate.learnerName || '';
  const [nameInput, setNameInput] = useState(initialName);
  const [confirmed, setConfirmed] = useState(!!initialName);
  const [downloading, setDownloading] = useState<'png' | 'pdf' | null>(null);

  const certRef = useRef<HTMLDivElement>(null);
  const previewWrapRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Responsive on-screen preview only - capture always happens at the fixed 1123x794 size.
  useEffect(() => {
    const update = () => {
      if (!previewWrapRef.current) return;
      const w = previewWrapRef.current.offsetWidth;
      setScale(Math.min(1, w / CERT_WIDTH));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const handleConfirmName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setLearnerName(trimmed);
    setStoredTutorialUser(trimmed);
    onNameSaved?.(trimmed);
    setConfirmed(true);
  };

  const displayName = confirmed ? (nameInput.trim() || 'Learner') : '';
  const certificateId = getOrCreateCertificateId(certificate.tutorialId, certificate.tutorialName);
  const completionDate = formatCertDate(certificate.earnedAt);

  const capture = useCallback(async () => {
    const node = certRef.current;
    const clip = clipRef.current;
    const scaler = scalerRef.current;
    if (!node || !clip || !scaler) return null;

    // Capture the single visible certificate node directly - no second off-screen
    // duplicate. A hidden node positioned at extreme negative coordinates is what
    // produced the earlier *blank* export: foreignObjectRendering serializes the
    // element via SVG and silently rasterizes to nothing once it sits far outside
    // the viewport. Instead, briefly neutralize the preview's scale-down transform
    // and its clipping wrapper so the on-screen node is captured at full size, then
    // restore both right after.
    const prevClip = { height: clip.style.height, overflow: clip.style.overflow };
    const prevScaler = { transform: scaler.style.transform };
    clip.style.height = `${CERT_HEIGHT}px`;
    clip.style.overflow = 'visible';
    scaler.style.transform = 'none';

    try {
      await document.fonts.ready;
      // Two animation frames let the browser fully settle the webfont swap/reflow
      // before html2canvas clones the DOM - avoids a transient double-paint.
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      return await html2canvas(node, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        // foreignObjectRendering produces a fully blank canvas for this markup
        // (confirmed - removed). The earlier text-ghosting bug was actually caused
        // by capturing the node while it still had its CSS scale-down transform
        // applied (compounding with html2canvas's own `scale` option); resetting
        // that transform above, before capture, is what fixes the ghosting - this
        // option is unrelated to that fix and was a red herring.
      });
    } finally {
      clip.style.height = prevClip.height;
      clip.style.overflow = prevClip.overflow;
      scaler.style.transform = prevScaler.transform;
    }
  }, []);

  const downloadPNG = async () => {
    setDownloading('png');
    try {
      const canvas = await capture();
      if (!canvas) return;
      const a = document.createElement('a');
      a.download = `${certificateId}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } finally {
      setDownloading(null);
    }
  };

  const downloadPDF = async () => {
    setDownloading('pdf');
    try {
      const canvas = await capture();
      if (!canvas) return;
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [CERT_WIDTH, CERT_HEIGHT] });
      pdf.addImage(img, 'PNG', 0, 0, CERT_WIDTH, CERT_HEIGHT);
      pdf.save(`${certificateId}.pdf`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative z-10 w-full max-w-2xl glass-card rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(0,212,255,0.3)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span className="font-bold text-sm" style={{ color: 'var(--electric)', fontFamily: 'Montserrat, sans-serif', letterSpacing: 2 }}>
            CERTIFICATE OF COMPLETION
          </span>
          <button onClick={onClose} className="text-xl" style={{ color: 'var(--muted)' }}>✕</button>
        </div>

        {/* Name gate - shown once if no name is known yet */}
        {!confirmed ? (
          <div className="p-8 text-center">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--white)', fontFamily: 'Montserrat, sans-serif' }}>
              Your certificate is ready!
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
              Enter your name as it should appear on the certificate.
            </p>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmName()}
              placeholder="Your full name"
              className="mb-4"
              autoFocus
            />
            <button
              onClick={handleConfirmName}
              disabled={!nameInput.trim()}
              className="btn-primary w-full disabled:opacity-50"
            >
              Generate Certificate
            </button>
          </div>
        ) : (
          <>
            {/* Certificate preview - this exact node is captured for PNG/PDF export.
                Its scale-down transform and clipping wrapper are temporarily reset to
                full size by capture() right before html2canvas runs, then restored. */}
            <div ref={previewWrapRef} className="px-6 pt-6">
              <div ref={clipRef} style={{ width: '100%', height: CERT_HEIGHT * scale, overflow: 'hidden', borderRadius: 12 }}>
                <div ref={scalerRef} style={{ width: CERT_WIDTH, height: CERT_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                  <Certificate
                    ref={certRef}
                    recipientName={displayName}
                    tutorialTitle={certificate.tutorialName}
                    completionDate={completionDate}
                    certificateId={certificateId}
                    signatoryName={signatoryName}
                    signatoryTitle={signatoryTitle}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 py-6 flex-wrap">
              <button
                onClick={downloadPNG}
                disabled={downloading !== null}
                className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-60"
              >
                {downloading === 'png' ? 'Preparing…' : '⬇ Download PNG'}
              </button>
              <button
                onClick={downloadPDF}
                disabled={downloading !== null}
                className="btn-electric flex-1 text-sm py-2.5 disabled:opacity-60"
              >
                {downloading === 'pdf' ? 'Preparing…' : '⬇ Download PDF'}
              </button>
              <button onClick={onClose} className="btn-outline text-sm px-5 py-2.5">
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
