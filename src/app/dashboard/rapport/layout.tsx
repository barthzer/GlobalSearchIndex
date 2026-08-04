import "./print.css";

export const metadata = {
  title: "Rapport client · Global Search Index",
};

export default function RapportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="report-root" data-theme="light">
      {children}
    </div>
  );
}
