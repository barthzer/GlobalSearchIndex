"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "./Button";
import ProfileMenu from "./ProfileMenu";
import MobileMenu from "./MobileMenu";
import AWILogoCompact from "./AWILogoCompact";
import WebtvModal from "./WebtvModal";
import CreditBadge from "./CreditBadge";
import { useGeneration } from "./GenerationProvider";
import { tabsForRole, type TabKey } from "@/lib/tabs";

interface HeaderProps {
  showNewAudit?: boolean;
  onExpertClick?: () => void;
  hideLogo?: boolean;
  showProfile?: boolean;
  sidebarWidth?: string;
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
  isAdmin?: boolean;
}

const homeIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

export default function Header({ onExpertClick, hideLogo = false, sidebarWidth = "220px", activeTab, onTabChange, isAdmin, showProfile }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showWebtv, setShowWebtv] = useState(false);
  const { selected: currentGeneration } = useGeneration();
  const reportUrl = `/dashboard/rapport?clientId=${currentGeneration.id}`;
  const tabs = tabsForRole(!!isAdmin);
  const iconTabs = tabs.filter((t) => t.iconOnly);
  const textTabs = tabs.filter((t) => !t.iconOnly);

  return (
    <>
      <header
        data-header
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-5 md:px-8 md:py-6"
      >
        {hideLogo && <style>{`@media (min-width: 1024px) { [data-header] { left: ${sidebarWidth} !important; } [data-header] [data-logo] { display: none; } }`}</style>}
        <div className="flex flex-1 items-center">
          <Link href="/" data-logo className="flex flex-col leading-tight">
            <span className="text-[20px] tracking-[-1.2px] text-text-primary">
              <span className="font-semibold">GlobalSearch</span>
              <span className="font-normal">Index</span>
            </span>
            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-text-primary">
              By <AWILogoCompact className="h-[12px] w-auto text-text-primary" />
            </span>
          </Link>
        </div>

        {/* Center — Tab switch + admin add */}
        {activeTab && onTabChange && (
          <div className="hidden flex-none items-center gap-2 md:flex">
            {iconTabs.length > 0 && (
              <div className="flex items-center gap-1 rounded-full border border-border-subtle bg-card-inner-bg p-1">
                {iconTabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => onTabChange(t.key)}
                    title={t.label}
                    className={`flex h-[38px] w-[38px] items-center justify-center rounded-full transition-all duration-200 ${
                      activeTab === t.key
                        ? "bg-bg-card text-text-primary shadow-sm"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  >
                    {homeIcon}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-1 rounded-full border border-border-subtle bg-card-inner-bg p-1">
              {textTabs.map((t) => (
                <button
                  key={t.key}
                  data-tour-tab={t.key}
                  onClick={() => onTabChange(t.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-5 py-1.5 text-[16px] font-medium transition-all duration-200 ${
                    activeTab === t.key
                      ? "bg-bg-card text-text-primary shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  {t.label}
                  {!isAdmin && t.key === "recommandations" && (
                    <span className="-mt-2.5 rounded-full bg-accent-pink px-1.5 py-[1px] text-[10px] font-bold leading-none text-white shadow-[0_2px_6px_-1px_rgba(236,77,203,0.5)]">
                      +10
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Admin add button */}
            {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-border-subtle bg-card-inner-bg text-text-muted transition-all duration-200 hover:border-border-badge hover:bg-bg-card-hover hover:text-text-primary active:scale-[0.95]"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
              {showAddMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
                  <div
                    className="absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-border-subtle bg-bg-primary p-0.5"
                    style={{
                      boxShadow: "0 12px 32px -4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
                      animation: "dropdown-in 200ms var(--ease-out) both",
                    }}
                  >
                    <button
                      onClick={() => { setShowAddMenu(false); setShowWebtv(true); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-text-secondary transition-colors duration-150 hover:bg-bg-card-hover hover:text-text-primary"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                      Recommandations WebTV
                    </button>
                  </div>
                </>
              )}
            </div>
            )}
          </div>
        )}

        {/* Right track */}
        <div className="flex flex-1 items-center justify-end">
        {/* Desktop nav */}
        <div className="hidden items-center gap-5 md:flex">
          {isAdmin && (
            <a
              href={reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Générer un rapport client"
              className="flex h-9 items-center gap-1.5 rounded-full border border-border-subtle bg-card-inner-bg px-3 text-[13px] font-medium text-text-secondary transition-all duration-200 hover:border-border-badge hover:bg-bg-card-hover hover:text-text-primary active:scale-[0.97]"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              Rapport
            </a>
          )}
          {!isAdmin && <CreditBadge onExhaustedClick={onExpertClick} />}
          <ProfileMenu />
          {!isAdmin && (onExpertClick ? (
            <Button variant="tertiary" onClick={onExpertClick}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
              </svg>
              Parler à un expert
            </Button>
          ) : (
            <Button variant="tertiary" href="#">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
              </svg>
              Parler à un expert
            </Button>
          ))}
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-bg-card text-text-primary transition-all duration-200 hover:bg-bg-card-hover active:scale-[0.95] md:hidden"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <MobileMenu
          onClose={() => setMobileOpen(false)}
          onExpertClick={onExpertClick}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      )}

      {/* WebTV modal */}
      {showWebtv && <WebtvModal onClose={() => setShowWebtv(false)} />}
    </>
  );
}
