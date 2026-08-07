"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import CompanyLogo from "@/components/CompanyLogo";
import SEOEngineModal from "@/components/SEOEngineModal";
import ExpertModal from "@/components/ExpertModal";
import ShareModal from "@/components/ShareModal";
import AWILogo from "@/components/AWILogo";
import GenerationsSidebar from "@/components/GenerationsSidebar";
import ProcessingBanner from "@/components/ProcessingBanner";
import TutorialModal, { tourSeen } from "@/components/TutorialModal";
import RealTrafficVisibility from "@/components/RealTrafficVisibility";
import RealCoverageCard from "@/components/RealCoverageCard";
import ProjectionView from "@/components/ProjectionView";
import ConcurrenceTab from "@/components/concurrence/ConcurrenceTab";
import { useAccount } from "@/components/AccountProvider";
import { useGeneration } from "@/components/GenerationProvider";
import { exportProjectPdf } from "@/lib/report-actions";
import NotWiredNotice from "@/components/NotWiredNotice";
import AnalyseTab from "@/components/AnalyseTab";
import NotorieteTab from "@/components/NotorieteTab";
import { tabsForRole, defaultTabForRole, type TabKey } from "@/lib/tabs";
import RealRecommendations from "@/components/RealRecommendations";
import ExpertCtaBanner from "@/components/ExpertCtaBanner";

export default function DashboardPage() {
  const { isAdmin, isLoggedIn, isProspect, hydrated } = useAccount();
  const router = useRouter();
  const { selected: currentGeneration, collapsed, loading } = useGeneration();

  // Pas de dashboard en déconnecté : on renvoie vers la connexion interne (pas le
  // funnel public) une fois la session restaurée.
  useEffect(() => {
    if (hydrated && !isLoggedIn) router.replace("/login");
  }, [hydrated, isLoggedIn, router]);
  const [showSEOEngine, setShowSEOEngine] = useState(false);
  const [showExpert, setShowExpert] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("analyse");
  const [psOpen, setPsOpen] = useState(false);
  const sidebarWidth = isAdmin ? (collapsed ? "80px" : "292px") : "0px";

  // Analyse gratuite déjà utilisée : verify-code a rendu un rapport EXISTANT
  // (1 gratuite/email). On l'annonce (« déjà utilisé pour X ») plutôt que de
  // laisser croire à une analyse fraîche. Flag posé par la landing (?reused=1).
  const [reusedNotice, setReusedNotice] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("reused") === "1") {
      setReusedNotice(true);
    }
  }, []);

  // L'onglet courant est validé contre les onglets disponibles pour le rôle :
  // au switch de compte, on retombe sur l'onglet par défaut si le tab n'existe plus.
  const roleTabs = tabsForRole(isAdmin);
  const activeTabSafe: TabKey = roleTabs.some((t) => t.key === activeTab)
    ? activeTab
    : defaultTabForRole(isAdmin);

  // Onglets branchés sur des DONNÉES RÉELLES. Vide pour l'instant : M0/M1 ont câblé
  // l'auth + la liste de projets, mais AUCUN corps d'analyse (scores, GEO, autorité,
  // PageSpeed, trafic, notoriété, recos) — tout est encore factice. Tant qu'un onglet
  // n'est pas ici, on affiche un état explicite, jamais un chiffre inventé. M3+ les ajoute.
  const WIRED_TABS: TabKey[] = ["home", "analyse", "notoriete", "concurrence", "projection", "recommandations"]; // home = Vue d'ensemble câblée (assemblage de briques réelles, design Barth 424-501)
  const tabWired = WIRED_TABS.includes(activeTabSafe);

  const [shareOpen, setShareOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  // Tutoriel d'accueil — affiché une seule fois pour le client (jamais pour l'admin).
  const [showTour, setShowTour] = useState(false);
  useEffect(() => {
    if (!isAdmin && !tourSeen()) setShowTour(true);
  }, [isAdmin]);

  // Au changement d'onglet, on remonte en haut (sinon la position de scroll de la vue
  // précédente est conservée — ex. on arrivait en bas du Plan d'action).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTabSafe]);

  // Partage prospect : ouvre le flux réel (email → POST /share → lien /report/:token),
  // repris d'apps/web. Fini le simple « copier l'URL du dashboard » (inutilisable
  // par un prospect, auth requise).
  function handleShare() {
    setShareOpen(true);
  }

  // Export PDF SERVEUR (Puppeteer, données réelles, identique à la vue prospect).
  // Jamais un window.print() (rendu variable selon la machine).
  async function handleDownloadReport() {
    if (pdfBusy) return;
    setPdfBusy(true);
    setPdfError(false);
    try {
      await exportProjectPdf(currentGeneration.id, currentGeneration.name);
    } catch {
      // Ne plus avaler l'échec en silence (bouton « mort ») : on le SIGNALE.
      setPdfError(true);
    } finally {
      setPdfBusy(false);
    }
  }

  // Déconnecté : on n'affiche rien (la redirection vers la landing est en cours).
  if (hydrated && !isLoggedIn) return null;

  // M1 : la liste réelle (sidebar + en-tête) se charge depuis l'API → loader sobre
  // tant qu'on n'a pas les projets (évite un rendu avec le placeholder vide).
  if (loading)
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-bg-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-purple border-t-transparent" />
      </div>
    );

  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      {showSEOEngine && <SEOEngineModal onClose={() => setShowSEOEngine(false)} />}
      {showExpert && <ExpertModal onClose={() => setShowExpert(false)} />}
      {showTour && <TutorialModal onClose={() => setShowTour(false)} onFocusTab={setActiveTab} />}
      {shareOpen && <ShareModal projectId={currentGeneration.id} onClose={() => setShareOpen(false)} />}

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-bg-primary" />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, var(--text-primary) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />

      <Header onExpertClick={() => setShowExpert(true)} hideLogo={isAdmin} showProfile sidebarWidth={sidebarWidth} activeTab={activeTabSafe} onTabChange={setActiveTab} isAdmin={isAdmin} />

      <div className="relative z-[3] flex flex-1">
        {/* Sidebar — admin only */}
        {isAdmin && <GenerationsSidebar />}

        {/* Main content */}
        <main
          data-dashboard-main
          className="flex flex-1 flex-col px-4 pt-20 md:px-8 md:pt-24"
        >
          <style>{`@media (min-width: 1024px) { [data-dashboard-main] { margin-left: ${sidebarWidth}; } }`}</style>
          <div className="mx-auto flex w-full max-w-[1360px] gap-6 xl:gap-8" key={currentGeneration.id}>
            <div className="min-w-0 flex-1">

            {/* Bandeau d'attente — client uniquement */}
            {!isAdmin && <ProcessingBanner />}

            {/* Analyse gratuite déjà utilisée : on affiche le rapport existant, mais
                on le DIT clairement (pour X = le domaine réellement analysé) et on
                oriente vers un expert pour analyser un autre site. */}
            {!isAdmin && reusedNotice && (
              <div className="animate-fade-up mb-6 rounded-2xl border border-accent-purple/25 bg-accent-purple/[0.06] p-5 md:p-6">
                <p className="text-[14px] font-medium text-text-primary">
                  Vous avez déjà utilisé votre analyse gratuite pour {currentGeneration.url}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-muted">
                  Voici votre rapport. Pour analyser un autre site, parlez à un expert.
                </p>
                <button
                  type="button"
                  onClick={() => setShowExpert(true)}
                  className="mt-4 inline-flex items-center rounded-full bg-accent-purple px-5 py-2 text-[13px] font-medium text-white transition hover:opacity-90"
                >
                  Parler à un expert
                </button>
              </div>
            )}

            {/* Client badge + Title */}
            <section className="relative pb-8">
              <div className="animate-fade-up mb-5">
                <CompanyLogo name={currentGeneration.name} initial={currentGeneration.initial} />
              </div>
              <h1
                className="animate-fade-up text-2xl font-medium tracking-tight text-text-primary md:text-3xl"
                style={{ animationDelay: "60ms" }}
              >
                {activeTabSafe === "home"
                  ? "Vue d'ensemble"
                  : activeTabSafe === "analyse"
                    ? "Global Search Index"
                    : activeTabSafe === "projection"
                      ? "Projection Business"
                      : activeTabSafe === "concurrence"
                        ? "Analyse Concurrentielle"
                        : activeTabSafe === "recommandations"
                          ? "Plan d'action"
                          : "Présence Média & Réputation"}
              </h1>
              {activeTabSafe === "analyse" && (
                <p
                  className="animate-fade-up mt-2 text-[length:var(--text-body)] font-light text-text-secondary"
                  style={{ animationDelay: "120ms" }}
                >
                  Découvrez vos scores de visibilité digitale : moteurs d&apos;IA, SEO technique, SEO sémantique et autorité.
                </p>
              )}
              {activeTabSafe === "projection" && (
                <p
                  className="animate-fade-up mt-2 text-[length:var(--text-body)] font-light text-text-secondary"
                  style={{ animationDelay: "120ms" }}
                >
                  Estimez le CA généré par un gain de visibilité SEO selon votre secteur d&apos;activité.
                </p>
              )}
              {activeTabSafe === "concurrence" && (
                <p
                  className="animate-fade-up mt-2 text-[length:var(--text-body)] font-light text-text-secondary"
                  style={{ animationDelay: "120ms" }}
                >
                  Comparez votre présence SEO à celle de vos concurrents sur vos mots-clés stratégiques.
                </p>
              )}
              {activeTabSafe === "recommandations" && (
                <p
                  className="animate-fade-up mt-2 text-[length:var(--text-body)] font-light text-text-secondary"
                  style={{ animationDelay: "120ms" }}
                >
                  Vos leviers prioritaires pour gagner en visibilité, classés par priorité et gain estimé.
                </p>
              )}
              {activeTabSafe === "notoriete" && (
                <p
                  className="animate-fade-up mt-2 text-[length:var(--text-body)] font-light text-text-secondary"
                  style={{ animationDelay: "120ms" }}
                >
                  Diagnostic de l&apos;autorité média de la marque et calendrier éditorial construit autour des temps forts de votre secteur.
                </p>
              )}

              {/* Actions */}
              <div className="absolute right-0 top-0 flex items-center gap-3">
                {/* Client : deux boutons icône (partager / télécharger) avec tooltip */}
                {!isAdmin && (
                  <div className="flex items-center gap-2">
                    <IconAction label="Partager mon rapport" onClick={handleShare}>
                      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                      </svg>
                    </IconAction>
                    <IconAction label={pdfBusy ? "Génération…" : "Télécharger mon rapport"} onClick={handleDownloadReport}>
                      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </IconAction>
                    {pdfError && (
                      <span className="whitespace-nowrap text-[11px] font-medium text-red-500">
                        Échec de l&apos;export. Réessayez.
                      </span>
                    )}
                  </div>
                )}

                {/* Admin : menu d'actions complet */}
                {isAdmin && (
                <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-bg-card text-text-secondary transition-colors duration-150 hover:bg-bg-card-hover hover:text-text-primary"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                  </svg>
                </button>

                {showActions && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                    <div
                      className="absolute right-0 top-11 z-20 w-48 origin-top-right rounded-xl border border-border-subtle bg-bg-card p-0.5 backdrop-blur-xl transition-all duration-200"
                      style={{
                        boxShadow: "0 12px 32px -4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
                        animation: "dropdown-in 200ms var(--ease-out) both",
                      }}
                    >
                      {[
                        {
                          label: "Partager",
                          icon: (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0-12.814a2.25 2.25 0 1 0 0-2.186m0 2.186a2.246 2.246 0 0 1-.283-1.093c0-.397.103-.77.283-1.093m0 12.814a2.25 2.25 0 1 0 0 2.186m0-2.186a2.246 2.246 0 0 1-.283 1.093c0 .397.103.77.283 1.093" />
                            </svg>
                          ),
                          onClick: () => { setShowActions(false); setShareOpen(true); },
                        },
                        {
                          label: pdfBusy ? "Génération du PDF…" : "Télécharger le PDF",
                          icon: (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                          ),
                          onClick: () => {
                            setShowActions(false);
                            handleDownloadReport();
                          },
                        },
                        {
                          label: "Supprimer",
                          icon: (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          ),
                          danger: true,
                          onClick: () => setShowActions(false),
                        },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={item.onClick}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors duration-150 ${
                            item.danger
                              ? "text-red-400 hover:bg-red-500/10"
                              : "text-text-secondary hover:bg-bg-card-hover hover:text-text-primary"
                          }`}
                        >
                          {item.icon}
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                </div>
                )}
              </div>
            </section>

            {!tabWired ? (
              <NotWiredNotice label="La vue d'ensemble Maison (synthèse et trafic mensuel)" />
            ) : activeTabSafe === "home" ? (
            <>
              {/* Trafic mensuel / Indice de visibilité — CÂBLÉ (2 sous-onglets réels). */}
              <div className="animate-fade-up mb-4" style={{ animationDelay: "300ms" }}>
                <RealTrafficVisibility projectId={currentGeneration.id} />
              </div>

              {/* Couverture top 10 — CÂBLÉE (buildConcurrenceData réel, pas le mock). */}
              <div className="animate-fade-up mb-4" style={{ animationDelay: "380ms" }}>
                <RealCoverageCard
                  projectId={currentGeneration.id}
                  clientName={currentGeneration.name}
                  clientInitial={currentGeneration.initial}
                />
              </div>

              {/* Recommandations + sidebar */}
              <section className="mt-6 grid grid-cols-1 gap-6 pb-16 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  {/* Recos RÉELLES au design EXACT de Barth (sa RecommendationCard +
                      badges), aperçu 3 recos + fondu + « voir toutes ». Ses
                      composants, NOS données. */}
                  <RealRecommendations
                    projectId={currentGeneration.id}
                    preview
                    onSeeAll={() => setActiveTab("recommandations")}
                    onExpertClick={() => setShowExpert(true)}
                  />
                </div>

                {/* RDV CTA sticky sidebar */}
                <div
                  className="animate-fade-up relative sticky top-6 self-start overflow-hidden rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]"
                  style={{
                    animationDelay: "500ms",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 40px -15px rgba(0,0,0,0.15)",
                  }}
                >
                  <div className="relative p-6 md:p-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                      <svg className="h-5 w-5 text-accent-pink" viewBox="0 0 512 512" fill="currentColor">
                        <path d="m255.5 226.2c-16.9 0-30 13.1-29.9 29.8.3 16.8 13.9 30.2 30.7 30.3 16.2.1 29.3-13 29.4-29.2 0-.2 0-.4 0-.6.2-16.6-13-30.2-29.6-30.4-.2.1-.4.1-.6.1z"/>
                        <path d="m256 0c-141.4 0-256 114.6-256 256s114.6 256 256 256 256-114.6 256-256-114.6-256-256-256zm135.6 144.5c-21.8 56.1-43.9 112-65.8 168-2.2 6.1-6.9 10.8-12.9 13.1-56.1 22-112.3 44.1-168.4 66.2-1.9.7-3.8 1.2-5.7 1.6-15 .1-23.4-12.8-18.3-26 11-28.5 22.3-56.9 33.5-85.3 10.8-27.4 21.5-54.7 32.2-82.2 2.5-6.5 6.6-11.1 13.1-13.6 55.8-21.8 111.6-43.7 167.4-65.7 12.1-4.8 23.3 0 26 11.6.7 4.1.4 8.4-1.1 12.3z"/>
                      </svg>
                    </div>
                    <p className="text-[length:var(--text-body-lg)] font-medium leading-relaxed text-text-primary">
                      Ces 4 leviers montrent un potentiel de gain immédiat sur votre visibilité organique.
                    </p>
                    <p className="mt-3 text-[length:var(--text-body)] font-light leading-relaxed text-text-secondary">
                      Je vous propose un rendez-vous de 30 minutes pour cadrer un plan d&apos;action priorisé sur 90 jours et identifier les chantiers à lancer en premier.
                    </p>
                    <div className="mt-6">
                      <Button variant="primary" fullWidth onClick={() => setShowExpert(true)}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                        </svg>
                        Prendre RDV
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            </>
            ) : activeTabSafe === "analyse" ? (
            <AnalyseTab
              projectId={currentGeneration.id}
              clientName={currentGeneration.name}
              onExpertClick={() => setShowExpert(true)}
            />
            ) : activeTabSafe === "projection" ? (
              <ProjectionView projectId={currentGeneration.id} />
            ) : activeTabSafe === "concurrence" ? (
              <ConcurrenceTab
                projectId={currentGeneration.id}
                clientName={currentGeneration.name}
                clientInitial={currentGeneration.initial}
                isProspect={isProspect}
                onExpertClick={() => setShowExpert(true)}
              />
            ) : activeTabSafe === "recommandations" ? (
              <RealRecommendations projectId={currentGeneration.id} />
            ) : (
              <NotorieteTab projectId={currentGeneration.id} clientName={currentGeneration.name} />
            )}

            </div>

            {/* CTA expert sticky (client) — à droite du contenu, sur toutes les vues */}
            {!isAdmin && (
              <aside className="hidden shrink-0 xl:block xl:w-[348px] xl:min-w-[348px]">
                <div
                  className="sticky top-3"
                  style={{ animation: "fade-up 600ms var(--ease-expo) both", animationDelay: "220ms" }}
                >
                  <div
                    className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 p-8"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(20,4,18,0.10) 0%, rgba(20,4,18,0.45) 100%), url('/barth-staging/expert-card-bg.jpg') center/cover no-repeat, radial-gradient(120% 80% at 50% 0%, rgba(236,77,203,0.3) 0%, transparent 55%), linear-gradient(160deg, #2b0826 0%, #46103c 100%)",
                    }}
                  >
                    {/* Avatars + preuve sociale */}
                    <div className="flex items-center gap-2">
                      <div className="flex shrink-0 -space-x-2">
                        {["/barth-staging/consultant1.png", "/barth-staging/consultant2.png", "/barth-staging/consultant3.png"].map((src) => (
                          <img key={src} src={src} alt="Consultant" className="h-8 w-8 rounded-full border-2 border-white object-cover" />
                        ))}
                      </div>
                      <span className="min-w-0 flex-1 text-[12px] font-medium leading-snug text-white/85">
                        +500 clients PME, ETI et<br />marques B2B accompagnés
                      </span>
                    </div>

                    <h3 className="text-[24px] font-semibold leading-tight tracking-[-0.4px] text-white">
                      Un expert AWI décrypte vos résultats
                    </h3>
                    <p className="text-[15px] font-light leading-relaxed text-white/75">
                      Transformez votre diagnostic en plan d&apos;action priorisé pour gagner rapidement en visibilité.
                    </p>

                    <Button variant="primary" fullWidth onClick={() => setShowExpert(true)}>
                      Demandez votre plan d&apos;action
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </Button>

                    {/* Note Google */}
                    <div className="flex items-center justify-center gap-1.5 text-[12px] text-white/85">
                      <img src="/barth-staging/google.svg" alt="Google" className="h-3.5 w-3.5" />
                      <span>Noté 5.0 sur 50+ avis</span>
                      <span className="flex -space-x-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <svg key={i} className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="#FBBF24">
                            <path d="M11.48 3.5a.562.562 0 0 1 1.04 0l2.125 5.11a.563.563 0 0 0 .475.346l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.884a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.563.563 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                          </svg>
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </main>
      </div>

      <div data-dashboard-main>
        <Footer />
      </div>
    </div>
  );
}

/** Bouton icône avec tooltip accessible (hover + focus clavier). */
function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        aria-label={label}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-bg-card text-text-secondary transition-colors duration-150 hover:bg-bg-card-hover hover:text-text-primary"
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        {children}
      </button>
      <span className="pointer-events-none absolute right-0 top-11 z-30 whitespace-nowrap rounded-md border border-border-subtle bg-[var(--tooltip-bg)] px-2 py-1 text-[11px] font-medium text-text-primary opacity-0 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.4)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        {label}
      </span>
    </div>
  );
}
