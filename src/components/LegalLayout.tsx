"use client";

import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ExpertModal from "./ExpertModal";

/**
 * Gabarit des pages légales (confidentialité, CGU…) : Header AWI + Footer +
 * conteneur de lecture aux tokens du DS sombre. Contenu = template à faire
 * valider/ajuster par le client selon ses intégrations réelles.
 */
export default function LegalLayout({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  updated: string;
  children: React.ReactNode;
}) {
  const [showExpert, setShowExpert] = useState(false);

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-bg-primary">
      {showExpert && <ExpertModal onClose={() => setShowExpert(false)} />}
      <Header onExpertClick={() => setShowExpert(true)} />

      <main className="relative z-[3] flex flex-1 flex-col items-center px-4 pt-24 pb-16 md:px-8 md:pt-32">
        <article className="w-full max-w-[760px]">
          <p className="mb-3 text-[13px] font-light text-text-muted">
            Dernière mise à jour : {updated}
          </p>
          <h1 className="text-[32px] font-medium leading-tight tracking-[-1px] text-text-heading md:text-[42px]">
            {title}
          </h1>
          {intro && (
            <p className="mt-4 text-[16px] font-light leading-relaxed text-text-secondary">
              {intro}
            </p>
          )}

          {/* Bandeau template — à retirer une fois le contenu validé juridiquement */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <p className="text-[13px] font-light leading-relaxed text-text-secondary">
              Modèle de page à faire valider par un conseil juridique et à compléter selon vos intégrations et traitements réels (hébergeur, sous-traitants, outils analytics…).
            </p>
          </div>

          <div className="legal-prose mt-10 flex flex-col gap-8">{children}</div>
        </article>
      </main>

      <Footer />

      <style jsx global>{`
        .legal-prose section > h2 {
          font-size: 19px;
          font-weight: 500;
          letter-spacing: -0.3px;
          color: var(--text-heading);
          margin-bottom: 10px;
        }
        .legal-prose section > p,
        .legal-prose section > ul {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.7;
          color: var(--text-secondary);
        }
        .legal-prose section > ul {
          margin-top: 8px;
          padding-left: 18px;
          list-style: disc;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .legal-prose section > p + p {
          margin-top: 10px;
        }
        .legal-prose a {
          color: var(--accent-pink);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
