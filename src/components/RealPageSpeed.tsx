"use client";

// Rendu réel de PageSpeed depuis le rawData du score page_speed (Lighthouse).
// Design VF PageSpeedCard (validé COMEX 2026-08-11) : toggle Mobile/Bureau, arcs de
// score Lighthouse (ScoreArc) avec info « i », Core Web Vitals en chips, bandeau.
// Données RÉELLES (mobile + desktop du rawData). Les catégories affichées = celles
// que SEO Engine renvoie (aucune inventée) ; les valeurs CWV = celles du serveur.
import { useState } from "react";
import { ScoreArc } from "./PageSpeedModal";
import ScoreInfoModal from "./ScoreInfoModal";
import InsightNote from "./InsightNote";

interface PsCategory {
  label: string;
  score: number;
}
interface PsMetric {
  label: string;
  value: number;
  unit: string;
  status: string;
}
interface PsDevice {
  categories?: PsCategory[];
  metrics?: PsMetric[];
}
interface PageSpeedRaw {
  mobile?: PsDevice | null;
  desktop?: PsDevice | null;
}

type DeviceType = "mobile" | "desktop";

function CriterionIcon({ d }: { d: string }) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

// Verdict PageSpeed (retour Alexis 2026-08-14 : dire si c'est bien ou pas). Basé sur
// le score Performances (seuils Google : <50 faible, 50-89 correct, 90+ excellent) et
// le LCP (>2,5 s à améliorer, >4 s mauvais). Cite les catégories déjà au vert. Vide si
// pas de catégorie Performances (jamais un avis sans mesure).
function pageSpeedVerdict(cats: PsCategory[], metrics: PsMetric[]): string {
  const perf = cats.find((c) => /perform/i.test(c.label));
  if (!perf) return "";
  const p = perf.score;
  const perfWord = p >= 90 ? "excellentes" : p >= 50 ? "correctes mais perfectibles" : "à améliorer en priorité";
  const lcp = metrics.find((m) => /largest contentful/i.test(m.label));
  let lcpPhrase = "";
  if (lcp && lcp.value > 0) {
    const sec = lcp.unit === "ms" ? lcp.value / 1000 : lcp.value;
    const v = `${lcp.value}${lcp.unit ? " " + lcp.unit : ""}`;
    if (sec > 4) lcpPhrase = ` Votre LCP à ${v} dépasse largement le seuil de 2,5 s recommandé, un frein direct à l'expérience et au référencement.`;
    else if (sec > 2.5) lcpPhrase = ` Votre LCP à ${v} reste au-dessus du seuil de 2,5 s recommandé.`;
    else lcpPhrase = ` Votre LCP à ${v} respecte le seuil recommandé.`;
  }
  const strong = cats.filter((c) => !/perform/i.test(c.label) && c.score >= 90).map((c) => c.label);
  const strongPhrase = strong.length ? ` En revanche, ${strong.join(" et ")} sont au vert.` : "";
  return `Vos performances sont ${perfWord} (${p}/100).${lcpPhrase}${strongPhrase}`;
}

// Icône + fiche info par catégorie Lighthouse (contenu statique VF). Clé = label
// serveur. Une catégorie inconnue tombe sur un icône neutre, sans info.
const CATEGORY_META: Record<
  string,
  { icon: React.ReactNode; info: React.ComponentProps<typeof ScoreInfoModal>["info"] }
> = {
  Performances: {
    icon: <CriterionIcon d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />,
    info: {
      title: "Performances",
      heading: "Score de performance",
      intro: "Les valeurs sont estimées et peuvent varier. Le calcul du score lié aux performances repose directement sur ces statistiques.",
      criteria: [
        { label: "First Contentful Paint", description: "temps avant le premier affichage de contenu visible par l'utilisateur.", icon: <CriterionIcon d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /> },
        { label: "Largest Contentful Paint", description: "temps avant l'affichage de l'élément le plus volumineux visible dans le viewport.", icon: <CriterionIcon d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159M2.25 18h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12Z" /> },
        { label: "Total Blocking Time", description: "durée totale pendant laquelle le thread principal est bloqué et ne peut pas répondre aux interactions.", icon: <CriterionIcon d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /> },
        { label: "Cumulative Layout Shift", description: "mesure la stabilité visuelle, quantifie les décalages inattendus dans la mise en page.", icon: <CriterionIcon d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /> },
        { label: "Speed Index", description: "vitesse à laquelle le contenu est visuellement affiché lors du chargement de la page.", icon: <CriterionIcon d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75Zm6.75-4.5c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625Zm6.75-4.5c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /> },
      ],
      conclusion: "Optimiser ces métriques améliore directement l'expérience utilisateur et votre positionnement dans les résultats de recherche.",
    },
  },
  "Accessibilité": {
    icon: <CriterionIcon d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />,
    info: {
      title: "Accessibilité",
      heading: "Score d'accessibilité",
      intro: "Ces vérifications permettent de connaître les possibilités d'amélioration de l'accessibilité de votre application web. La détection automatique ne détecte qu'une partie des problèmes ; un test manuel complémentaire est conseillé.",
      criteria: [
        { label: "Contraste des couleurs", description: "rapport de contraste suffisant entre le texte et l'arrière-plan.", icon: <CriterionIcon d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /> },
        { label: "Attributs ARIA", description: "éléments interactifs correctement étiquetés pour les lecteurs d'écran.", icon: <CriterionIcon d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /> },
        { label: "Navigation clavier", description: "tous les éléments interactifs accessibles et utilisables au clavier.", icon: <CriterionIcon d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" /> },
        { label: "Textes alternatifs", description: "images et médias accompagnés de descriptions pour les technologies d'assistance.", icon: <CriterionIcon d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159M2.25 18h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12Z" /> },
        { label: "Structure sémantique", description: "hiérarchie des titres et landmarks HTML correctement définis.", icon: <CriterionIcon d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" /> },
      ],
      conclusion: "L'accessibilité garantit que votre site est utilisable par tous, y compris les personnes en situation de handicap.",
    },
  },
  "Bonnes pratiques": {
    icon: <CriterionIcon d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />,
    info: {
      title: "Bonnes pratiques",
      heading: "Score de bonnes pratiques",
      intro: "Évalue le respect des standards web en matière d'expérience utilisateur, de fiabilité, de sécurité et de qualité technique générale.",
      criteria: [
        { label: "Qualité des images", description: "images diffusées à la bonne résolution et au bon format.", icon: <CriterionIcon d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159M2.25 18h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12Z" /> },
        { label: "Sécurité HTTPS et CSP", description: "connexion sécurisée, Content Security Policy contre XSS et clickjacking.", icon: <CriterionIcon d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /> },
        { label: "APIs et standards", description: "aucune API obsolète, doctype valide, pas d'erreurs console.", icon: <CriterionIcon d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" /> },
        { label: "Permissions et cookies", description: "aucune demande intrusive au chargement, pas de cookies tiers.", icon: <CriterionIcon d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /> },
      ],
      conclusion: "Respecter ces bonnes pratiques assure une expérience fiable, sécurisée et conforme aux standards du web.",
    },
  },
  SEO: {
    icon: <CriterionIcon d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />,
    info: {
      title: "SEO",
      heading: "Score SEO Lighthouse",
      intro: "Ces vérifications garantissent que votre page suit les conseils de base du référencement naturel. De nombreux facteurs supplémentaires, non évalués ici, peuvent aussi affecter votre classement.",
      criteria: [
        { label: "Balises meta", description: "présence et pertinence des balises title, meta description et viewport.", icon: <CriterionIcon d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /> },
        { label: "Explorabilité", description: "page indexable, robots.txt valide, liens explorables par les moteurs.", icon: <CriterionIcon d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" /> },
        { label: "Données structurées", description: "objets JSON-LD valides et correctement implémentés.", icon: <CriterionIcon d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /> },
        { label: "Mobile-friendly", description: "viewport configuré, texte lisible, éléments tactiles espacés.", icon: <CriterionIcon d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /> },
      ],
      conclusion: "Ces essentiels SEO constituent la base technique pour être correctement indexé et classé par Google.",
    },
  },
};

// Libellé court + tooltip par métrique CWV (clé = label serveur).
const METRIC_META: Record<string, { short: string; desc: string }> = {
  "First Contentful Paint": { short: "FCP", desc: "Temps avant le premier affichage visible. Plus c'est rapide, plus l'utilisateur voit vite du contenu." },
  "Largest Contentful Paint": { short: "LCP", desc: "Temps de chargement de l'élément principal (image, titre). Doit rester sous 2,5 s." },
  "Total Blocking Time": { short: "TBT", desc: "Durée pendant laquelle la page ne répond pas aux clics. Bas = page réactive." },
  "Cumulative Layout Shift": { short: "CLS", desc: "Décalages visuels inattendus. 0 = rien ne bouge pendant le chargement." },
  "Speed Index": { short: "SI", desc: "Vitesse d'affichage global du contenu. Plus l'indice est bas, mieux c'est." },
};

function metricColor(status: string): string {
  if (status === "poor" || status === "danger") return "text-red-400";
  if (status === "average" || status === "warning") return "text-amber-400";
  return "text-emerald-400";
}
function fmt(value: number, unit: string): string {
  const n = value.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  return unit === "s" ? `${n} s` : unit === "ms" ? `${n} ms` : `${n}${unit}`;
}

const boltIcon = (
  <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
  </svg>
);

function Header() {
  return (
    <div className="flex items-center gap-2.5">
      {boltIcon}
      <span className="text-[14px] font-medium text-text-primary">Google PageSpeed Insights</span>
    </div>
  );
}

export default function RealPageSpeed({
  raw,
  reason,
  status,
}: {
  raw: PageSpeedRaw | null;
  reason?: string | null;
  status?: string | null;
}) {
  const [device, setDevice] = useState<DeviceType>("mobile");
  // Accordéon réduit par défaut (design Barth, retour Alexis 27/08) — s'applique au
  // rendu AVEC données ; les états « en cours » / « non disponible » restent déployés.
  const [open, setOpen] = useState(false);
  const [activeInfo, setActiveInfo] = useState<
    { info: React.ComponentProps<typeof ScoreInfoModal>["info"]; icon: React.ReactNode } | null
  >(null);

  const mobile = raw?.mobile ?? null;
  const desktop = raw?.desktop ?? null;
  const hasAny = (mobile?.categories?.length ?? 0) + (mobile?.metrics?.length ?? 0) > 0;
  const isRunning = status === "pending" || status === "processing";

  // Tant que le crawl tourne → « en cours » (jamais un « pas de données » provisoire).
  if (!hasAny && isRunning) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-bg-card p-5 md:p-6">
        <Header />
        <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
          Analyse PageSpeed en cours, les mesures s&apos;afficheront dès que le crawl aura rendu.
        </p>
      </div>
    );
  }
  // Terminé sans donnée exploitable → on le DIT (jamais un bloc qui disparaît).
  if (!hasAny) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-bg-card p-5 md:p-6">
        <Header />
        <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
          PageSpeed non disponible pour ce site
          {reason ? ` — ${reason}` : " (le crawl n'a pas produit de données)"}.
        </p>
      </div>
    );
  }

  const current: PsDevice | null = device === "mobile" ? mobile : desktop;
  const cats = current?.categories ?? [];
  const metrics = current?.metrics ?? [];
  const hasDesktop = (desktop?.categories?.length ?? 0) + (desktop?.metrics?.length ?? 0) > 0;

  const DeviceTab = ({ k, label, d }: { k: DeviceType; label: string; d: string }) => (
    <button
      onClick={() => setDevice(k)}
      className={`flex items-center gap-2 border-b-2 px-4 pb-3 text-[14px] font-medium transition-all duration-200 ${
        device === k ? "border-accent-pink text-text-primary" : "border-transparent text-text-muted hover:text-text-secondary"
      }`}
      style={{ transitionTimingFunction: "var(--ease-out)" }}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d={d} />
      </svg>
      {label}
    </button>
  );

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]">
      {activeInfo && (
        <ScoreInfoModal info={activeInfo.info} icon={activeInfo.icon} onClose={() => setActiveInfo(null)} />
      )}

      {/* Accordéon PageSpeed — réduit par défaut (design Barth AU PIXEL, retour Alexis
          27/08). Le header « Google PageSpeed Insights » devient le bouton toggle + chevron ;
          le toggle Mobile/Bureau descend dans le contenu repliable, séparé par un border-t. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 md:px-6"
        aria-expanded={open}
      >
        <Header />
        <svg
          className="h-4 w-4 text-text-muted transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transitionTimingFunction: "var(--ease-out)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", transitionTimingFunction: "var(--ease-out)" }}
      >
        <div className={open ? "" : "overflow-hidden"}>
          <div className="border-t border-border-subtle">
            {/* Toggle Mobile / Bureau (dans le contenu repliable) */}
            {hasDesktop && (
              <div className="flex gap-0 px-5 pt-3 md:px-6">
                <DeviceTab k="mobile" label="Mobile" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                <DeviceTab k="desktop" label="Bureau" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
              </div>
            )}
            <div className="flex flex-col gap-5 px-5 pb-5 pt-3 md:px-6">
        {/* Arcs de score Lighthouse (autant que SEO Engine en renvoie) */}
        {cats.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {cats.map((c) => {
              const meta = CATEGORY_META[c.label];
              return (
                <div
                  key={c.label}
                  className="relative flex flex-col items-center gap-1.5 rounded-xl border border-card-inner-border bg-card-inner-bg px-3 py-4"
                >
                  {meta?.info && (
                    <button
                      onClick={() => setActiveInfo({ info: meta.info, icon: meta.icon })}
                      aria-label={`Détails du score ${c.label}`}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border-subtle bg-bg-card text-text-muted transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.95]"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
                      </svg>
                    </button>
                  )}
                  <ScoreArc score={c.score} size={108} valueClassName="text-[20px]" />
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    {meta && <span className="text-text-primary/70">{meta.icon}</span>}
                    <span className="text-center text-[11px] font-medium">{c.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Performance du site — Core Web Vitals en chips */}
        {metrics.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-text-primary/80">{boltIcon}</span>
              <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">Performance du site</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {metrics.map((m) => {
                const meta = METRIC_META[m.label];
                return (
                  <div
                    key={m.label}
                    className="group relative flex items-center gap-2 rounded-lg border border-card-inner-border bg-card-inner-bg px-3 py-1.5"
                  >
                    <span className="text-[11px] font-medium text-text-muted">{meta?.short ?? m.label}</span>
                    <span className={`text-[13px] font-semibold tabular-nums ${metricColor(m.status)}`}>{fmt(m.value, m.unit)}</span>
                    {meta && (
                      <div
                        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 rounded-lg border border-border-subtle bg-bg-overlay px-4 py-3 opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100"
                        style={{ transitionTimingFunction: "var(--ease-out)" }}
                      >
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border-subtle" />
                        <p className="text-[13px] font-medium text-text-primary">{m.label}</p>
                        <p className="mt-1 text-[12px] font-light leading-relaxed text-text-secondary">{meta.desc}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <InsightNote className="mt-1">
              Ces métriques (Core Web Vitals) mesurent la vitesse et la stabilité de chargement réelles de votre page
              sur {device === "mobile" ? "mobile" : "ordinateur"}. Elles pèsent directement sur l&apos;expérience
              utilisateur et sur votre classement Google.
              {(() => {
                const v = pageSpeedVerdict(cats, metrics);
                return v ? ` ${v}` : "";
              })()}
            </InsightNote>
          </div>
        )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
