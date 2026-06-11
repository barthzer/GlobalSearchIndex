"use client";

import ModalPortal from "./ModalPortal";
import AccountAvatar from "./AccountAvatar";
import { useAccount } from "./AccountProvider";

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const { accounts, login } = useAccount();

  return (
    <ModalPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md"
        onClick={onClose}
        style={{ animation: "fade-up 300ms var(--ease-expo) both" }}
      />

      <div
        className="relative w-full max-w-[400px] rounded-[2rem] border border-white/[0.06] bg-input-bg p-2"
        style={{ animation: "fade-up 400ms var(--ease-expo) both" }}
      >
        <div
          className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-30"
          style={{
            background: "conic-gradient(from 220deg, transparent 50%, rgba(95,20,251,0.2) 70%, rgba(236,77,203,0.2) 85%, transparent 100%)",
          }}
        />

        <div className="relative overflow-hidden rounded-[calc(2rem-0.5rem)] border border-border-subtle bg-modal-bg p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(236,77,203,0.5) 0%, transparent 70%)" }}
          />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-input-bg text-text-muted transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.95]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="relative mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
              <svg className="h-5 w-5 text-[#EE56CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <h2 className="text-[22px] font-medium tracking-[-0.4px] text-text-primary">
              Connexion
            </h2>
            <p className="mt-2 text-[14px] font-extralight leading-relaxed text-text-secondary">
              Accédez à votre dashboard et retrouvez vos analyses.
            </p>
          </div>

          <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          {/* Account selection */}
          <div className="flex flex-col gap-3">
            {accounts.map((a) => (
              <button
                key={a.type}
                onClick={() => {
                  login(a.type);
                  onClose();
                }}
                className="group flex w-full items-center gap-4 rounded-xl border border-border-subtle bg-bg-card p-4 transition-all duration-200 hover:border-accent-pink/20 hover:bg-bg-card-hover active:scale-[0.98]"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <AccountAvatar name={a.name} avatar={a.avatar} size={44} className="shrink-0" />
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[15px] font-medium text-text-primary">{a.name}</p>
                  <p className="text-[12px] text-text-muted">{a.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-border-subtle bg-card-inner-bg px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                    {a.type === "admin" ? "Admin" : "Client"}
                  </span>
                  <svg className="h-4 w-4 text-text-muted transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
