// Renders a program-page media slot: a plain image, or a muted looping video
// with poster-first display. One component for every slot so behavior stays
// identical everywhere:
//   - Poster image renders instantly in the exact same box; the video fades
//     in over it when its first frame is ready - zero layout shift.
//   - The video source is only attached when the slot comes within 200px of
//     the viewport (IntersectionObserver), plays on enter, pauses on exit -
//     opening the page never loads every video at once.
//   - Falls back to the image silently when the video errors, the visitor
//     has Save-Data enabled, or prefers-reduced-motion is set.

import { useEffect, useRef, useState } from 'react';
import { convertImageUrl } from '@/lib/imageUrl';
import { toMedia, type PgMediaValue } from '@/data/programPagesData';

// Evaluated once - these don't change mid-visit in any way worth reacting to.
const VIDEO_DISABLED = (() => {
  if (typeof window === 'undefined') return true;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
})();

const fillStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

export function MediaDisplay({
  media,
  alt,
  className,
  style,
  placeholder,
}: {
  media: PgMediaValue | undefined;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: React.ReactNode;
}) {
  const m = toMedia(media);
  const [failed, setFailed] = useState(false);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const showVideo =
    m.type === 'video' && Boolean(m.videoUrl) && !failed && !VIDEO_DISABLED;

  useEffect(() => {
    if (!showVideo) return;
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { rootMargin: '200px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [showVideo]);

  if (!showVideo) {
    if (!m.imageUrl) {
      return (
        <>
          {placeholder ?? (
            <div className={`pp-img-placeholder ${className ?? ''}`} style={style}>
              <span>📷 Add image URL in admin</span>
            </div>
          )}
        </>
      );
    }
    return (
      <img src={convertImageUrl(m.imageUrl)} alt={alt} className={className} style={style} />
    );
  }

  // Video slot: the wrapper takes the exact className/style the image would
  // have had (dimensions, border-radius, aspect-ratio), so the box is
  // identical in both states; poster and video fill it absolutely. A wrapper
  // with no height of its own (children are absolute) gets a 16/9 default so
  // it can never collapse - callers with fixed heights/aspects are untouched.
  const hasOwnHeight = Boolean(style?.height || style?.aspectRatio || className);
  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        ...(hasOwnHeight ? {} : { aspectRatio: '16/9' }),
        ...style,
        position: 'relative',
        overflow: 'hidden',
        padding: 0,
      }}
    >
      {m.imageUrl && (
        <img src={convertImageUrl(m.imageUrl)} alt={alt} style={fillStyle} />
      )}
      <video
        ref={videoRef}
        src={near ? m.videoUrl : undefined}
        poster={m.imageUrl ? convertImageUrl(m.imageUrl) : undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        onCanPlay={() => setReady(true)}
        onError={() => setFailed(true)}
        style={{ ...fillStyle, opacity: ready ? 1 : 0, transition: 'opacity 0.5s ease' }}
      />
    </div>
  );
}
