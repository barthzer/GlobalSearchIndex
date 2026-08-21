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
    if (isLoggedIn) {
      router.replace("/dashboard");
      return;
    }
    // Non connecté → formulaire de login staff (/connexion-admin), TOUJOURS.
    //
    // ⚠️ RÉGRESSION 2026-08-21 CORRIGÉE : la version précédente gardait cette route
    // derrière `hasStaffSession()` (« /connexion-admin seulement si session staff »),
    // créant un chicken-and-egg : pour se CONNECTER (donc sans session) on était renvoyé
    // au funnel → la porte admin devenait inatteignable (Kevin bloqué hors admin ; et le
    // retour post-reset-password cassé). L'anti-leak prospect ne vit PAS ici : /login
    // n'est JAMAIS une cible de redirection auto pour un prospect (les gardes /dashboard
    // et /admin envoient les sessions non-staff vers « / »). /login est le point d'entrée
    // EXPLICITE du staff ; il doit donc toujours mener au formulaire de login.
    router.replace("/connexion-admin");
  }, [hydrated, isLoggedIn, router]);

  return null;
}
