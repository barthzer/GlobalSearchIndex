/**
 * Lead capturé à l'onboarding (avant lancement d'une analyse).
 * Centralise le modèle + la persistance — point d'intégration backend unique.
 */

export type CompanySize = "solo" | "2-10" | "11-50" | "51-200" | "200+";
export type AgencyAnswer = "oui" | "non";

export interface OnboardingLead {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  companySize: CompanySize | null;
  worksWithAgency: AgencyAnswer | null;
  goals: string[];
  url: string;
  submittedAt: number;
}

const LEADS_KEY = "gsi:leads:v1";

/**
 * Persiste le lead (mock localStorage) et expose le point de branchement N8N.
 * Le jour du backend : remplacer le corps par un POST vers le webhook.
 */
export function saveLead(lead: OnboardingLead) {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(LEADS_KEY);
      const list: OnboardingLead[] = raw ? JSON.parse(raw) : [];
      list.push(lead);
      window.localStorage.setItem(LEADS_KEY, JSON.stringify(list));
    } catch {
      /* ignore en mock */
    }
  }
  // TODO(backend N8N): POST lead → webhook de capture de lead
  // await fetch(process.env.NEXT_PUBLIC_LEAD_WEBHOOK!, { method: "POST", body: JSON.stringify(lead) });
}

/**
 * Retrouve le lead (analyse) associé à un email — connexion particulier.
 * Insensible à la casse, renvoie le plus récent en cas de doublons.
 */
export function getLeadByEmail(email: string): OnboardingLead | null {
  if (typeof window === "undefined") return null;
  const target = email.trim().toLowerCase();
  if (!target) return null;
  try {
    const raw = window.localStorage.getItem(LEADS_KEY);
    if (!raw) return null;
    const list: OnboardingLead[] = JSON.parse(raw);
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].email?.trim().toLowerCase() === target) return list[i];
    }
    return null;
  } catch {
    return null;
  }
}

/** Email de l'analyse de démonstration (connexion de test). */
export const DEMO_LEAD_EMAIL = "demo@maisonkleber.fr";

/**
 * Mock dev : garantit qu'une analyse de démo existe pour tester la connexion
 * (saisie d'un email reconnu). N'écrase jamais les leads réels.
 * TODO(backend): à retirer — les comptes existeront en base.
 */
export function ensureDemoLead() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(LEADS_KEY);
    const list: OnboardingLead[] = raw ? JSON.parse(raw) : [];
    if (list.some((l) => l.email?.trim().toLowerCase() === DEMO_LEAD_EMAIL)) return;
    list.push({
      firstName: "Marie",
      lastName: "Kleber",
      company: "Maison Kleber",
      email: DEMO_LEAD_EMAIL,
      phone: "",
      companySize: "11-50",
      worksWithAgency: "non",
      goals: ["geo"],
      url: "maisonkleber.fr",
      submittedAt: 0,
    });
    window.localStorage.setItem(LEADS_KEY, JSON.stringify(list));
  } catch {
    /* mode privé — on ignore */
  }
}

/** Dernier lead capturé (pour préremplir les formulaires consultant). */
export function getLatestLead(): OnboardingLead | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEADS_KEY);
    if (!raw) return null;
    const list: OnboardingLead[] = JSON.parse(raw);
    return list.length ? list[list.length - 1] : null;
  } catch {
    return null;
  }
}
