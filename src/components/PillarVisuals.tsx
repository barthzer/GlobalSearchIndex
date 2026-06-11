"use client";

/*
  All white fill-opacity values use currentColor approach:
  - In dark mode: white with various opacities
  - In light mode: inverted via CSS class
  The accent color #EE4ECA stays consistent across themes.
*/

export function SEOTechniqueVisual() {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full text-white" fill="none">
      <mask id="mask-seo-tech" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="180">
        <rect width="320" height="180" rx="8" fill="url(#fade-seo-tech)" />
      </mask>
      <g mask="url(#mask-seo-tech)">
        <rect width="320" height="180" rx="8" fill="currentColor" fillOpacity="0.12" />
        <rect width="320" height="15" fill="currentColor" fillOpacity="0.15" />
        <rect x="10" y="5" width="5" height="5" rx="2.5" fill="#FF3333" fillOpacity="0.5" />
        <rect x="20" y="5" width="5" height="5" rx="2.5" fill="#E6FF00" fillOpacity="0.5" />
        <rect x="30" y="5" width="5" height="5" rx="2.5" fill="#33FF4E" fillOpacity="0.5" />
        {/* Left section - Bar chart */}
        <rect x="10" y="20" width="142.5" height="72.5" rx="8" fill="currentColor" fillOpacity="0.12" />
        <path d="M54.75 52.25C54.75 51.7 55.2 51.25 55.75 51.25H61.75C62.3 51.25 62.75 51.7 62.75 52.25V71.25H54.75V52.25Z" fill="currentColor" fillOpacity="0.15" />
        <rect x="54.75" y="51.52" width="8" height="20" fill="#EE4ECA" fillOpacity="0.7" />
        <path d="M69.75 62.25C69.75 61.7 70.2 61.25 70.75 61.25H76.75C77.3 61.25 77.75 61.7 77.75 62.25V71.25H69.75V62.25Z" fill="currentColor" fillOpacity="0.15" />
        <path d="M84.75 47.25C84.75 46.7 85.2 46.25 85.75 46.25H91.75C92.3 46.25 92.75 46.7 92.75 47.25V71.25H84.75V47.25Z" fill="currentColor" fillOpacity="0.12" />
        <path d="M99.75 42.25C99.75 41.7 100.2 41.25 100.75 41.25H106.75C107.3 41.25 107.75 41.7 107.75 42.25V71.25H99.75V42.25Z" fill="currentColor" fillOpacity="0.15" />
        {/* Bottom sections - Text lines */}
        <rect x="10" y="97.5" width="142.5" height="72.5" rx="8" fill="currentColor" fillOpacity="0.12" />
        {[114.25, 121.25, 127.25, 133.25, 139.25, 145.25, 151.25].map((y, i) => (
          <g key={`l-${i}`}>
            {i === 0 ? (
              <rect x="20" y={y} width="41.13" height="2" rx="1" fill="currentColor" fillOpacity="0.8" />
            ) : i % 2 === 1 ? (
              <>
                <rect x="20" y={y} width="18.25" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
                <rect x="40.25" y={y} width="18.25" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
                <rect x="60.5" y={y} width="18.25" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
              </>
            ) : (
              <>
                <rect x="20" y={y} width="28.375" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
                <rect x="50.375" y={y} width="28.375" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
              </>
            )}
          </g>
        ))}
        {/* Right section - same text lines */}
        {[114.25, 121.25, 127.25, 133.25, 139.25, 145.25, 151.25].map((y, i) => (
          <g key={`r-${i}`}>
            {i === 0 ? (
              <rect x="83.75" y={y} width="41.13" height="2" rx="1" fill="currentColor" fillOpacity="0.8" />
            ) : i % 2 === 1 ? (
              <>
                <rect x="83.75" y={y} width="18.25" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
                <rect x="104" y={y} width="18.25" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
                <rect x="124.25" y={y} width="18.25" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
              </>
            ) : (
              <>
                <rect x="83.75" y={y} width="28.375" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
                <rect x="114.125" y={y} width="28.375" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
              </>
            )}
          </g>
        ))}
        {/* Right section - Target */}
        <rect x="157.5" y="20" width="152.5" height="150" rx="8" fill="currentColor" fillOpacity="0.12" />
        <circle cx="233" cy="95" r="34" stroke="currentColor" strokeOpacity="0.15" strokeWidth="6" />
        <circle cx="233" cy="95" r="20" stroke="currentColor" strokeOpacity="0.15" strokeWidth="5" />
        <circle cx="233" cy="95" r="7" stroke="currentColor" strokeOpacity="0.15" strokeWidth="5" />
        <line x1="233" y1="95" x2="264" y2="64" stroke="#EE4ECA" strokeWidth="2.3" strokeLinecap="round" />
        <polygon points="268,60.5 262.5,66 263,61" fill="#EE4ECA" />
      </g>
      <defs>
        <linearGradient id="fade-seo-tech" x1="160" y1="180" x2="160" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopOpacity="0" />
          <stop offset="0.275" stopOpacity="0.435" />
          <stop offset="1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SEOSemantiqueVisual() {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full text-white" fill="none">
      <mask id="mask-seo-sem" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="180">
        <rect width="320" height="180" fill="url(#fade-seo-sem)" />
      </mask>
      <g mask="url(#mask-seo-sem)">
        <rect width="320" height="180" rx="8" fill="currentColor" fillOpacity="0.12" />
        <rect width="320" height="15" fill="currentColor" fillOpacity="0.15" />
        <rect x="10" y="5" width="5" height="5" rx="2.5" fill="#FF3333" fillOpacity="0.5" />
        <rect x="20" y="5" width="5" height="5" rx="2.5" fill="#E6FF00" fillOpacity="0.5" />
        <rect x="30" y="5" width="5" height="5" rx="2.5" fill="#33FF4E" fillOpacity="0.5" />
        {/* Left - List items */}
        <rect x="3" y="20" width="154.5" height="150" rx="8" fill="currentColor" fillOpacity="0.12" />
        {/* Item 1 - highlighted */}
        <path d="M8 29C8 26.8 9.8 25 12 25H148.5C150.7 25 152.5 26.8 152.5 29V42C152.5 44.2 150.7 46 148.5 46H12C9.8 46 8 44.2 8 42V29Z" fill="currentColor" fillOpacity="0.2" />
        <rect x="13" y="28" width="15" height="15" rx="4" fill="currentColor" fillOpacity="0.2" />
        <rect x="35" y="31.5" width="41.13" height="2" rx="1" fill="currentColor" fillOpacity="0.8" />
        <rect x="35" y="37.5" width="36.17" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
        <rect x="73.17" y="37.5" width="36.17" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
        <rect x="111.33" y="37.5" width="36.17" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
        {/* Item 2 */}
        <rect x="8" y="51" width="144.5" height="21" rx="4" fill="currentColor" fillOpacity="0.1" />
        <rect x="13" y="54" width="15" height="15" rx="4" fill="currentColor" fillOpacity="0.2" />
        <rect x="35" y="57.5" width="41.13" height="2" rx="1" fill="currentColor" fillOpacity="0.8" />
        <rect x="35" y="63.5" width="36.17" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
        <rect x="73.17" y="63.5" width="36.17" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
        <rect x="111.33" y="63.5" width="36.17" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
        {/* Item 3 */}
        <rect x="8" y="77" width="144.5" height="21" rx="4" fill="currentColor" fillOpacity="0.05" />
        <rect x="13" y="80" width="15" height="15" rx="4" fill="currentColor" fillOpacity="0.2" />
        <rect x="35" y="83.5" width="41.13" height="2" rx="1" fill="currentColor" fillOpacity="0.8" />
        <rect x="35" y="89.5" width="36.17" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
        <rect x="73.17" y="89.5" width="36.17" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
        <rect x="111.33" y="89.5" width="36.17" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
        {/* Item 4 */}
        <rect x="8" y="103" width="144.5" height="21" rx="4" fill="currentColor" fillOpacity="0.05" />
        <rect x="13" y="106" width="15" height="15" rx="4" fill="currentColor" fillOpacity="0.2" />
        <rect x="35" y="109.5" width="41.13" height="2" rx="1" fill="currentColor" fillOpacity="0.8" />
        <rect x="35" y="115.5" width="36.17" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
        <rect x="73.17" y="115.5" width="36.17" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
        <rect x="111.33" y="115.5" width="36.17" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
        {/* Right - Donut chart */}
        <rect x="162.5" y="20" width="154.5" height="150" rx="8" fill="currentColor" fillOpacity="0.12" />
        <text x="169" y="33" fill="currentColor" fillOpacity="0.8" fontSize="10" fontFamily="Outfit">Ranking</text>
        {/* Donut segments */}
        <circle cx="240" cy="91" r="40" stroke="#A24D8F" strokeWidth="12" strokeDasharray="80 172" transform="rotate(-90 240 91)" />
        <circle cx="240" cy="91" r="40" stroke="#922C7B" strokeWidth="12" strokeDasharray="60 192" strokeDashoffset="-80" transform="rotate(-90 240 91)" />
        <circle cx="240" cy="91" r="40" stroke="#762063" strokeWidth="12" strokeDasharray="50 202" strokeDashoffset="-140" transform="rotate(-90 240 91)" />
        <circle cx="240" cy="91" r="40" stroke="#DB5DBF" strokeWidth="12" strokeDasharray="30 222" strokeDashoffset="-190" transform="rotate(-90 240 91)" />
        <circle cx="240" cy="91" r="40" stroke="#EE4ECA" strokeWidth="12" strokeDasharray="40 212" strokeDashoffset="-220" transform="rotate(-90 240 91)" />
        <circle cx="240" cy="91" r="12" fill="currentColor" fillOpacity="0.1" />
        <circle cx="240" cy="91" r="11" stroke="currentColor" strokeOpacity="0.05" />
      </g>
      <defs>
        <linearGradient id="fade-seo-sem" x1="160" y1="180" x2="160" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopOpacity="0" />
          <stop offset="0.275" stopOpacity="0.435" />
          <stop offset="1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function GEOVisual() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-5 px-5">
      {/* Chart */}
      <div className="relative flex flex-1 flex-col justify-center">
        <span className="mb-2 text-[11px] text-text-muted">Visibilité</span>
        <svg viewBox="0 0 120 60" preserveAspectRatio="none" className="h-24 w-full">
          <polyline
            points="0,55 20,48 40,42 60,30 80,18 100,22 120,10"
            fill="none" stroke="#EE4ECA" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke"
          />
          <polyline
            points="0,55 20,48 40,42 60,30 80,18 100,22 120,10 120,60 0,60"
            fill="url(#grad-geo-area)" opacity="0.15"
            stroke="none"
          />
          <defs>
            <linearGradient id="grad-geo-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EE4ECA" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* LLM badges with real logos */}
      <div className="flex shrink-0 flex-col gap-2.5">
        {[
          { name: "ChatGPT", img: "/chatgpt.png" },
          { name: "Gemini", img: "/gemini.png" },
          { name: "Claude", img: "/claude.png" },
        ].map((llm) => (
          <div
            key={llm.name}
            className="flex items-center gap-2.5 rounded-lg border border-border-subtle bg-card-inner-bg px-4 py-2.5"
          >
            <img src={llm.img} alt={llm.name} className="h-5 w-5 rounded-sm object-contain" />
            <span className="text-[13px] text-text-secondary">{llm.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NetlinkingVisual() {
  return (
    <svg viewBox="0 0 330 180" className="h-full w-full text-white" fill="none">
      <mask id="mask-netlink" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="330" height="204">
        <rect width="330" height="204" fill="url(#fade-netlink)" />
      </mask>
      <g mask="url(#mask-netlink)">
        {/* 3 page columns */}
        {[
          { x: 0, logoX: 10 },
          { x: 111.66, logoX: 121.66 },
          { x: 223.33, logoX: 233.33 },
        ].map((col, ci) => (
          <g key={ci}>
            <rect x={col.x} y="27.5" width="106.66" height="149" rx="8" fill="currentColor" fillOpacity="0.12" />
            <rect x={col.logoX} y="35.5" width="25" height="25" rx="6" fill="currentColor" fillOpacity="0.12" />
            {/* Logo placeholder circle */}
            <circle cx={col.logoX + 12.5} cy={48} r="6" fill="currentColor" fillOpacity="0.15" />
            {/* Heading lines */}
            <rect x={col.logoX + 35} y="38" width="51.66" height="2" fill="currentColor" fillOpacity="0.2" />
            <rect x={col.logoX + 35} y="47" width="51.66" height="2" fill="currentColor" fillOpacity="0.2" />
            <rect x={col.logoX + 35} y="56" width="51.66" height="2" fill="currentColor" fillOpacity="0.2" />
            {/* Content lines */}
            {[70.5, 82.5, 94.5, 106.5, 118.5, 130.5, 142.5, 154.5, 166.5].map((y, i) => (
              <g key={`${ci}-${i}`}>
                {i % 2 === 0 ? (
                  <>
                    <rect x={col.x + 8} y={y} width="28.88" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
                    <rect x={col.x + 38.88} y={y} width="28.89" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
                    <rect x={col.x + 69.77} y={y} width="28.89" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
                  </>
                ) : (
                  <>
                    <rect x={col.x + 8} y={y} width="44.33" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
                    <rect x={col.x + 54.33} y={y} width="44.34" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
                  </>
                )}
              </g>
            ))}
          </g>
        ))}
      </g>
      <defs>
        <linearGradient id="fade-netlink" x1="165" y1="204" x2="165" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopOpacity="0" />
          <stop offset="0.275" stopOpacity="0.435" />
          <stop offset="1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
