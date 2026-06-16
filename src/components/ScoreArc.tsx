"use client";

import { useEffect, useState } from "react";
import Button from "./Button";
import SemanticUnlockModal from "./SemanticUnlockModal";
import ScoreInfoModal from "./ScoreInfoModal";

interface ScoreInfoData {
  title: string;
  heading: string;
  intro: string;
  criteria: { label: string; description: string; icon: React.ReactNode }[];
  conclusion: string;
}

interface ScoreArcProps {
  label: string;
  score: number;
  recommendations: number;
  icon: React.ReactNode;
  badges?: React.ReactNode;
  locked?: boolean;
  delay?: number;
  info?: ScoreInfoData;
}

export default function ScoreArc({
  label,
  score,
  recommendations,
  icon,
  badges,
  locked = false,
  delay = 0,
  info,
}: ScoreArcProps) {
  const [visible, setVisible] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [computing, setComputing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Le score ne se débloque pas instantanément : loader pendant le "calcul".
  useEffect(() => {
    if (!computing) return;
    const t = setTimeout(() => setComputing(false), 3500);
    return () => clearTimeout(t);
  }, [computing]);

  const radius = 86.33;
  const circumference = Math.PI * radius;
  // Une fois déverrouillé, l'arc se remplit avec le vrai score (la prop `locked` reste vraie).
  const progress = locked && !unlocked ? 0 : (score / 100) * circumference;
  const offset = circumference - progress;
  const gradientId = `arc-grad-${label.replace(/\s/g, "-")}`;

  // Score color: red (<50) → orange (50-75) → green (>75)
  function getScoreColor(): { start: string; end: string; text: string } {
    if (score < 50) return { start: "#ef4444", end: "#f97316", text: "text-red-400" };
    if (score < 75) return { start: "#f97316", end: "#eab308", text: "text-amber-400" };
    return { start: "#22c55e", end: "#4ade80", text: "text-emerald-400" };
  }
  const scoreColor = getScoreColor();

  const animStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(12px)",
    transition: "opacity 600ms var(--ease-expo), transform 600ms var(--ease-expo), border-color 300ms var(--ease-out), background-color 300ms var(--ease-out)",
  };

  const InfoButton = info ? (
    <button
      onClick={() => setShowInfo(true)}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-card-inner-bg text-text-muted transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.95]"
      style={{ transitionTimingFunction: "var(--ease-out)" }}
      aria-label={`Informations sur le score ${label}`}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
      </svg>
    </button>
  ) : null;

  if (locked && !unlocked) {
    return (
      <>
      {showUnlock && (
        <SemanticUnlockModal
          onClose={() => setShowUnlock(false)}
          onSubmit={() => {
            setShowUnlock(false);
            setUnlocked(true);
            setComputing(true);
          }}
        />
      )}
      {showInfo && info && (
        <ScoreInfoModal info={info} icon={icon} onClose={() => setShowInfo(false)} />
      )}
      <div
        className="group relative rounded-2xl border border-border-subtle backdrop-blur-[6px]"
        style={{
          ...animStyle,
        }}
      >
        <div
          className="flex h-full flex-col items-center justify-between rounded-[calc(1rem-1px)] p-5 md:p-6"
          style={{ background: "linear-gradient(to bottom, var(--bg-card) 0%, rgba(238,86,206,0.4) 100%)" }}
        >
          {/* Header */}
          <div className="mb-4 flex w-full items-center gap-2">
            <span className="text-text-primary/80">{icon}</span>
            <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">{label}</span>
            {InfoButton && <div className="ml-auto">{InfoButton}</div>}
          </div>

          <div className="relative flex flex-1 flex-col items-center justify-center gap-4 py-4">
            {/* Blurred gradient arc behind */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 blur-[8px] opacity-40">
              <svg viewBox="0 0 181 95" className="h-24 w-44">
                <path
                  d="M4 90.3301C4 67.4339 13.0955 45.4755 29.2855 29.2855C45.4756 13.0955 67.434 4 90.3302 4C113.226 4 135.185 13.0955 151.375 29.2855C167.565 45.4755 176.66 67.4339 176.66 90.3301"
                  fill="none" stroke="url(#locked-arc-grad)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * 0.3}
                />
                <defs>
                  <linearGradient id="locked-arc-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6817F8" />
                    <stop offset="50%" stopColor="#EE56CE" />
                    <stop offset="100%" stopColor="#EE56CE" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6817F8]/20 to-[#EE56CE]/20">
              <svg className="h-5 w-5 text-[#EE56CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <Button variant="primary" className="relative mt-1" onClick={() => setShowUnlock(true)}>
              Calculer mon score sémantique
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    {showInfo && info && (
      <ScoreInfoModal info={info} icon={icon} onClose={() => setShowInfo(false)} />
    )}
    <div
      className={`group relative flex flex-col items-center justify-between rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] transition-all duration-300 hover:bg-bg-card-hover md:p-6 ${computing ? "score-computing" : ""}`}
      style={{ transitionTimingFunction: "var(--ease-out)", ...animStyle }}
    >
      {/* Header */}
      <div className="mb-4 flex w-full items-center gap-2">
        <span className="text-text-primary/80">{icon}</span>
        <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">{label}</span>
        <div className="ml-auto flex items-center gap-2">
          {badges}
          {InfoButton}
        </div>
      </div>

      <div className="relative mb-2">
        <svg viewBox="0 0 181 95" className="h-24 w-44">
          {/* Background arc */}
          <path
            d="M4 90.3301C4 67.4339 13.0955 45.4755 29.2855 29.2855C45.4756 13.0955 67.434 4 90.3302 4C113.226 4 135.185 13.0955 151.375 29.2855C167.565 45.4755 176.66 67.4339 176.66 90.3301"
            fill="none" stroke="var(--arc-bg)" strokeWidth="8" strokeLinecap="round"
          />
          {/* Progress arc — reste vide tant que le score se calcule */}
          <path
            d="M4 90.3301C4 67.4339 13.0955 45.4755 29.2855 29.2855C45.4756 13.0955 67.434 4 90.3302 4C113.226 4 135.185 13.0955 151.375 29.2855C167.565 45.4755 176.66 67.4339 176.66 90.3301"
            fill="none" stroke={`url(#${gradientId})`} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={visible && !computing ? offset : circumference}
            style={{ transition: `stroke-dashoffset 1.2s var(--ease-in-out) ${delay}ms` }}
          />
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={scoreColor.start} />
              <stop offset="100%" stopColor={scoreColor.end} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-0">
          {computing ? (
            <span className="mb-1 flex flex-col items-center gap-2">
              <span className="h-11 w-11 animate-spin rounded-full border-[3.5px] border-accent-pink/20 border-t-accent-pink" />
              <span className="text-[13px] font-semibold text-text-secondary">Calcul…</span>
            </span>
          ) : (
            <>
              <span className="text-3xl font-bold tabular-nums text-text-primary">{score}</span>
              <span className="mb-1 text-sm text-text-muted">/100</span>
            </>
          )}
        </div>
      </div>

    </div>
    </>
  );
}
