/**
 * Validation d'email professionnel partagée (onboarding, EmailModal…).
 * Bloque les domaines grand public pour ne capturer que des leads qualifiés.
 */

export const FREE_DOMAINS = [
  "gmail.com", "yahoo.com", "yahoo.fr", "hotmail.com", "hotmail.fr",
  "outlook.com", "outlook.fr", "live.com", "live.fr", "aol.com",
  "icloud.com", "me.com", "mac.com", "mail.com", "protonmail.com",
  "proton.me", "gmx.com", "gmx.fr", "yandex.com", "zoho.com",
  "free.fr", "orange.fr", "sfr.fr", "laposte.net", "wanadoo.fr",
  "bbox.fr", "numericable.fr",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Retourne un message d'erreur FR, ou "" si l'email pro est valide. */
export function validateProEmail(value: string): string {
  if (!value.trim()) return "Veuillez entrer votre email professionnel.";
  if (!EMAIL_RE.test(value)) return "Format d'email invalide.";
  const domain = value.split("@")[1].toLowerCase();
  if (FREE_DOMAINS.includes(domain)) {
    return "Veuillez utiliser votre adresse email professionnelle.";
  }
  return "";
}
