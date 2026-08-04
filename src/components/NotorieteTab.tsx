"use client";

// Onglet Notoriété (admin). Rend le bloc câblé RealNotorieteInsights (mêmes
// composants que la version fusionnée dans l'Analyse — source unique).
import RealNotorieteInsights from "./RealNotorieteInsights";

export default function NotorieteTab({
  projectId,
  clientName,
}: {
  projectId: string;
  clientName: string;
}) {
  return <RealNotorieteInsights projectId={projectId} clientName={clientName} />;
}
