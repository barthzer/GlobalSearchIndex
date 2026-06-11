import AWILogo from "@/components/AWILogo";
import type { Generation } from "@/components/GenerationProvider";
import ReportPage from "./ReportPage";

interface Props {
  client: Generation;
  consultant: string;
}

const sectionPills = [
  "Analyse du site",
  "Recommandations",
  "Concurrence",
  "Notoriété média",
];

export default function CoverPage({ client, consultant }: Props) {
  return (
    <ReportPage id="page-cover">
      <div className="flex h-full flex-col">
        {/* Top brand band — logo GSI à gauche, AWI rose à droite */}
        <div className="flex items-center justify-between">
          <span className="text-[20px] leading-none tracking-[-1.2px] text-text-primary">
            <span className="font-semibold">GlobalSearch</span>
            <span className="font-normal">Index</span>
          </span>
          <AWILogo className="h-6 w-auto text-accent-pink" />
        </div>

        {/* Hairline */}
        <div className="mt-6 h-px w-full bg-border-subtle" />

        {/* Title block */}
        <div className="mt-[24mm] flex flex-1 flex-col">
          <span className="text-[12px] font-medium text-accent-pink">Rapport client</span>

          {/* Client identity — juste sous "Rapport client" */}
          <div className="mt-3 flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${client.color} text-[14px] font-bold text-white shadow-md`}
            >
              {client.initial}
            </div>
            <div>
              <div className="text-[20px] font-semibold leading-tight tracking-tight text-text-primary">
                {client.name}
              </div>
              <div className="text-[12px] font-light text-text-secondary">{client.url}</div>
            </div>
          </div>

          <h1 className="mt-8 text-[60px] font-medium leading-[1.02] tracking-tight text-text-primary">
            Score de
            <br />
            référencement
            <br />
            Global
          </h1>

          <div className="mt-7 flex flex-wrap gap-2">
            {sectionPills.map((p) => (
              <span
                key={p}
                className="inline-flex items-center rounded-full border border-border-subtle bg-card-inner-bg px-4 py-2 text-[14px] font-medium text-text-primary"
              >
                {p}
              </span>
            ))}
          </div>

          {/* Synthèse — teaser pour donner envie de lire le rapport */}
          <div className="mt-10 max-w-[160mm] border-l-2 border-accent-pink/40 pl-5">
            <div className="text-[11px] font-medium text-text-muted">Synthèse</div>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-text-primary">
              5 leviers d&apos;activation immédiate identifiés, dont 2 critiques sur la performance technique et la couverture mobile.
              Mis en œuvre, ils peuvent générer <span className="font-medium text-text-primary">+18% de trafic organique</span> et débloquer la visibilité sur les moteurs IA (SGE, ChatGPT).
            </p>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-auto flex items-center justify-between border-t border-border-subtle pt-4">
          <span className="text-[11px] font-light text-text-muted">
            Document confidentiel · Diffusion restreinte
          </span>
          <span className="text-[11px] font-light text-text-muted">
            Audit du {formatDate(client.date)} · {consultant}
          </span>
        </div>
      </div>
    </ReportPage>
  );
}

function formatDate(raw: string) {
  // Input format e.g. "8 avr. 2026"; we accept and pass through with minor normalization
  return raw.replace(/\./g, "");
}
