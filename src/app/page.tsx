"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Badge from "@/components/Badge";
import LoadingScreen from "@/components/LoadingScreen";
import OnboardingModal from "@/components/OnboardingModal";
import ExpertModal from "@/components/ExpertModal";
import ConsultantUpsellModal from "@/components/ConsultantUpsellModal";
import { useCredits } from "@/components/CreditProvider";
import { useAccount } from "@/components/AccountProvider";
import { saveLead, getLatestLead } from "@/lib/lead";
import {
  SEOTechniqueVisual,
  SEOSemantiqueVisual,
  GEOVisual,
  NetlinkingVisual,
} from "@/components/PillarVisuals";

const pillars = [
  {
    icon: (
      <svg className="h-5 w-5 text-text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
    title: "Score SEO technique",
    description: "Analyse structurelle profonde des balises et du maillage.",
    visual: <SEOTechniqueVisual />,
  },
  {
    icon: (
      <svg className="h-5 w-5 text-text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    title: "Score SEO sémantique",
    description: "Clustering de mots-clés par intention de recherche.",
    visual: <SEOSemantiqueVisual />,
  },
  {
    icon: (
      <svg className="h-5 w-5 text-text-primary/80" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2Z" />
      </svg>
    ),
    title: "Score GEO visibilité sur les LLM",
    description: "Positionnement global multi-régional en temps réel.",
    visual: <GEOVisual />,
  },
  {
    icon: (
      <svg className="h-5 w-5 text-text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
      </svg>
    ),
    title: "Score d'autorité",
    description: "Le score d'autorité mesure la crédibilité et la fiabilité d'un site web aux yeux des moteurs de recherche.",
    visual: <NetlinkingVisual />,
  },
];

export default function HomePage() {
  const { theme } = useTheme();
  const { canGenerate, consume } = useCredits();
  const { login, loginWith, isLoggedIn } = useAccount();
  const [url, setUrl] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showExpert, setShowExpert] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    // Crédit épuisé → upsell orienté bénéfices (best practice freemium) plutôt qu'un nouvel audit.
    if (canGenerate) {
      setShowOnboarding(true);
    } else {
      setShowUpsell(true);
    }
  }

  function handleOnboardingComplete(lead: Parameters<typeof saveLead>[0]) {
    saveLead(lead);
    // Lancer une analyse crée directement un compte client (pas de dashboard en déconnecté).
    loginWith({
      type: "user",
      name: `${lead.firstName} ${lead.lastName}`.trim() || lead.company || "Mon compte",
      email: lead.email,
    });
    consume();
    setShowOnboarding(false);
    setLoading(true);
  }

  const handleLoadingComplete = useCallback(() => {
    router.push(`/dashboard?url=${encodeURIComponent(url.trim())}`);
  }, [router, url]);

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      {showExpert && <ExpertModal onClose={() => setShowExpert(false)} />}
      {showUpsell && (
        <ConsultantUpsellModal
          onClose={() => setShowUpsell(false)}
          onAccessAnalysis={() => {
            // Email vérifié dans la modale → on reconnecte le client sur SON compte (issu du lead).
            if (!isLoggedIn) {
              const lead = getLatestLead();
              if (lead) {
                loginWith({
                  type: "user",
                  name: `${lead.firstName} ${lead.lastName}`.trim() || lead.company || "Mon compte",
                  email: lead.email,
                });
              } else {
                login("user");
              }
            }
            setShowUpsell(false);
            router.push("/dashboard");
          }}
          onTalkToConsultant={() => { setShowUpsell(false); setShowExpert(true); }}
        />
      )}
      {showOnboarding && (
        <OnboardingModal
          url={url.trim()}
          onComplete={handleOnboardingComplete}
          onClose={() => setShowOnboarding(false)}
        />
      )}
      {loading && (
        <LoadingScreen url={url.trim()} onComplete={handleLoadingComplete} />
      )}

      {/* Background — fixed to stay visible on scroll */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {theme === "dark" ? (
          <>
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src="/bg-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-bg-primary/60" />
            <div className="absolute inset-0 bg-[#13042f] mix-blend-hue" />
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(14,4,27,0.4)] to-bg-primary to-[50%]" />
          </>
        ) : (
          <>
            <img
              src="/bg-whitemode.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-bg-primary/40" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-primary to-[60%]" />
          </>
        )}
      </div>

      <div className="pointer-events-none absolute -left-[133px] -bottom-[200px] h-[400px] w-[400px] rounded-full bg-[rgba(224,195,252,0.05)] blur-[50px]" />

      <Header onExpertClick={() => setShowExpert(true)} />

      <main className="relative z-[3] flex flex-1 flex-col items-center overflow-hidden px-4 pt-24 pb-12 md:px-16 md:pt-32 md:pb-16">
        <div className="flex w-full max-w-[1152px] flex-col items-center px-2 md:px-8">
          {/* Badge */}
          <div className="animate-fade-up mb-6">
            <Badge
              icon={
                <svg className="h-3 w-3" viewBox="0 0 13 13" fill="currentColor">
                  <path d="M6.5 0L8 4.5L13 6.5L8 8.5L6.5 13L5 8.5L0 6.5L5 4.5Z" />
                </svg>
              }
            >
              Analyse SEO &amp; IA en temps réel
            </Badge>
          </div>

          {/* Heading */}
          <div className="mb-8 max-w-[896px] md:mb-12">
            <h1
              className="animate-fade-up text-center tracking-[-1.5px] text-text-primary md:tracking-[-2.2px]"
              style={{ animationDelay: "80ms" }}
            >
              <span className="text-[32px] font-medium leading-[1.15] md:text-[55px] md:leading-[1.1]">
                Mesurez votre
              </span>
              <br />
              <span className="font-[family-name:var(--font-instrument-serif)] text-[34px] italic leading-[1.15] tracking-[-0.8px] md:text-[60px] md:leading-[1.1] md:tracking-[-1.2px]">
                référencement global
              </span>
              <br />
              <span className="text-[32px] font-medium leading-[1.15] md:text-[55px] md:leading-[1.1]">
                en un instant.
              </span>
            </h1>
          </div>

          {/* URL Input */}
          <div className="mb-10 w-full max-w-[768px] md:mb-16">
            <form
              onSubmit={handleSubmit}
              className={`animate-fade-up flex w-full items-center rounded-full border backdrop-blur-xl p-1 transition-[border-color,box-shadow] duration-300 ${theme === "light" ? "bg-white/70 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)]" : "bg-[rgba(0,0,0,0.15)]"} ${
                inputFocused
                  ? "border-[#ec4dcb]/50 shadow-[0_0_20px_-4px_rgba(236,77,203,0.15)]"
                  : "border-[rgba(255,255,255,0.1)]"
              }`}
              style={{ animationDelay: "160ms", transitionTimingFunction: "var(--ease-out)" }}
            >
              <div className="flex items-center pl-4">
                <svg className="h-5 w-5 text-text-input" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9 9 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <input
                type="text"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Entrez votre URL..."
                className="h-[44px] min-w-0 flex-1 bg-transparent px-3 font-[family-name:var(--font-manrope)] text-[15px] font-extralight text-text-primary placeholder:text-text-input outline-none md:h-[52px] md:px-4 md:text-[18px]"
              />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center gap-1 rounded-full bg-gradient-to-r from-[#5f14fb] via-[#ec4dcb] via-[47%] to-[#f987e0] px-4 py-2.5 text-[14px] font-medium tracking-[-0.4px] text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97] md:px-6 md:py-3 md:text-[18px]"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                Analyser
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </form>

            <p
              className="animate-fade-up mt-4 text-center text-[16px] font-extralight text-text-secondary opacity-60"
              style={{ animationDelay: "240ms" }}
            >
              Audit gratuit et instantané · Aucune carte requise
            </p>
          </div>

          {/* Pillar Cards */}
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            {pillars.map((pillar, i) => (
              <div
                key={pillar.title}
                className="animate-fade-up group relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] transition-all duration-300 hover:bg-bg-card-hover md:rounded-[32px] md:p-[33px]"
                style={{
                  animationDelay: `${320 + i * 80}ms`,
                  transitionTimingFunction: "var(--ease-out)",
                }}
              >
                <div className="mb-2 flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-bg-sidebar p-[5px]">
                  {pillar.icon}
                </div>
                <h3 className="mb-2 text-[24px] font-light leading-8 text-text-heading">
                  {pillar.title}
                </h3>
                <p className="mb-12 text-[16px] font-extralight leading-6 text-text-secondary">
                  {pillar.description}
                </p>
                {/* Dot grid background */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage: "radial-gradient(circle, var(--text-primary) 1px, transparent 1px)",
                    backgroundSize: "14px 14px",
                  }}
                />
                <div className="relative h-[180px] w-full overflow-hidden rounded-lg">
                  {pillar.visual}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
