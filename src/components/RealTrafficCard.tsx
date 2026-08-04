"use client";

import type { ProjectScore } from "@/lib/scores";
import { TrafficChart } from "./PageSpeedCard";
import InsightNote from "./InsightNote";

// Trafic mensuel — courbe org_traffic (MONDE) portée par le score geo_citations
// (réponse GET /gsi/geo-score : traffic_curve + traffic_geo). Design = TrafficChart
// de Barth, données RÉELLES SEO Engine.
//
// ⚠️ geo_citations est un score RELATIF : créé 'locked', déclenché SEULEMENT au
// déblocage sémantique (jamais en auto). Donc avant déblocage il n'y a PAS de
// traffic_curve — la carte doit alors le DIRE, jamais disparaître (vide silencieux
// interdit). On pilote sur le STATUS du score, pas seulement sur rawData :
//   - absent / locked    → « collectée avec l'analyse concurrentielle » (déblocage),
//   - pending/processing  → « en cours de collecte »,
//   - error               → « n'a pas pu être collectée »,
//   - completed + null     → non mesuré (Ahrefs indisponible),
//   - completed + []       → domaine inconnu d'Ahrefs (pas d'historique),
//   - completed + [...]     → courbe (longueur variable, ≥2 points pour tracer).
// `traffic_geo` (= "monde") est une mention OBLIGATOIRE à l'affichage (contrat).

/** Point de courbe trafic — miroir de GeoTrafficPoint (@gsi/shared, non importé ici). */
interface TrafficPoint {
  date: string;
  org_traffic: number;
}

const MONTHS_FR = [
  "", "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

/** ISO8601 → « janv. 25 ». Robuste à une date malformée (repli sur la chaîne brute). */
function monthLabel(iso: string): string {
  const m = /^(\d{4})-(\d{2})/.exec(iso ?? "");
  if (!m) return iso ?? "";
  const mm = parseInt(m[2], 10);
  return `${MONTHS_FR[mm] ?? m[2]} ${m[1].slice(2)}`;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border-subtle bg-bg-card">
      <div className="flex items-center gap-2 px-5 pt-5 md:px-6 md:pt-6">
        <span className="text-text-primary/80">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
          </svg>
        </span>
        <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
          Trafic mensuel
        </span>
        <span className="ml-2 rounded-full border border-border-subtle bg-card-inner-bg px-2 py-0.5 text-[11px] font-medium text-text-muted">
          monde
        </span>
      </div>
      {children}
    </section>
  );
}

/** État honnête textuel (jamais un vide) — même coquille que la courbe. */
function TrafficMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 pb-5 pt-3 md:px-6 md:pb-6">
      <p className="text-[13px] font-light leading-relaxed text-text-secondary">
        {children}
      </p>
    </div>
  );
}

export default function RealTrafficCard({
  score,
}: {
  /** Le score geo_citations (status + rawData). null = pas encore créé (idem locked). */
  score: ProjectScore | null;
}) {
  const status = score?.status ?? null;
  const rawData = score?.rawData ?? null;

  // Le contrat impose "monde" ; on lit la valeur remontée si présente, sinon on
  // affiche quand même "monde" (mention obligatoire) — jamais rien.
  const geoLabel =
    rawData && typeof rawData.traffic_geo === "string" && rawData.traffic_geo
      ? rawData.traffic_geo
      : "monde";

  // ÉTAT 1 — geo_citations absent ou locked : le trafic est collecté AVEC l'analyse
  // concurrentielle (déblocage sémantique). On le DIT, on ne disparaît pas.
  if (status === null || status === "locked") {
    return (
      <Shell>
        <TrafficMessage>
          La courbe de trafic organique ({geoLabel}) est collectée avec
          l&apos;analyse concurrentielle. Débloquez-la pour visualiser
          l&apos;évolution du trafic sur les derniers mois.
        </TrafficMessage>
      </Shell>
    );
  }

  // ÉTAT 2 — en cours de mesure.
  if (status === "pending" || status === "processing") {
    return (
      <Shell>
        <TrafficMessage>
          Courbe de trafic organique ({geoLabel}) en cours de collecte…
        </TrafficMessage>
      </Shell>
    );
  }

  // ÉTAT 3 — erreur de mesure.
  if (status === "error") {
    return (
      <Shell>
        <TrafficMessage>
          La courbe de trafic organique ({geoLabel}) n&apos;a pas pu être
          collectée. Relancez l&apos;analyse concurrentielle.
        </TrafficMessage>
      </Shell>
    );
  }

  // ÉTAT 4 (completed) — on lit traffic_curve, avec ses trois sous-états.
  const curve = (rawData?.traffic_curve ?? null) as TrafficPoint[] | null;

  // 4a — null : Ahrefs indisponible (distinct de [] : domaine inconnu).
  if (curve === null) {
    return (
      <Shell>
        <TrafficMessage>
          La courbe de trafic ({geoLabel}) n&apos;a pas pu être mesurée pour ce
          domaine (source indisponible).
        </TrafficMessage>
      </Shell>
    );
  }

  // 4b — [] : domaine inconnu d'Ahrefs, pas d'historique.
  if (curve.length === 0) {
    return (
      <Shell>
        <TrafficMessage>
          Aucun historique de trafic organique ({geoLabel}) n&apos;est référencé
          pour ce domaine.
        </TrafficMessage>
      </Shell>
    );
  }

  // 4c — un seul point : pas de courbe traçable, on affiche la valeur seule.
  if (curve.length === 1) {
    const only = curve[0];
    return (
      <Shell>
        <div className="px-5 pb-5 pt-3 md:px-6 md:pb-6">
          <p className="text-[14px] text-text-secondary">
            <span className="text-2xl font-bold tabular-nums text-text-primary">
              {only.org_traffic.toLocaleString("fr-FR")}
            </span>{" "}
            visites organiques estimées ({geoLabel}) · {monthLabel(only.date)}
          </p>
        </div>
      </Shell>
    );
  }

  // 4d — longueur variable (≥2) : courbe rendue par le composant de Barth.
  const values = curve.map((p) => p.org_traffic);
  const months = curve.map((p) => monthLabel(p.date));

  return (
    <Shell>
      <div className="border-t border-border-subtle px-4 pb-4 pt-3 md:px-5">
        <TrafficChart values={values} months={months} showPositions={false} />
        <InsightNote className="mt-3">
          Le{" "}
          <span className="font-medium text-text-primary">trafic mensuel</span>{" "}
          correspond aux visites organiques estimées ({geoLabel}) sur les{" "}
          {curve.length} derniers mois relevés.
        </InsightNote>
      </div>
    </Shell>
  );
}
