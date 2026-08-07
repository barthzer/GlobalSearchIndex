"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/components/AccountProvider";

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
    router.replace(isLoggedIn ? "/dashboard" : "/connexion-admin");
  }, [hydrated, isLoggedIn, router]);

  return null;
}
