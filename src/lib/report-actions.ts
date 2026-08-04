// Actions de rapport côté client (export PDF). Le PDF est généré SERVEUR
// (Puppeteer, données réelles, identique à la vue prospect) : on récupère le
// buffer en attachment via apiFetch (Bearer + refresh gérés), puis on déclenche
// le téléchargement navigateur. Jamais un window.print() (rendu variable).

import { apiFetch } from "@/lib/api";

/** Nettoie un nom de projet pour en faire un nom de fichier sûr (accents/espaces → tirets). */
function toFilenameSlug(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // retire les diacritiques
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "rapport"
  );
}

/**
 * Exporte le rapport d'un projet en PDF et déclenche son téléchargement.
 *
 * @param projectId Identifiant du projet ciblé.
 * @param projectName Nom du projet (optionnel) — sert à nommer le fichier téléchargé.
 * @throws Error si la génération serveur échoue (l'appelant réactive le bouton).
 */
export async function exportProjectPdf(
  projectId: string,
  projectName?: string,
): Promise<void> {
  const res = await apiFetch(`/projects/${projectId}/export-pdf`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`export-pdf ${res.status}`);
  }

  // La réponse est un attachment application/pdf : on matérialise le buffer en
  // Blob puis on force le téléchargement via un <a download> éphémère.
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `gsi-rapport-${toFilenameSlug(projectName ?? projectId)}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    // Libère l'URL objet quel que soit le résultat (pas de fuite mémoire).
    URL.revokeObjectURL(objectUrl);
  }
}
