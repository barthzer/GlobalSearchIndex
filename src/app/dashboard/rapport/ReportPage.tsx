import type { ReactNode } from "react";

interface ReportPageProps {
  children: ReactNode;
  pageNumber?: number;
  totalPages?: number;
  id?: string;
}

export default function ReportPage({ children, pageNumber, totalPages = 5, id }: ReportPageProps) {
  return (
    <section className="report-page" id={id}>
      <div className="report-page-inner">{children}</div>
      {pageNumber !== undefined && (
        <span className="report-page-number">
          {String(pageNumber).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
        </span>
      )}
    </section>
  );
}
