import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Conditions d'utilisation · GlobalSearchIndex",
  description:
    "Conditions générales d'utilisation du service GlobalSearchIndex édité par AWI.",
};

export default function ConditionsPage() {
  return (
    <LegalLayout
      title="Conditions d'utilisation"
      updated="17 juin 2026"
      intro="Les présentes conditions générales d'utilisation (« CGU ») encadrent l'accès et l'usage de GlobalSearchIndex (le « Service »), édité par AWI. En utilisant le Service, vous acceptez ces conditions."
    >
      <section>
        <h2>1. Objet</h2>
        <p>
          GlobalSearchIndex fournit un audit de visibilité SEO et GEO (présence
          dans les moteurs de recherche et les IA génératives) ainsi que des
          recommandations associées, à partir d&apos;une URL soumise par
          l&apos;utilisateur.
        </p>
      </section>

      <section>
        <h2>2. Accès au Service</h2>
        <p>
          Le Service est accessible gratuitement dans la limite des quotas
          indiqués (par exemple une analyse par mois). AWI peut faire évoluer ces
          quotas, suspendre ou interrompre le Service pour maintenance ou pour des
          raisons de sécurité, sans que sa responsabilité puisse être engagée.
        </p>
      </section>

      <section>
        <h2>3. Compte et exactitude des informations</h2>
        <p>
          Vous vous engagez à fournir des informations exactes lors de la création
          de votre compte et à ne soumettre que des URL pour lesquelles vous êtes
          autorisé à demander une analyse. Vous êtes responsable de la
          confidentialité de vos accès.
        </p>
      </section>

      <section>
        <h2>4. Nature des résultats</h2>
        <p>
          Les scores, estimations et recommandations sont fournis à titre
          indicatif, sur la base de données tierces et de modèles d&apos;analyse.
          Ils ne constituent pas une garantie de résultat ni un conseil
          contractuel. Toute décision prise sur leur fondement relève de votre
          seule responsabilité.
        </p>
      </section>

      <section>
        <h2>5. Propriété intellectuelle</h2>
        <p>
          Le Service, sa marque, son interface et ses contenus sont la propriété
          d&apos;AWI. Les rapports générés vous sont destinés pour votre usage
          interne ; toute reproduction ou diffusion publique requiert
          l&apos;accord préalable d&apos;AWI.
        </p>
      </section>

      <section>
        <h2>6. Responsabilité</h2>
        <p>
          AWI met en œuvre les moyens raisonnables pour assurer la disponibilité
          et la fiabilité du Service, sans obligation de résultat. AWI ne saurait
          être tenue responsable des dommages indirects ni de l&apos;usage fait
          des résultats par l&apos;utilisateur.
        </p>
      </section>

      <section>
        <h2>7. Données personnelles</h2>
        <p>
          Le traitement de vos données personnelles est décrit dans notre{" "}
          <a href="/confidentialite">politique de confidentialité</a>.
        </p>
      </section>

      <section>
        <h2>8. Droit applicable</h2>
        <p>
          Les présentes CGU sont soumises au droit français. À défaut de
          résolution amiable, tout litige relèvera des tribunaux compétents.
        </p>
      </section>
    </LegalLayout>
  );
}
