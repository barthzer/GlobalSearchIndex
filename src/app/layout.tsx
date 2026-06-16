import type { Metadata } from "next";
import { Outfit, Instrument_Serif, Manrope, Space_Grotesk } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import AccountProvider from "@/components/AccountProvider";
import CreditProvider from "@/components/CreditProvider";
import GenerationProvider from "@/components/GenerationProvider";
import "./globals.css";

const outfit = Outfit({
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
    icon: { url: "/faviconGSI.svg", type: "image/svg+xml" },
    shortcut: "/faviconGSI.svg",
    apple: "/faviconGSI.svg",
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
      data-theme="dark"
      className={`${outfit.variable} ${instrumentSerif.variable} ${manrope.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-[100dvh] antialiased">
        <ThemeProvider>
          <AccountProvider>
            <CreditProvider>
              <GenerationProvider>{children}</GenerationProvider>
            </CreditProvider>
          </AccountProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
