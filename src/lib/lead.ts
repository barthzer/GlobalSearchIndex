/**
 * Lead capturé à l'onboarding (avant lancement d'une analyse).
 * Centralise le modèle + la persistance — point d'intégration backend unique.
 */

import { apiFetch } from "./api";

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
 * Persiste le lead SERVEUR (POST /public/leads → table `leads`, source de vérité ;
 * le webhook N8N est déclenché côté serveur). Best-effort : un échec réseau ne
 * bloque JAMAIS le parcours (comme requestPublicCode). Envoie exactement les champs
 * du DTO (forbidNonWhitelisted côté API) — `submittedAt` reste local.
 *
 * Le cache localStorage est conservé pour le préremplissage consultant
 * (getLatestLead). La lecture par email (getLeadByEmail, login particulier) sera
 * remplacée par un chantier serveur dédié — d'ici là elle reste locale.
 */
export async function saveLead(lead: OnboardingLead): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(LEADS_KEY);
      const list: OnboardingLead[] = raw ? JSON.parse(raw) : [];
      list.push(lead);
      window.localStorage.setItem(LEADS_KEY, JSON.stringify(list));
    } catch {
      /* mode privé : le cache local est optionnel, la persistance serveur prime */
    }
  }
  try {
    await apiFetch("/public/leads", {
      method: "POST",
      body: JSON.stringify({
        firstName: lead.firstName,
        lastName: lead.lastName,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        companySize: lead.companySize,
        worksWithAgency: lead.worksWithAgency,
        goals: lead.goals,
        url: lead.url,
      }),
    });
  } catch {
    /* best-effort : ne bloque pas l'onboarding si la capture serveur échoue */
  }
}

/**
 * Demande d'expert (CTA « Demandez votre plan d'action ») → POST /public/leads avec
 * source='expert' (notifié à contact@l-agenceweb.com côté serveur). Complète les
 * champs manquants (url, objectifs) depuis le dernier lead d'onboarding. Best-effort :
 * un échec ne bloque JAMAIS la confirmation affichée à l'utilisateur.
 */
export async function submitExpertLead(fields: {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  message?: string;
}): Promise<void> {
  const base = getLatestLead();
  try {
    await apiFetch("/public/leads", {
      method: "POST",
      body: JSON.stringify({
        ...fields,
        message: fields.message?.trim() || null,
        companySize: base?.companySize ?? null,
        worksWithAgency: base?.worksWithAgency ?? null,
        goals: base?.goals ?? [],
        url: base?.url ?? "",
        source: "expert",
      }),
    });
  } catch {
    /* best-effort */
  }
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

/**
 * Construit les champs de compte client à partir d'un lead (onboarding / connexion).
 * Centralise le mapping lead → compte pour rester cohérent sur tous les points d'entrée.
 */
export function accountFieldsFromLead(lead: OnboardingLead) {
  return {
    type: "user" as const,
    name: `${lead.firstName} ${lead.lastName}`.trim() || lead.company || "Mon compte",
    email: lead.email,
    firstName: lead.firstName,
    lastName: lead.lastName,
    company: lead.company,
    phone: lead.phone,
  };
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
