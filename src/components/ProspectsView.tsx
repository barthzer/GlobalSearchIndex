"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Button from "./Button";

/** État du parcours d'un lead (dit si le prospect est chaud). */
interface LeadParcours {
  emailVerified: boolean;
  analysisDone: boolean;
  competitiveUnlocked: boolean;
}

interface Lead {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  url: string;
  projectId: string | null;
  hasLead: boolean;
  parcours: LeadParcours;
}

/** Pastille de parcours : verte si franchie, grise sinon. */
function Step({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        ok
          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-400"
          : "border-border-subtle bg-card-inner-bg text-text-muted"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-text-muted/40"}`} />
      {label}
    </span>
  );
}

function frDate(iso: string): string {
  // Affichage court JJ/MM HH:MM sans dépendance (le back renvoie de l'ISO UTC).
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/**
 * Vue « Prospects » (COMEX 2026-08-21) : leads captés au funnel, récents d'abord.
 * Compteur total, tableau (date, nom+société, email, téléphone, domaine), état du
 * parcours (lead chaud), lien vers l'analyse, export CSV. Réservé admin.
 */
export default function ProspectsView() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiFetch("/admin/leads");
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { total: number; leads: Lead[] };
        if (!active) return;
        setLeads(data.leads);
        setTotal(data.total);
      } catch {
        if (active) setError("Impossible de charger les prospects.");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleExport() {
    try {
      const res = await apiFetch("/admin/export-leads");
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gsi-prospects-export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export impossible pour le moment.");
    }
  }

  if (error) {
    return <p className="text-[13px] text-red-400">{error}</p>;
  }
  if (!leads) {
    return <p className="text-[13px] text-text-muted">Chargement des prospects…</p>;
  }

  return (
    <div>
      {/* Compteur total + export, comme l'écran Santé. */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] font-light text-text-secondary">
          <span className="text-[18px] font-semibold text-text-primary">{total}</span>{" "}
          prospect{total > 1 ? "s" : ""} capturé{total > 1 ? "s" : ""} par le funnel
        </p>
        <Button variant="tertiary" onClick={handleExport} disabled={total === 0}>
          Exporter les prospects (CSV)
        </Button>
      </div>

      {total === 0 ? (
        <p className="rounded-xl border border-border-subtle bg-bg-card p-6 text-center text-[13px] font-light text-text-secondary">
          Aucun prospect capturé pour l&apos;instant. La liste se remplira dès les
          premières analyses gratuites du funnel.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-subtle">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-border-subtle bg-card-inner-bg text-left text-[12px] font-medium text-text-muted">
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Prospect</th>
                <th className="px-3 py-2.5">Contact</th>
                <th className="px-3 py-2.5">Domaine analysé</th>
                <th className="px-3 py-2.5">Parcours</th>
                <th className="px-3 py-2.5">Analyse</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-border-subtle/50 last:border-0 hover:bg-bg-card-hover"
                >
                  <td className="whitespace-nowrap px-3 py-3 text-text-muted">
                    {frDate(l.createdAt)}
                  </td>
                  <td className="px-3 py-3">
                    {l.hasLead ? (
                      <>
                        <div className="font-medium text-text-primary">
                          {l.firstName} {l.lastName}
                        </div>
                        <div className="text-[12px] text-text-muted">{l.company}</div>
                      </>
                    ) : (
                      // Prospect qui a lancé une analyse sans remplir le formulaire de
                      // contact : on n'a que l'email, on le dit clairement.
                      <span className="inline-flex items-center rounded-full border border-border-subtle bg-card-inner-bg px-2 py-0.5 text-[11px] font-medium text-text-muted">
                        Sans formulaire
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <a
                      href={`mailto:${l.email}`}
                      className="text-text-secondary hover:text-accent-pink"
                    >
                      {l.email}
                    </a>
                    <div className="text-[12px] text-text-muted">{l.phone}</div>
                  </td>
                  <td className="px-3 py-3 text-text-secondary">{l.url}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Step ok={l.parcours.emailVerified} label="Email vérifié" />
                      <Step ok={l.parcours.analysisDone} label="Analyse finie" />
                      <Step ok={l.parcours.competitiveUnlocked} label="Concurrentiel" />
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {l.projectId ? (
                      <a
                        href={`/dashboard?project=${l.projectId}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-border-subtle px-2.5 py-1 text-[12px] font-medium text-text-secondary transition-colors hover:border-accent-pink/40 hover:text-text-primary"
                      >
                        Voir l&apos;analyse
                      </a>
                    ) : (
                      <span className="text-[12px] text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
