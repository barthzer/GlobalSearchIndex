import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Politique de confidentialité · GlobalSearchIndex",
  description:
    "Comment AWI collecte, utilise et protège vos données personnelles dans le cadre de GlobalSearchIndex.",
};

export default function ConfidentialitePage() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      updated="17 juin 2026"
      intro="La présente politique décrit comment AWI traite les données personnelles collectées via GlobalSearchIndex (le « Service »), conformément au Règlement général sur la protection des données (RGPD)."
    >
      <section>
        <h2>1. Responsable du traitement</h2>
        <p>
          Le responsable du traitement est L&apos;AGENCE WEB.COM (marque AWI),
          SAS au capital de 12 000 €, dont le siège social est situé 38 rue
          Victor Hugo, 92400 Courbevoie, immatriculée au RCS de Nanterre sous le
          numéro 799 216 320. Elle est joignable à l&apos;adresse{" "}
          <a href="mailto:contact@awi.fr">contact@awi.fr</a>. Pour toute question
          relative à vos données, vous pouvez contacter notre référent à cette
          même adresse.
        </p>
      </section>

      <section>
        <h2>2. Données collectées</h2>
        <p>Dans le cadre du Service, nous sommes susceptibles de collecter :</p>
        <ul>
          <li>les informations que vous renseignez (nom, prénom, e-mail professionnel, entreprise, téléphone) ;</li>
          <li>l&apos;URL et les données publiques du site que vous soumettez à l&apos;analyse ;</li>
          <li>les données d&apos;usage du Service (pages consultées, actions, journaux techniques) ;</li>
          <li>les données de mesure d&apos;audience déposées par nos outils analytics.</li>
        </ul>
      </section>

      <section>
        <h2>3. Finalités et bases légales</h2>
        <p>Vos données sont traitées pour :</p>
        <ul>
          <li>fournir l&apos;audit et les recommandations demandés (exécution du contrat) ;</li>
          <li>vous recontacter au sujet de votre diagnostic (intérêt légitime / consentement) ;</li>
          <li>améliorer et sécuriser le Service (intérêt légitime) ;</li>
          <li>respecter nos obligations légales et réglementaires.</li>
        </ul>
      </section>

      <section>
        <h2>4. Destinataires et sous-traitants</h2>
        <p>
          Vos données sont accessibles aux équipes d&apos;AWI habilitées et à nos
          sous-traitants techniques (hébergement, e-mail, analytics, fournisseurs
          de données SEO). Ils n&apos;interviennent que sur instruction et dans le
          cadre du Service. La liste détaillée est à compléter selon les
          intégrations réellement déployées.
        </p>
      </section>

      <section>
        <h2>5. Durée de conservation</h2>
        <p>
          Les données sont conservées le temps nécessaire aux finalités
          ci-dessus, puis archivées ou supprimées conformément aux délais légaux
          applicables. Les données de prospection sont conservées au maximum trois
          ans à compter du dernier contact.
        </p>
      </section>

      <section>
        <h2>6. Vos droits</h2>
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification,
          d&apos;effacement, de limitation, d&apos;opposition et de portabilité de
          vos données, ainsi que du droit de définir des directives relatives à
          leur sort après votre décès. Vous pouvez les exercer à{" "}
          <a href="mailto:contact@awi.fr">contact@awi.fr</a>. Vous pouvez
          également introduire une réclamation auprès de la CNIL.
        </p>
      </section>

      <section>
        <h2>7. Cookies</h2>
        <p>
          Le Service utilise des cookies et traceurs de mesure d&apos;audience et
          de fonctionnement. Vous pouvez paramétrer votre consentement à tout
          moment. Le détail des cookies déposés est à compléter selon les outils
          intégrés.
        </p>
      </section>

      <section>
        <h2>8. Modifications</h2>
        <p>
          Cette politique peut être mise à jour. La version applicable est celle
          publiée sur cette page à la date de votre consultation.
        </p>
      </section>
    </LegalLayout>
  );
}
