export function CoursePathConnector() {
  return (
    <div
      className="relative flex flex-col items-center w-full py-2 select-none"
      aria-hidden="true"
    >
      {/* SVG connector */}
      <div className="block w-full max-w-[700px] mx-auto">
        <svg
          viewBox="0 0 700 160"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto overflow-visible"
        >
          <defs>
            {/* Glow filters */}
            <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradient definitions */}
            <linearGradient id="stem-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="orange-grad" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#ff9500" />
              <stop offset="100%" stopColor="#ff6b2b" />
            </linearGradient>
            <linearGradient id="purple-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>

            <style>{`
              @keyframes cpc-flow-down {
                from { stroke-dashoffset: 200; }
                to   { stroke-dashoffset: 0; }
              }
              @keyframes cpc-flow-branch {
                from { stroke-dashoffset: 300; }
                to   { stroke-dashoffset: 0; }
              }
              @keyframes cpc-pulse-dot {
                0%, 100% { opacity: 1; }
                50%       { opacity: 0.4; }
              }
              .cpc-stem {
                stroke-dasharray: 8 6;
                animation: cpc-flow-down 1.2s linear infinite;
              }
              .cpc-orange {
                stroke-dasharray: 8 6;
                animation: cpc-flow-branch 1.4s linear infinite;
                animation-delay: 0.3s;
              }
              .cpc-purple {
                stroke-dasharray: 8 6;
                animation: cpc-flow-branch 1.4s linear infinite;
                animation-delay: 0.3s;
              }
              .cpc-dot {
                animation: cpc-pulse-dot 2s ease-in-out infinite;
              }
              @media (prefers-reduced-motion: reduce) {
                .cpc-stem, .cpc-orange, .cpc-purple {
                  animation: none;
                  stroke-dasharray: none;
                }
                .cpc-dot {
                  animation: none;
                }
              }
            `}</style>
          </defs>

          {/* Top stem: center top ➞ junction */}
          <path
            d="M 350 0 L 350 55"
            stroke="#00d4ff"
            strokeWidth="1.5"
            strokeOpacity="0.3"
            fill="none"
          />
          <path
            d="M 350 0 L 350 55"
            stroke="url(#stem-grad)"
            strokeWidth="2"
            fill="none"
            filter="url(#glow-cyan)"
            className="cpc-stem"
          />

          {/* Junction dot */}
          <circle
            cx="350"
            cy="55"
            r="5"
            fill="#00d4ff"
            opacity="0.9"
            filter="url(#glow-cyan)"
            className="cpc-dot"
          />

          {/* "CHOOSE YOUR TRACK" pill - centered on junction (y=55) */}
          <rect
            x="246" y="32" width="208" height="32"
            rx="16" ry="16"
            fill="rgba(2,8,24,0.95)"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
          <text
            x="350" y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#8a9bc0"
            fontSize="11"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontWeight="600"
            letterSpacing="2"
          >
            CHOOSE YOUR TRACK
          </text>

          {/* Left branch ➞ Level 2A (orange) */}
          <path
            d="M 350 55 C 350 110, 175 110, 175 160"
            stroke="#ff6b2b"
            strokeWidth="1.5"
            strokeOpacity="0.25"
            fill="none"
          />
          <path
            d="M 350 55 C 350 110, 175 110, 175 160"
            stroke="url(#orange-grad)"
            strokeWidth="2.5"
            fill="none"
            filter="url(#glow-orange)"
            className="cpc-orange"
          />
          <circle cx="175" cy="158" r="4" fill="#ff6b2b" opacity="0.9" filter="url(#glow-orange)" />

          {/* Right branch ➞ Level 2B (purple) */}
          <path
            d="M 350 55 C 350 110, 525 110, 525 160"
            stroke="#a78bfa"
            strokeWidth="1.5"
            strokeOpacity="0.25"
            fill="none"
          />
          <path
            d="M 350 55 C 350 110, 525 110, 525 160"
            stroke="url(#purple-grad)"
            strokeWidth="2.5"
            fill="none"
            filter="url(#glow-purple)"
            className="cpc-purple"
          />
          <circle cx="525" cy="158" r="4" fill="#a78bfa" opacity="0.9" filter="url(#glow-purple)" />
        </svg>
      </div>

    </div>
  );
}
