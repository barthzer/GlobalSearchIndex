"use client";

import { useState } from "react";
import ModalPortal from "./ModalPortal";
import ScoreInfoModal from "./ScoreInfoModal";

interface PageSpeedScore {
  label: string;
  score: number;
  icon: React.ReactNode;
  info: {
    title: string;
    heading: string;
    intro: string;
    criteria: { label: string; description: string; icon: React.ReactNode }[];
    conclusion: string;
  };
}

interface PageSpeedModalProps {
  scores: PageSpeedScore[];
  device: "mobile" | "desktop";
  onDeviceChange: (device: "mobile" | "desktop") => void;
  onClose: () => void;
}

function ScoreArc({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const c = Math.PI * r;
  const offset = c - (score / 100) * c;
  const color =
    score >= 90
      ? { start: "#22c55e", end: "#4ade80" }
      : score >= 50
        ? { start: "#f97316", end: "#eab308" }
        : { start: "#ef4444", end: "#f97316" };
  const gradId = `psa-${score}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 12 }}>
      <svg viewBox={`0 0 ${size} ${size / 2 + 12}`} width={size} height={size / 2 + 12}>
        {/* Background arc */}
        <path
          d={`M6 ${size / 2 + 6} A${r} ${r} 0 0 1 ${size - 6} ${size / 2 + 6}`}
          fill="none"
          stroke="var(--card-inner-border)"
          strokeWidth={6}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M6 ${size / 2 + 6} A${r} ${r} 0 0 1 ${size - 6} ${size / 2 + 6}`}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s var(--ease-in-out)" }}
        />
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color.start} />
            <stop offset="100%" stopColor={color.end} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-end justify-center pb-0">
        <span className="text-2xl font-bold tabular-nums text-text-primary">{score}</span>
        <span className="mb-0.5 text-xs text-text-muted">/100</span>
      </div>
    </div>
  );
}

export default function PageSpeedModal({ scores, device, onDeviceChange, onClose }: PageSpeedModalProps) {
  const [activeInfo, setActiveInfo] = useState<PageSpeedScore | null>(null);

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md"
        onClick={onClose}
        style={{ animation: "fade-up 300ms var(--ease-expo) both" }}
      />

      <div
        className="relative w-full max-w-[560px] rounded-[2rem] border border-white/[0.06] bg-input-bg p-2"
        style={{ animation: "fade-up 400ms var(--ease-expo) both" }}
      >
        <div
          className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-30"
          style={{
            background: "conic-gradient(from 220deg, transparent 50%, rgba(95,20,251,0.2) 70%, rgba(236,77,203,0.2) 85%, transparent 100%)",
          }}
        />

        <div className="relative rounded-[calc(2rem-0.5rem)] border border-border-subtle bg-modal-bg p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-input-bg text-text-muted transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.95]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="mb-6 mr-10">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-card-inner-bg px-3 py-1.5">
                <svg className="h-4 w-4 text-text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                </svg>
                <span className="text-[length:var(--text-body)] font-medium text-text-heading">
                  PageSpeed Insights
                </span>
              </div>
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-text-primary">
              Audit de performance du site
            </h2>
            <p className="mt-3 text-[length:var(--text-body)] font-light leading-relaxed text-text-secondary">
              Résultats de l&apos;analyse PageSpeed Insights. Chaque score évalue un aspect clé de la qualité de votre site.
            </p>

            {/* Device switch */}
            <div className="mt-4 flex gap-0">
              <button
                onClick={() => onDeviceChange("mobile")}
                className={`flex items-center gap-2 border-b-2 px-4 pb-2 text-[13px] font-medium transition-all duration-200 ${
                  device === "mobile"
                    ? "border-accent-pink text-text-primary"
                    : "border-transparent text-text-muted hover:text-text-secondary"
                }`}
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
                Mobile
              </button>
              <button
                onClick={() => onDeviceChange("desktop")}
                className={`flex items-center gap-2 border-b-2 px-4 pb-2 text-[13px] font-medium transition-all duration-200 ${
                  device === "desktop"
                    ? "border-accent-pink text-text-primary"
                    : "border-transparent text-text-muted hover:text-text-secondary"
                }`}
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
                </svg>
                Bureau
              </button>
            </div>
          </div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3">
            {scores.map((s) => (
              <div
                key={s.label}
                className="relative flex flex-col items-center gap-2 rounded-xl bg-card-inner-bg p-5"
              >
                {/* Info button */}
                <button
                  onClick={() => setActiveInfo(s)}
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border border-border-subtle bg-card-inner-bg text-text-muted transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.95]"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
                  </svg>
                </button>

                <ScoreArc score={s.score} size={140} />
                <div className="flex items-center gap-2">
                  <span className="text-text-primary/80">{s.icon}</span>
                  <span className="text-[13px] font-medium text-text-primary">
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-modal rendered AFTER main modal for correct z-stacking */}
      {activeInfo && (
        <div className="fixed inset-0 z-[60]">
          <ScoreInfoModal
            info={activeInfo.info}
            icon={activeInfo.icon}
            onBack={() => setActiveInfo(null)}
            onClose={() => { setActiveInfo(null); onClose(); }}
          />
        </div>
      )}
    </div>
    </ModalPortal>
  );
}
