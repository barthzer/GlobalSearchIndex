"use client";

/**
 * Infos utilisateur/client rattachées à une génération (mock localStorage).
 * Permet au consultant de renseigner nom/prénom/email du client, ou de retrouver
 * ceux saisis par un utilisateur en ligne.
 * TODO: brancher sur le backend N8N (lead par génération).
 */
export interface ClientInfo {
  firstName: string;
  lastName: string;
  email: string;
}

const KEY = (genId: string) => `gsi:client-info:v1:${genId}`;

const EMPTY: ClientInfo = { firstName: "", lastName: "", email: "" };

export function getClientInfo(genId: string): ClientInfo {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY(genId));
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<ClientInfo>) };
  } catch {
    return EMPTY;
  }
}

export function saveClientInfo(genId: string, info: ClientInfo) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY(genId), JSON.stringify(info));
  } catch {
    /* mode privé */
  }
}
