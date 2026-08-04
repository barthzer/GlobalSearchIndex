"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";
import { useAccount } from "@/components/AccountProvider";

/**
 * Point d'entrée de reconnexion interne (commercial + admin).
 *
 * Le dashboard fait `router.replace("/login")` dès qu'il détecte une session
 * absente ; cette page est donc la porte de rentrée. Elle rend la modale de
 * connexion en vue "admin" (email + mot de passe direct, cf. LoginModal ligne
 * 16-17) sur un fond de page centré, et redirige vers /dashboard sitôt la
 * session posée (on surveille `useAccount`).
 *
 * Toute la logique auth (POST /auth/login, tokens, refresh) vit dans lib/api +
 * AccountProvider : on la réutilise via LoginModal, on ne la duplique pas.
 */
export default function LoginPage() {
  const { isLoggedIn, hydrated } = useAccount();
  const router = useRouter();

  // Déjà connecté (ou reconnexion réussie via la modale) → dashboard. On attend
  // l'hydratation pour ne pas rediriger sur un état non encore restauré du storage.
  useEffect(() => {
    if (hydrated && isLoggedIn) router.replace("/dashboard");
  }, [hydrated, isLoggedIn, router]);

  // La modale gère elle-même son `onClose` (redirige vers /dashboard en interne
  // après un login réussi via `goToDashboard`). Ici, fermer = revenir à l'accueil,
  // pour ne jamais laisser l'utilisateur sur une page vide sans échappatoire.
  function handleClose() {
    router.push("/");
  }

  // Session déjà active : on n'affiche pas le formulaire, l'effet redirige.
  if (hydrated && isLoggedIn) return null;

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-bg-primary px-4">
      <LoginModal onClose={handleClose} initialView="admin" />
    </main>
  );
}
