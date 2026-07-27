"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";
import { useAccount } from "@/components/AccountProvider";

// Route interne de connexion : ouvre directement la vue email + mot de passe.
// Point d'entrée de l'application interne (le funnel public reste sur la racine).
export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, hydrated } = useAccount();

  useEffect(() => {
    if (hydrated && isLoggedIn) router.replace("/dashboard");
  }, [hydrated, isLoggedIn, router]);

  return <LoginModal initialView="admin" onClose={() => router.push("/")} />;
}
