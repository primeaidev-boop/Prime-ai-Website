import { useState } from 'react';
import type { Certificate } from '@/types';
import { setLearnerName } from '@/data/userProgress';

interface Props {
  certificate: Certificate;
  onClose: () => void;
  onNameSaved?: (name: string) => void;
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

/** Opens a print-ready window with a white-background certificate. */
function printCertificate(cert: Certificate, name: string): void {
  const win = window.open('', '_blank', 'width=900,height=650');
  if (!win) return;
  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Certificate - ${cert.tutorialName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; }
    .cert {
      width: 820px; border: 3px solid #00D4FF; border-radius: 16px;
      padding: 56px 64px; text-align: center; position: relative;
      background: linear-gradient(135deg, #f0f8ff 0%, #fff 60%);
    }
    .cert::before {
      content: ''; position: absolute; inset: 8px; border-radius: 10px;
      border: 1px dashed rgba(0,212,255,0.4); pointer-events: none;
    }
    .logo { font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 800; color: #020818; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
    .logo span { color: #00D4FF; }
    .tagline { font-size: 11px; color: #8a9bc0; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 40px; }
    .cert-title { font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 700; color: #020818; margin-bottom: 32px; }
    .certify { font-size: 15px; color: #6b7a9a; margin-bottom: 12px; }
    .learner { font-family: 'Montserrat', sans-serif; font-size: 40px; font-weight: 800; color: #020818; border-bottom: 3px solid #00D4FF; display: inline-block; padding-bottom: 4px; margin: 4px 0 32px; }
    .completed { font-size: 15px; color: #6b7a9a; margin-bottom: 12px; }
    .tut-name { font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 700; color: #FF6B2B; margin-bottom: 8px; }
    .date { font-size: 13px; color: #8a9bc0; margin-top: 8px; letter-spacing: 1px; }
    .divider { width: 80px; height: 3px; background: linear-gradient(90deg, #00D4FF, #FF6B2B); margin: 36px auto 24px; border-radius: 99px; }
    .footer { font-size: 12px; color: #8a9bc0; letter-spacing: 2px; text-transform: uppercase; }
    @media print { body { margin: 0; } .cert { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="cert">
    <div class="logo">PRIM <span>AI</span> Institute</div>
    <div class="tagline">Ahmedabad · Gujarat · India</div>
    <div class="cert-title">Certificate of Completion</div>
    <div class="certify">This is to certify that</div>
    <div class="learner">${name || 'Learner'}</div>
    <div class="completed">has successfully completed the</div>
    <div class="tut-name">${cert.tutorialName} Tutorial</div>
    <div class="date">Completed on ${fmt(cert.earnedAt)}</div>
    <div class="divider"></div>
    <div class="footer">STAD Solution &nbsp;·&nbsp; stadsolution.com</div>
  </div>
  <script>setTimeout(() => { window.print(); }, 500);<\/script>
</body>
</html>`);
  win.document.close();
}

export function CertificateModal({ certificate, onClose, onNameSaved }: Props) {
  const initialName = certificate.learnerName ?? '';
  const [nameInput, setNameInput] = useState(initialName);
  const [confirmed, setConfirmed] = useState(!!initialName);

  const handleConfirmName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setLearnerName(trimmed);
    onNameSaved?.(trimmed);
    setConfirmed(true);
  };

  const displayName = confirmed ? (nameInput.trim() || 'Learner') : '';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative z-10 w-full max-w-xl glass-card rounded-2xl overflow-hidden"
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

        {/* Name gate - shown once if learner name is empty */}
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
            {/* Certificate preview */}
            <div
              className="mx-6 my-6 rounded-xl p-8 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(255,107,43,0.04) 100%)',
                border: '2px solid rgba(0,212,255,0.25)',
              }}
            >
              {/* Corner accents */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: 'var(--electric)' }} />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: 'var(--electric)' }} />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: 'var(--electric)' }} />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: 'var(--electric)' }} />

              <div
                className="text-base font-black uppercase tracking-[0.2em] mb-1"
                style={{ color: 'var(--white)', fontFamily: 'Montserrat, sans-serif' }}
              >
                PRIM <span style={{ color: 'var(--electric)' }}>AI</span> Institute
              </div>
              <div className="text-[9px] uppercase tracking-[0.3em] mb-6" style={{ color: 'var(--muted)' }}>
                Ahmedabad · Gujarat · India
              </div>

              <div className="text-lg font-bold mb-5" style={{ color: 'var(--white)', fontFamily: 'Montserrat, sans-serif' }}>
                Certificate of Completion
              </div>

              <div className="text-xs mb-2" style={{ color: 'var(--muted)' }}>This is to certify that</div>

              <div
                className="text-2xl font-black mb-4 pb-1 inline-block"
                style={{
                  color: 'var(--white)',
                  fontFamily: 'Montserrat, sans-serif',
                  borderBottom: '2px solid var(--electric)',
                }}
              >
                {displayName}
              </div>

              <div className="text-xs mb-2" style={{ color: 'var(--muted)' }}>has successfully completed the</div>

              <div
                className="text-base font-bold mb-3"
                style={{ color: 'var(--orange)', fontFamily: 'Montserrat, sans-serif' }}
              >
                {certificate.tutorialName} Tutorial
              </div>

              <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                {fmt(certificate.earnedAt)}
              </div>

              <div
                className="w-16 h-0.5 mx-auto my-4"
                style={{ background: 'linear-gradient(90deg, var(--electric), var(--orange))' }}
              />
              <div className="text-[9px] uppercase tracking-[0.25em]" style={{ color: 'var(--muted)' }}>
                STAD Solution · stadsolution.com
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => printCertificate(certificate, displayName)}
                className="btn-primary flex-1 text-sm py-2.5"
              >
                🖨 Print / Save PDF
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
