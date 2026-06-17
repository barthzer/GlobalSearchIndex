import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Mentions légales · GlobalSearchIndex",
  description:
    "Mentions légales du service GlobalSearchIndex édité par AWI : éditeur, hébergeur et propriété intellectuelle.",
};

export default function MentionsLegalesPage() {
  return (
    <LegalLayout
      title="Mentions légales"
      updated="17 juin 2026"
      intro="Informations relatives à l'éditeur et à l'hébergeur de GlobalSearchIndex, conformément à la loi pour la confiance dans l'économie numérique (LCEN)."
    >
      <section>
        <h2>1. Éditeur du site</h2>
        <p>
          Le service GlobalSearchIndex (marque AWI) est édité par L&apos;AGENCE
          WEB.COM, société par actions simplifiée (SAS) au capital de 12 000 €,
          immatriculée au RCS de Nanterre sous le numéro 799 216 320, dont le
          siège social est situé 38 rue Victor Hugo, 92400 Courbevoie.
        </p>
        <ul>
          <li>SIRET (siège) : 799 216 320 00041</li>
          <li>Numéro de TVA intracommunautaire : FR62 799 216 320</li>
          <li>Code APE/NAF : 58.14Z (Édition de revues et périodiques)</li>
          <li>Téléphone : 01 73 03 20 47</li>
          <li>E-mail : contact@awi.fr</li>
          <li>Directeur de la publication : Nourdine Selmi</li>
        </ul>
      </section>

      {/*
        TODO DEV — OBLIGATOIRE AVANT MISE EN LIGNE :
        Renseigner l'hébergeur réel du site (mention légale obligatoire, LCEN).
        Remplacer les 3 placeholders ci-dessous par : nom/raison sociale,
        adresse du siège et téléphone de l'hébergeur (ex. Vercel, OVH, Scaleway…).
      */}
      <section>
        <h2>2. Hébergeur</h2>
        <p>
          Le site est hébergé par [nom de l&apos;hébergeur], [forme juridique],
          dont le siège est situé [adresse de l&apos;hébergeur]. Téléphone :
          [téléphone de l&apos;hébergeur].
        </p>
      </section>

      <section>
        <h2>3. Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble des éléments du site (marque, logo, interface, textes,
          visuels, structure) est protégé par le droit de la propriété
          intellectuelle et demeure la propriété exclusive d&apos;AWI, sauf
          mention contraire. Toute reproduction ou représentation, totale ou
          partielle, sans autorisation préalable est interdite.
        </p>
      </section>

      <section>
        <h2>4. Données personnelles</h2>
        <p>
          Les modalités de traitement de vos données personnelles sont détaillées
          dans notre{" "}
          <a href="/confidentialite">politique de confidentialité</a>.
        </p>
      </section>

      <section>
        <h2>5. Cookies</h2>
        <p>
          L&apos;utilisation des cookies et traceurs est décrite dans la{" "}
          <a href="/confidentialite">politique de confidentialité</a>. Vous pouvez
          paramétrer votre consentement à tout moment.
        </p>
      </section>

      <section>
        <h2>6. Contact</h2>
        <p>
          Pour toute question relative au site ou à ces mentions, vous pouvez nous
          écrire à <a href="mailto:contact@awi.fr">contact@awi.fr</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
