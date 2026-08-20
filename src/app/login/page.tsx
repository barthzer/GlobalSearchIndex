"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/components/AccountProvider";
import { getProspectSession } from "@/lib/api";

/**
 * Point d'entrée de reconnexion interne (commercial + admin).
 *
 * La connexion par identifiants (email + mot de passe) vit désormais sur la route
 * dédiée /connexion-admin (alignement maquette Barth : la porte staff ne parasite
 * plus la modale prospect). Cette page ne rend plus de formulaire : elle redirige.
 *   - session déjà active → /dashboard (on attend l'hydratation du storage) ;
 *   - sinon → /connexion-admin (email + mot de passe, auth réelle POST /auth/login).
 *
 * Le prospect, lui, revient par la « Connexion » de la landing (modale OTP), jamais
 * par /login (réservé au staff).
 */
export default function LoginPage() {
  const { isLoggedIn, hydrated } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (isLoggedIn) {
      router.replace("/dashboard");
      return;
    }
    // Défense en profondeur (retour Alexis 2026-08-20) : un porteur de session
    // prospect NE DOIT JAMAIS atterrir sur la porte admin. On le renvoie au funnel.
    if (getProspectSession()) {
      router.replace("/");
      return;
    }
    router.replace("/connexion-admin");
  }, [hydrated, isLoggedIn, router]);

  return null;
}
