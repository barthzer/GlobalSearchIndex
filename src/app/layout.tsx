import type { Metadata } from "next";
import { asset } from "@/lib/asset";
import { Hanken_Grotesk, Instrument_Serif, Manrope, Space_Grotesk } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import AccountProvider from "@/components/AccountProvider";
import CreditProvider from "@/components/CreditProvider";
import GenerationProvider from "@/components/GenerationProvider";
import ReportIssueWidget from "@/components/ReportIssueWidget";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: "italic",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GlobalSearchIndex by AWI",
  description: "Analysez et améliorez votre référencement global avec le Global Search Index.",
  icons: {
    icon: { url: asset("/faviconGSI.svg"), type: "image/svg+xml" },
    shortcut: asset("/faviconGSI.svg"),
    apple: asset("/faviconGSI.svg"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-theme="light"
      className={`${hankenGrotesk.variable} ${instrumentSerif.variable} ${manrope.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Pose la classe `js` avant le paint : les blocs [data-reveal] ne sont masqués
            que si le JS est actif (pas de flash, contenu visible pour crawlers/JS off). */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js');" }} />
      </head>
      <body className="min-h-[100dvh] antialiased">
        <ThemeProvider>
          <AccountProvider>
            <CreditProvider>
              <GenerationProvider>
                {children}
                {/* Widget de signalement — présent sur toutes les pages (dans les
                    providers pour lire l'email du compte via useAccount). */}
                <ReportIssueWidget />
              </GenerationProvider>
            </CreditProvider>
          </AccountProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
