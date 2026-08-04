"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { lenisRef } from "@/lib/lenisRef";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import Reveal from "@/components/Reveal";
import { LightSurfaceContext } from "@/components/LightSurfaceContext";
import OnboardingModal from "@/components/OnboardingModal";
import ExpertModal from "@/components/ExpertModal";
import ConsultantUpsellModal from "@/components/ConsultantUpsellModal";
import AnalysisVerification from "@/components/AnalysisVerification";
import { useCredits } from "@/components/CreditProvider";
import { useAccount } from "@/components/AccountProvider";
import { saveLead, getLatestLead, accountFieldsFromLead } from "@/lib/lead";
import { requestPublicCode, clearProspectSession } from "@/lib/api";
import type { OnboardingLead } from "@/lib/lead";

/* ─────────────────────────── Données de contenu ─────────────────────────── */

const ARC_PATH =
  "M4 90.3301C4 67.4339 13.0955 45.4755 29.2855 29.2855C45.4756 13.0955 67.434 4 90.3302 4C113.226 4 135.185 13.0955 151.375 29.2855C167.565 45.4755 176.66 67.4339 176.66 90.3301";

// Logos clients affichés dans le carrousel de confiance.
const CLIENTS = [
  { name: "Grand Seiko", src: "/barth-staging/LandingPage/logo-entreprises/Grand_Seiko_Logo.svg" },
  { name: "Cegedim", src: "/barth-staging/LandingPage/logo-entreprises/cegedim-logo-HD.jpg" },
  { name: "Pennylane", src: "/barth-staging/LandingPage/logo-entreprises/logo-pennylane.png" },
  { name: "Cerballiance", src: "/barth-staging/LandingPage/logo-entreprises/cerballiancelogo.png" },
  { name: "Parnasse", src: "/barth-staging/LandingPage/logo-entreprises/parnasse.png" },
  { name: "Zefir", src: "/barth-staging/LandingPage/logo-entreprises/zefirlogo.png" },
  { name: "Avril", src: "/barth-staging/LandingPage/logo-entreprises/avrillogo.jpg" },
  { name: "Arkéa Financement", src: "/barth-staging/LandingPage/logo-entreprises/logoarkea.jpg" },
];

// Logos du badge hero (petites icônes) + données du mini-tableau "Par moteur d'IA".
const HERO_BADGE_LOGOS = ["/barth-staging/google.svg", "/barth-staging/chatgpt.png", "/barth-staging/gemini.png", "/barth-staging/perplexity.png"];

/* Piliers cyclés dans les cartes flottantes du hero (toutes les 2 s).
   La 2ᵉ carte affiche un détail cohérent avec le pilier et son score. */
type HeroPillar = {
  key: string;
  name: string;
  score: number;
  headerIcon: string; // tracé SVG (stroke)
  detailTitle: string;
  detailHint: string;
} & (
  | { type: "engines"; rows: { logo: string; label: string; cit: number; pages: number }[] }
  | { type: "metrics"; rows: { label: string; value: string; ratio: number }[] }
  | { type: "keywords"; rows: { kw: string; rank: number; up: boolean }[] }
  | { type: "checks"; rows: { label: string; value: string }[] }
);

const HERO_PILLARS: HeroPillar[] = [
  {
    key: "geo",
    name: "Visibilité GEO",
    score: 74,
    headerIcon: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z",
    detailTitle: "Par moteur d'IA",
    detailHint: "Citations · Pages",
    type: "engines",
    rows: [
      { logo: "/barth-staging/chatgpt.png", label: "ChatGPT", cit: 48, pages: 31 },
      { logo: "/barth-staging/google.svg", label: "Google Mode IA", cit: 42, pages: 27 },
      { logo: "/barth-staging/gemini.png", label: "Gemini", cit: 35, pages: 22 },
      { logo: "/barth-staging/perplexity.png", label: "Perplexity", cit: 29, pages: 18 },
      { logo: "/barth-staging/copilot.svg", label: "Copilot", cit: 19, pages: 12 },
    ],
  },
  {
    key: "autorite",
    name: "Autorité",
    score: 82,
    headerIcon: "M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244",
    detailTitle: "Signaux d'autorité",
    detailHint: "Valeur",
    type: "metrics",
    rows: [
      { label: "Domain Rating", value: "68", ratio: 0.68 },
      { label: "Domaines référents", value: "1 240", ratio: 0.74 },
      { label: "Backlinks", value: "18,5k", ratio: 0.9 },
      { label: "Trust Flow", value: "54", ratio: 0.54 },
      { label: "Ancres de marque", value: "42 %", ratio: 0.42 },
    ],
  },
  {
    key: "semantique",
    name: "SEO Sémantique",
    score: 66,
    headerIcon: "M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5",
    detailTitle: "Mots-clés positionnés",
    detailHint: "Position",
    type: "keywords",
    rows: [
      { kw: "logiciel de gestion", rank: 4, up: true },
      { kw: "erp pme", rank: 6, up: true },
      { kw: "facturation en ligne", rank: 9, up: false },
      { kw: "gestion commerciale", rank: 12, up: true },
      { kw: "note de frais", rank: 15, up: true },
    ],
  },
  {
    key: "technique",
    name: "Technique",
    score: 88,
    headerIcon: "m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z",
    detailTitle: "Core Web Vitals",
    detailHint: "Mesure",
    type: "checks",
    rows: [
      { label: "LCP", value: "1,8 s" },
      { label: "INP", value: "130 ms" },
      { label: "CLS", value: "0,04" },
      { label: "FCP", value: "0,9 s" },
      { label: "Indexation", value: "98 %" },
    ],
  },
];

const REASSURANCE = [
  { label: "Sans engagement", icon: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
  { label: "1 analyse offerte", icon: "M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" },
  { label: "Vos résultats en 2 minutes", icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
];

const VALUE_CARDS = [
  {
    title: "Visibilité IA (GEO)",
    body: "Obtenez un aperçu de votre visibilité dans les moteurs d'IA : découvrez votre score GEO et comparez la présence de votre marque à celle de vos principaux concurrents.",
    img: "/barth-staging/LandingPage/visibilitéIA.png",
    icon: "M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2Z",
  },
  {
    title: "Comparaison concurrentielle",
    body: "Comparez votre visibilité à celle de vos principaux concurrents : mots-clés, autorité, présence média, netlinking, GEO… Identifiez rapidement vos points forts et vos axes de progression.",
    img: "/barth-staging/LandingPage/comparaisonConcurrentielle.png",
    icon: "M18 3.75a.75.75 0 0 0-.75.75v15c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75v-15a.75.75 0 0 0-.75-.75h-1.5ZM10.5 8.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75V8.25ZM3 13.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75h-1.5A.75.75 0 0 1 3 19.5v-6Z",
  },
  {
    title: "Recommandations stratégiques",
    body: "Recevez un ensemble de recommandations adaptées à votre entreprise pour améliorer votre visibilité digitale.",
    img: "/barth-staging/LandingPage/recommandationsstrategiques.png",
    icon: "M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z",
  },
];

const BENTO = [
  { title: "Visibilité IA", desc: "Votre présence dans les réponses des IA : ChatGPT, Google AI Overview, Gemini et Perplexity.", img: "/barth-staging/LandingPage/img-bento-geo.png", featured: true },
  { title: "Technique", desc: "L'état de santé technique de votre site : indexation, Core Web Vitals, performance et structure des pages.", img: "/barth-staging/LandingPage/img-bento-tech.png", featured: false },
  { title: "Sémantique", desc: "La pertinence de vos contenus : couverture des intentions de recherche et autorité sur vos thématiques.", img: "/barth-staging/LandingPage/img-bento-semantique.png", featured: false },
  { title: "Autorité", desc: "Le poids de votre marque : netlinking, popularité, recherche de marque et e-réputation.", img: "/barth-staging/LandingPage/img-bento-autorite.png", featured: false },
  { title: "Marché", desc: "Votre position face aux concurrents : parts de visibilité, benchmark et opportunités à saisir.", img: "/barth-staging/LandingPage/img-bento-marche.png", featured: false },
  { title: "Plan d'action", desc: "Ce qu'il faut faire, et dans quel ordre : quick wins, priorités et impact estimé.", img: "/barth-staging/LandingPage/img-bento-plandaction.png", featured: false },
];

const DATA_SOURCES: { label: string; icon: React.ReactNode }[] = [
  // plume → données SEO & contenu éditorial
  {
    label: "Données SEO et backlinks",
    icon: (
      <>
        <path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z" />
        <path d="M16 8 2 22" />
        <path d="M17.5 15H9" />
      </>
    ),
  },
  // éclair → performance / vitesse
  { label: "Performances web", icon: <path d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /> },
  // cerveau → moteurs IA
  {
    label: "Moteurs IA",
    icon: (
      <>
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
        <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
        <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
        <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
        <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
        <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
        <path d="M6 18a4 4 0 0 1-1.967-.516" />
        <path d="M19.967 17.484A4 4 0 0 1 18 18" />
      </>
    ),
  },
  // barres → analyse concurrentielle / benchmark
  { label: "Analyse concurrentielle", icon: <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /> },
];

const COMPARISON_ROWS = [
  "Analyse votre visibilité digitale dans son ensemble",
  "Google, IA, GEO, autorité, médias et concurrence",
  "Indice stratégique simple à comprendre",
  "Analyse de votre marque",
  "Opportunités de visibilité",
  "Croisement de centaines de signaux",
  "Vision dirigeant & marketing",
];

const BENEFITS = [
  { title: "Comprendre leur visibilité digitale", body: "Obtenez une vision claire de votre présence sur les moteurs de recherche, les IA et l'ensemble de votre écosystème digital.", icon: "M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" },
  { title: "Identifier de nouvelles opportunités de croissance", body: "Repérez les leviers les plus impactants pour gagner en visibilité, attirer davantage de trafic qualifié et renforcer votre présence en ligne.", icon: "M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" },
  { title: "Se comparer à ses concurrents", body: "Visualisez votre position sur votre marché et identifiez les domaines où vous êtes en avance, ou ceux sur lesquels vous pouvez prendre l'avantage.", icon: "m2.25 18 8.955-8.955c.44-.439 1.152-.439 1.591 0l3.409 3.409c.44.439 1.152.439 1.591 0l5.159-5.158m0 0h-4.243m4.243 0v4.242" },
];

const FAQ = [
  { q: "Combien coûte le bilan ?", a: "Il est offert, sans carte bancaire. Vous recevez votre GSI et votre rapport gratuitement." },
  { q: "Combien de temps faut-il ?", a: "Vos premiers résultats s'affichent en 2 minutes environ. Le bilan détaillé se complète dans la foulée." },
  { q: "Comment le score est-il calculé ?", a: "Le GSI agrège plusieurs centaines de critères répartis sur ses piliers (Technique, Sémantique, Visibilité IA, Autorité), pondérés selon leur impact. Chaque pilier est noté et interprété." },
  { q: "Quels outils sont utilisés ?", a: "Les données de référence du marché pour le SEO, les backlinks et la performance, complétées par l'interrogation directe des moteurs IA." },
  { q: "Pourquoi est-il offert ?", a: "Parce que la première étape, c'est d'y voir clair. Vous repartez avec une vision complète, que vous décidiez ou non de vous faire accompagner ensuite." },
  { q: "Que contient le rapport ?", a: "Votre score GSI et son détail par pilier, votre visibilité IA moteur par moteur, la comparaison avec vos concurrents, et vos priorités d'action." },
];

/* ─────────────────────────── Sous-composants ─────────────────────────── */

/** Couleur de la jauge selon la note (vert / ambre / rouge). */
function bandColor(s: number) {
  if (s >= 70) return "#22c55e";
  if (s >= 45) return "#f59e0b";
  return "#ef4444";
}

/** Compteur animé (easeOutCubic) — pour faire évoluer le score en douceur. */
function useCountUp(target: number, duration = 700) {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const from = prev.current;
    const to = target;
    prev.current = to;
    if (from === to) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/**
 * Cartes flottantes du hero. Cyclent les 4 piliers toutes les 4 s :
 * jauge (nom + note animée) + détail cohérent avec le pilier affiché.
 */
function HeroPreviewCards() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % HERO_PILLARS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const pillar = HERO_PILLARS[idx];
  const score = useCountUp(pillar.score);
  const color = bandColor(pillar.score);
  const circ = Math.PI * 86.33;
  const offset = circ * (1 - score / 100);

  return (
    // Conteneur des deux cartes, centré verticalement sur l'image (droite).
    <div className="absolute right-[3%] top-1/2 hidden w-[330px] -translate-y-1/2 sm:block lg:w-[452px]">
      {/* Carte jauge — nom du pilier + note (décalée à gauche) */}
      <div className="-ml-6 w-[210px] rounded-2xl border border-white/40 bg-white/70 p-3.5 backdrop-blur-md lg:-ml-12 lg:w-[288px] lg:rounded-[22px] lg:p-6">
        <div className="mb-1 flex items-center justify-center gap-1.5 lg:mb-2 lg:gap-2.5">
          <span
            className="flex h-5 w-5 items-center justify-center rounded-md lg:h-7 lg:w-7 lg:rounded-lg"
            style={{ backgroundColor: `${color}22`, color }}
          >
            <svg className="h-3 w-3 lg:h-4 lg:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d={pillar.headerIcon} />
            </svg>
          </span>
          <span key={pillar.key} className="text-[12px] font-medium text-neutral-700 lg:text-[16px]" style={{ animation: "fade-up 350ms var(--ease-out) both" }}>
            {pillar.name}
          </span>
        </div>
        <div className="relative mx-auto w-[130px] lg:w-[188px]">
          <svg viewBox="0 0 181 95" className="w-full">
            <path d={ARC_PATH} fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" />
            <path
              d={ARC_PATH}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: "stroke 0.7s var(--ease-out)" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-end justify-center pb-0.5">
            <span className="text-[26px] font-bold tabular-nums text-neutral-900 lg:text-[38px]">{score}</span>
          </div>
        </div>
      </div>

      {/* Carte détail — sous la jauge, alignée à droite (pas de chevauchement) */}
      <div className="ml-auto mt-3 w-full rounded-2xl border border-white/40 bg-white/70 p-3.5 backdrop-blur-md lg:mt-4 lg:rounded-[22px] lg:p-6">
        <div className="mb-2 flex items-center justify-between lg:mb-3.5">
          <span className="text-[9px] font-semibold tracking-wide text-neutral-400 lg:text-[12px]">{pillar.detailTitle}</span>
          <span className="text-[9px] font-light text-neutral-400 lg:text-[12px]">{pillar.detailHint}</span>
        </div>
        <div key={pillar.key} className="flex min-h-[132px] flex-col gap-2 lg:min-h-[250px] lg:gap-3.5" style={{ animation: "fade-up 350ms var(--ease-out) both" }}>
          {pillar.type === "engines" &&
            pillar.rows.map((m) => (
              <div key={m.label} className="flex items-center gap-2 lg:gap-3">
                <img src={m.logo} alt="" className="h-4 w-4 shrink-0 object-contain lg:h-6 lg:w-6" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] font-medium text-neutral-700 lg:text-[14px]">{m.label}</span>
                    <span className="shrink-0 text-[10px] text-neutral-500 lg:text-[12px]"><span className="font-semibold text-neutral-800">{m.cit}</span> · {m.pages}</span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-neutral-100 lg:mt-1.5 lg:h-1.5">
                    <div className="h-full rounded-full" style={{ width: `${(m.cit / pillar.rows[0].cit) * 100}%`, backgroundColor: color }} />
                  </div>
                </div>
              </div>
            ))}

          {pillar.type === "metrics" &&
            pillar.rows.map((m) => (
              <div key={m.label}>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] font-medium text-neutral-700 lg:text-[14px]">{m.label}</span>
                  <span className="shrink-0 text-[11px] font-semibold text-neutral-800 lg:text-[14px]">{m.value}</span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-neutral-100 lg:mt-1.5 lg:h-1.5">
                  <div className="h-full rounded-full" style={{ width: `${m.ratio * 100}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}

          {pillar.type === "keywords" &&
            pillar.rows.map((k) => (
              <div key={k.kw} className="flex items-center gap-2 lg:gap-3">
                <span className="w-7 shrink-0 rounded-md bg-neutral-100 py-0.5 text-center text-[10px] font-semibold text-neutral-700 lg:w-9 lg:py-1 lg:text-[12px]">#{k.rank}</span>
                <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-neutral-700 lg:text-[14px]">{k.kw}</span>
                <svg className={`h-3 w-3 shrink-0 lg:h-4 lg:w-4 ${k.up ? "text-emerald-500" : "text-red-400 rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5m0 0-6 6m6-6 6 6" />
                </svg>
              </div>
            ))}

          {pillar.type === "checks" &&
            pillar.rows.map((c) => (
              <div key={c.label} className="flex items-center gap-2 lg:gap-3">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full lg:h-5 lg:w-5" style={{ backgroundColor: `${color}22`, color }}>
                  <svg className="h-2.5 w-2.5 lg:h-3 lg:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-neutral-700 lg:text-[14px]">{c.label}</span>
                <span className="shrink-0 text-[11px] font-semibold text-neutral-800 lg:text-[14px]">{c.value}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow?: string; title: React.ReactNode; sub?: string }) {
  return (
    <Reveal className="mx-auto max-w-[720px] text-center">
      {eyebrow && <p className="mb-4 text-[14px] font-medium text-accent-pink">{eyebrow}</p>}
      <h2 className="text-[32px] font-medium leading-[1.1] tracking-[-1px] text-text-heading md:text-[46px]">{title}</h2>
      {sub && <p className="mx-auto mt-5 max-w-[600px] text-[17px] font-light leading-relaxed text-text-secondary">{sub}</p>}
    </Reveal>
  );
}

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border-subtle">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors duration-200 hover:text-accent-pink"
      >
        <span className="text-[19px] font-medium text-text-primary">{q}</span>
        <svg
          className="h-5 w-5 shrink-0 text-text-muted transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "none", transitionTimingFunction: "var(--ease-out)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <p className="animate-fade-up pb-5 pr-10 text-[15px] font-light leading-relaxed text-text-secondary">{a}</p>
      )}
    </div>
  );
}

function BentoCard({ card }: { card: (typeof BENTO)[number] }) {
  if (card.featured) {
    return (
      <div
        className="relative flex flex-col overflow-hidden rounded-3xl p-6 text-white"
        style={{ background: "linear-gradient(155deg, #ff7cf5 0%, #a855f7 45%, #6817f8 100%)" }}
      >
        {/* Fond vidéo animé */}
        <video autoPlay muted loop playsInline className="pointer-events-none absolute inset-0 h-full w-full object-cover">
          <source src="/barth-staging/LandingPage/Background_bento_GEO.mp4" type="video/mp4" />
        </video>
        <div className="relative z-10 mb-6 flex flex-1 items-center justify-center">
          <img src={card.img} alt="" className="max-h-[210px] w-full object-contain" />
        </div>
        <h3 className="relative z-10 text-[19px] font-semibold tracking-[-0.2px]">{card.title}</h3>
        <p className="relative z-10 mt-2.5 text-[15px] font-light leading-relaxed text-white/85">{card.desc}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col rounded-3xl bg-bg-card p-6" style={{ background: "#fafafa" }}>
      <div className="mb-6 flex h-[190px] items-center justify-center">
        <img src={card.img} alt="" className="max-h-full max-w-full object-contain" />
      </div>
      <h3 className="text-[19px] font-semibold tracking-[-0.2px] text-text-heading">{card.title}</h3>
      <p className="mt-2.5 text-[15px] font-light leading-relaxed text-text-secondary">{card.desc}</p>
    </div>
  );
}

const HERO_TYPING = ["dans les IA", "dans AI Overviews", "dans les médias", "digitale"];

/**
 * Effet machine à écrire : frappe chaque mot, marque une pause, l'efface,
 * puis passe au suivant. Se fige sur le dernier mot (ici « digitale »).
 * Respecte prefers-reduced-motion (affiche directement le mot final).
 */
function Typewriter({ words }: { words: string[] }) {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting" | "done">("typing");

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIdx(words.length - 1);
      setText(words[words.length - 1]);
      setPhase("done");
    }
  }, [words]);

  useEffect(() => {
    if (phase === "done") return;
    const current = words[idx];
    const isLast = idx === words.length - 1;
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (text === current) {
        if (isLast) { setPhase("done"); return; }
        t = setTimeout(() => setPhase("pausing"), 1300);
      } else {
        t = setTimeout(() => setText(current.slice(0, text.length + 1)), 65);
      }
    } else if (phase === "pausing") {
      t = setTimeout(() => setPhase("deleting"), 800);
    } else {
      if (text === "") { setIdx((i) => (i + 1) % words.length); setPhase("typing"); return; }
      t = setTimeout(() => setText(current.slice(0, text.length - 1)), 35);
    }
    return () => clearTimeout(t);
  }, [text, phase, idx, words]);

  return (
    <span className="whitespace-nowrap text-accent-pink">
      {text}
      {phase !== "done" && <span className="typewriter-caret" aria-hidden="true" />}
    </span>
  );
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function LandingPage() {
  const { canGenerate, consume } = useCredits();
  const { login, loginWith, isLoggedIn, isProspect, logout } = useAccount();
  const router = useRouter();
  const heroInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showExpert, setShowExpert] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [leadEmail, setLeadEmail] = useState("");
  // Lead capturé à l'onboarding : sert à dériver le compte prospect une fois le
  // code vérifié (verify-code renvoie le token, pas l'identité saisie).
  const [pendingLead, setPendingLead] = useState<OnboardingLead | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    // Plus de garde crédit CLIENT : le serveur applique le plafond + 1/prospect.
    setShowOnboarding(true);
  }

  // Onboarding validé → demande RÉELLE d'un code (POST /public/request-code).
  // Aucune analyse ici : le serveur enregistre la demande et envoie le code.
  // Le lead est conservé (compte prospect dérivé après vérification).
  function handleOnboardingComplete(lead: OnboardingLead) {
    // Démarrage d'un NOUVEAU parcours : on abandonne l'ancienne analyse AVANT tout.
    // clearProspectSession() purge le token + le cache d'analyse ; si une session
    // prospect était encore active on la déconnecte pour qu'aucune donnée de
    // l'ancien parcours ne s'affiche pendant le nouveau (zéro cohabitation).
    clearProspectSession();
    if (isProspect) logout();
    saveLead(lead);
    consume();
    requestPublicCode(lead.email, lead.url); // best-effort neutre
    setPendingLead(lead);
    setLeadEmail(lead.email);
    setShowOnboarding(false);
    setVerifying(true);
  }

  const handleLoadingComplete = useCallback((reused?: boolean) => {
    const q = new URLSearchParams({ url: url.trim() });
    // Analyse déjà utilisée : le dashboard affiche « déjà utilisé pour X ».
    if (reused) q.set("reused", "1");
    router.push(`/dashboard?${q.toString()}`);
  }, [router, url]);

  // Ramène l'utilisateur au hero pour renseigner l'URL de son site (smooth scroll Lenis + focus champ).
  const focusHero = useCallback(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { duration: 1 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
    const delay = lenisRef.current ? 850 : 450;
    window.setTimeout(() => heroInputRef.current?.focus({ preventScroll: true }), delay);
  }, []);

  return (
    <LightSurfaceContext.Provider value={true}>
    <SmoothScroll>
    <div data-theme="light" className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-bg-primary">
      {showExpert && <ExpertModal onClose={() => setShowExpert(false)} />}
      {showUpsell && (
        <ConsultantUpsellModal
          onClose={() => setShowUpsell(false)}
          onAccessAnalysis={() => {
            if (!isLoggedIn) {
              const lead = getLatestLead();
              if (lead) {
                loginWith(accountFieldsFromLead(lead));
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
        <OnboardingModal url={url.trim()} onComplete={handleOnboardingComplete} onClose={() => setShowOnboarding(false)} />
      )}
      {verifying && (
        <AnalysisVerification
          url={url.trim()}
          email={leadEmail}
          lead={pendingLead}
          onExpertClick={() => { setVerifying(false); setShowExpert(true); }}
          onComplete={handleLoadingComplete}
          onClose={() => setVerifying(false)}
        />
      )}

      {/* Fond uni */}
      <div className="pointer-events-none fixed inset-0 bg-bg-primary" style={{ background: "#ffffff" }} />

      <Header onExpertClick={() => setShowExpert(true)} fixed hideThemeToggle forceLight />

      <main className="relative z-[3] flex flex-1 flex-col">
        {/* ───────── Hero ───────── */}
        <section className="relative flex flex-col items-center overflow-hidden px-6 pt-24 pb-20 text-center md:pt-36 md:pb-28">
          <img src="/barth-staging/LandingPage/backgroundhero.jpg" alt="" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[780px] w-full object-cover object-top" />
          <div className="relative z-10 flex w-full flex-col items-center">
          <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/80 py-1.5 pl-1.5 pr-4 backdrop-blur-md">
            <span className="flex items-center -space-x-1">
              {HERO_BADGE_LOGOS.map((src) => (
                <span
                  key={src}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white"
                  style={{ boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.10)" }}
                >
                  <img src={src} alt="" className="h-4 w-4 object-contain" />
                </span>
              ))}
            </span>
            <span className="text-[13px] font-medium text-neutral-700">SEO, moteurs IA et concurrence réunis en un seul espace</span>
          </div>

          <h1
            className="animate-fade-up mx-auto flex min-h-[2.4em] max-w-[1000px] flex-col items-center justify-center text-[38px] font-medium leading-[1.1] tracking-[-1.6px] text-text-heading md:min-h-[2.3em] md:text-[62px] md:tracking-[-2.6px]"
            style={{ animationDelay: "80ms" }}
          >
            <span>
              Évaluez la visibilité{" "}
              <Typewriter words={HERO_TYPING} />
            </span>
            <span className="font-[family-name:var(--font-instrument-serif)] italic">de votre entreprise</span>
          </h1>

          <form
            onSubmit={handleSubmit}
            className={`animate-fade-up mt-10 flex w-full max-w-[560px] items-center rounded-full border bg-white/70 p-1.5 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 ${
              inputFocused ? "border-accent-pink/50 shadow-[0_0_28px_-6px_rgba(236,77,203,0.25)]" : "border-[rgba(255,255,255,0.1)]"
            }`}
            style={{ animationDelay: "240ms", transitionTimingFunction: "var(--ease-out)" }}
          >
            <div className="flex items-center pl-4 text-text-input">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9 9 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <input
              ref={heroInputRef}
              type="text"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="https://www.votresite.fr"
              className="h-11 min-w-0 flex-1 bg-transparent px-3 text-[15px] font-light text-text-primary placeholder:text-text-input outline-none md:text-[16px]"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-black/90 to-black/75 px-6 py-3 text-[16px] font-medium text-white transition-all duration-200 hover:from-black/80 hover:to-black/65 active:scale-[0.97]"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              Analyser gratuitement
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </form>

          <div className="animate-fade-up mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5" style={{ animationDelay: "300ms" }}>
            {REASSURANCE.map((r) => (
              <span key={r.label} className="inline-flex items-center gap-2 text-[15px] font-medium text-text-secondary md:text-[16px]">
                <svg className="h-[18px] w-[18px] text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={r.icon} />
                </svg>
                {r.label}
              </span>
            ))}
          </div>
          </div>
        </section>

        {/* ───────── Capture produit : photo + cartes flottantes ───────── */}
        <section className="px-6 pt-2 pb-10 md:pb-16">
          <Reveal className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[28px]">
            <img
              src="/barth-staging/LandingPage/hommeregardantsonordinateur.jpg"
              alt="Un dirigeant consulte l'analyse de visibilité de son entreprise"
              className="aspect-[16/10] w-full object-cover"
            />
            {/* Dégradé gauche → droite : 0% → 60% noir */}
            <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)" }} />

            {/* Cartes flottantes animées : cyclent les piliers toutes les 4 s */}
            <HeroPreviewCards />
          </Reveal>
        </section>

        {/* ───────── Ils nous font confiance (carrousel clients) ───────── */}
        <section className="px-6 pt-8 pb-16 md:pb-24">
          <div className="flex w-full flex-col items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {["/barth-staging/consultant1.png", "/barth-staging/consultant2.png", "/barth-staging/consultant3.png"].map((src) => (
                  <img key={src} src={src} alt="" className="h-8 w-8 rounded-full border-2 border-bg-primary object-cover" />
                ))}
              </div>
              <span className="text-[16px] font-medium text-text-secondary md:text-[17px]">
                +300 CEO et responsables marketing satisfaits
              </span>
            </div>
            <div
              className="relative w-full max-w-[900px] overflow-hidden"
              style={{ maskImage: "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)" }}
            >
              <div className="marquee-track flex w-max items-center gap-x-16" style={{ animation: "marquee-x 32s linear infinite" }}>
                {[...CLIENTS, ...CLIENTS].map((c, i) => (
                  <img
                    key={i}
                    src={c.src}
                    alt={c.name}
                    className="h-9 w-auto max-w-[150px] shrink-0 object-contain opacity-70 grayscale mix-blend-multiply md:h-10"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* ───────── Bien plus qu'un audit SEO ───────── */}
        <section className="px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="Bien plus qu'un audit SEO"
            title={<>Le SEO ne suffit plus.<br /><span className="font-[family-name:var(--font-instrument-serif)] italic">Le GSI voit plus large.</span></>}
            sub="Vos clients cherchent sur Google, mais aussi dans ChatGPT, Gemini ou Perplexity. Le GSI mesure votre présence partout, face à vos concurrents."
          />
          <Reveal stagger={0.08} className="mx-auto mt-16 grid max-w-[1160px] gap-x-10 gap-y-12 md:grid-cols-3">
            {VALUE_CARDS.map((c) => (
              <div key={c.title} className="flex flex-col">
                {/* Mockup (Figma) sur fond violet clair */}
                <div className="mb-7 aspect-[360/397] w-full overflow-hidden rounded-2xl border border-[#4f406d]/[0.12] bg-[#efe7ff]">
                  <img src={c.img} alt="" className="h-full w-full object-cover" />
                </div>
                {/* Icône pleine */}
                <svg className="mb-4 h-7 w-7 text-text-heading" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d={c.icon} />
                </svg>
                <h3 className="text-[21px] font-semibold tracking-[-0.3px] text-text-heading">{c.title}</h3>
                <p className="mt-3 text-[16px] font-light leading-[26px] text-text-secondary">{c.body}</p>
              </div>
            ))}
          </Reveal>
        </section>

        {/* ───────── Profondeur (bento) ───────── */}
        <section className="px-6 py-20 md:py-28">
          <SectionHeading
            title={<>Ce que le GSI analyse <span className="font-[family-name:var(--font-instrument-serif)] italic">réellement</span>.</>}
            sub="Derrière un profil lisible, une analyse dense. Plusieurs centaines de critères passés au crible automatiquement."
          />
          <div className="mx-auto mt-14 flex max-w-[1120px] flex-col gap-5">
            {/* Rangée 1 : Visibilité IA (large) + Technique + Sémantique */}
            <Reveal stagger={0.08} className="grid gap-5 md:grid-cols-[1.4fr_1fr_1fr]">
              {BENTO.slice(0, 3).map((c) => (
                <BentoCard key={c.title} card={c} />
              ))}
            </Reveal>
            {/* Rangée 2 : Autorité + Marché + Plan d'action (large) */}
            <Reveal stagger={0.08} className="grid gap-5 md:grid-cols-[1fr_1fr_1.4fr]">
              {BENTO.slice(3, 6).map((c) => (
                <BentoCard key={c.title} card={c} />
              ))}
            </Reveal>
          </div>
        </section>

        {/* ───────── Technologie ───────── */}
        <section className="px-6 py-20 md:py-28">
          <SectionHeading
            title={<>Une vision unique<br /><span className="font-[family-name:var(--font-instrument-serif)] italic">Alimentée par les meilleures technologies.</span></>}
            sub="Le GSI consolide les données de multiples outils et les transforme en un indice unique pour mesurer votre visibilité digitale avec précision."
          />
          {/* Sources de données : icône + label */}
          <div className="mx-auto mt-12 flex max-w-[900px] flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {DATA_SOURCES.map((s) => (
              <span key={s.label} className="flex items-center gap-2.5 text-[15px] font-semibold text-text-heading md:text-[16px]">
                <svg className="h-5 w-5 text-text-heading" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                  {s.icon}
                </svg>
                {s.label}
              </span>
            ))}
          </div>
          {/* Panneau : illustration des outils autour du dashboard */}
          <Reveal className="relative mx-auto mt-12 flex max-w-[1120px] items-end justify-center overflow-hidden rounded-[32px] border border-[#4f406d]/[0.12] px-8 pt-10 md:px-16 md:pt-16">
            <img src="/barth-staging/LandingPage/background-outils-techs.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <img src="/barth-staging/LandingPage/img-outils-techs.png" alt="Le GSI agrège les données des meilleurs outils du marché de référence" className="relative w-full max-w-[880px] object-contain" />
          </Reveal>
          <p className="mx-auto mt-12 max-w-[830px] text-center text-[26px] font-medium leading-tight tracking-[-0.5px] text-text-heading md:text-[34px]">
            Le GSI agrège les données des meilleurs outils du marché pour produire une analyse unique, enrichie par l&apos;expertise des équipes AWI.
          </p>
        </section>

        {/* ───────── Comparatif (tableau) ───────── */}
        <section className="px-6 py-20 md:py-28">
          <SectionHeading
            title="Bien plus qu'un simple diagnostic SEO."
            sub="Le Global Search Index offre une vision complète de votre visibilité digitale"
          />
          <Reveal className="relative mx-auto mt-14 max-w-[900px]">
            {/* Colonne GSI en surbrillance verte */}
            <div className="pointer-events-none absolute inset-y-0 right-[5rem] w-[5rem] rounded-2xl bg-[#eafbf0] sm:right-[10rem] sm:w-[10rem]" />
            <div className="relative">
              {/* En-tête */}
              <div className="grid grid-cols-[1fr_5rem_5rem] items-center border-b border-border-subtle py-5 sm:grid-cols-[1fr_10rem_10rem]">
                <span />
                <span className="flex items-center justify-center gap-2 text-[15px] font-semibold text-text-heading sm:text-[17px]">
                  <img src="/barth-staging/faviconGSI.svg" alt="" className="h-6 w-6 rounded-md" />
                  GSI
                </span>
                <span className="text-center text-[12px] font-medium leading-tight text-text-muted sm:text-[14px]">Diagnostic SEO<br />classique</span>
              </div>
              {/* Lignes */}
              {COMPARISON_ROWS.map((row, i) => (
                <div
                  key={row}
                  className={`grid grid-cols-[1fr_5rem_5rem] items-center py-5 sm:grid-cols-[1fr_10rem_10rem] ${i < COMPARISON_ROWS.length - 1 ? "border-b border-border-subtle" : ""}`}
                >
                  <span className="pr-3 text-[14px] font-light text-text-secondary sm:text-[15px]">{row}</span>
                  <span className="flex justify-center">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-white">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    </span>
                  </span>
                  <span className="flex justify-center">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f87171] text-white">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ───────── Pourquoi les entreprises utilisent GSI ───────── */}
        <section className="px-6 py-20 md:py-28">
          <SectionHeading title="Pourquoi les entreprises utilisent GlobalSearchIndex" />
          <Reveal stagger={0.08} className="mx-auto mt-14 grid max-w-[1040px] gap-5 md:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex flex-col rounded-3xl bg-bg-card p-8" style={{ background: "#fafafa" }}>
                <svg className="mb-6 h-8 w-8 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={b.icon} />
                </svg>
                <h4 className="text-[19px] font-semibold tracking-[-0.2px] text-text-heading">{b.title}</h4>
                <p className="mt-2.5 text-[16px] font-light leading-relaxed text-text-secondary">{b.body}</p>
              </div>
            ))}
          </Reveal>
        </section>

        {/* ───────── Bandeau CTA sombre ───────── */}
        <section className="px-6 py-16 md:py-20">
          <Reveal className="relative mx-auto max-w-[1120px] overflow-hidden rounded-[32px] bg-neutral-950">
            <img src="/barth-staging/LandingPage/img-bg-woman-divcta.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            {/* Voile pour lisibilité du texte à gauche */}
            <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(10,8,20,0.9) 0%, rgba(10,8,20,0.6) 45%, rgba(10,8,20,0.35) 100%)" }} />

            {/* Mockup benchmark (à droite, flottant) */}
            <img
              src="/barth-staging/LandingPage/img-div-cta.png"
              alt="Benchmark concurrentiel de votre visibilité"
              className="pointer-events-none absolute right-[6%] top-1/2 hidden w-[400px] max-w-[40%] -translate-y-1/2 object-contain drop-shadow-2xl lg:block"
            />

            {/* Contenu */}
            <div className="relative flex flex-col items-start justify-center self-stretch px-8 py-20 text-white sm:px-12 sm:py-28 md:px-[120px] md:py-[264px]">
              <h2 className="text-[28px] font-medium leading-tight tracking-[-0.8px] md:text-[42px] md:tracking-[-1.4px]">
                La visibilité digitale évolue.<br />
                <span className="font-[family-name:var(--font-instrument-serif)] italic">Votre façon de la mesurer aussi.</span>
              </h2>
              <div className="mt-8">
                <button
                  onClick={focusHero}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[16px] font-medium text-neutral-900 transition-all duration-200 hover:bg-white/90 active:scale-[0.97]"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  Recevoir gratuitement mon GSI
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
              {/* Réassurance (même que le hero, en blanc) */}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2.5">
                {REASSURANCE.map((r) => (
                  <span key={r.label} className="inline-flex items-center gap-2 text-[15px] font-medium text-white">
                    {/* couleur forcée en inline : bandeau sombre dans les 2 thèmes, on neutralise
                        le quirk light-mode `svg.text-white → violet` (tokens-brand.css). */}
                    <svg className="h-[18px] w-[18px]" style={{ color: "#ffffff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={r.icon} />
                    </svg>
                    {r.label}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ───────── FAQ ───────── */}
        <section className="px-6 pb-28">
          <Reveal className="mx-auto max-w-[720px]">
            <h2 className="mb-8 text-center text-[28px] font-medium tracking-[-0.6px] text-text-heading md:text-[36px]">Questions fréquentes</h2>
            <div>
              {FAQ.map((f, i) => (
                <FaqItem key={f.q} q={f.q} a={f.a} open={faqOpen === i} onToggle={() => setFaqOpen(faqOpen === i ? null : i)} />
              ))}
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
    </SmoothScroll>
    </LightSurfaceContext.Provider>
  );
}
