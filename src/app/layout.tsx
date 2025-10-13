import type { Metadata } from "next";
import { Funnel_Sans, Funnel_Display } from "next/font/google";
import "@/styling/globals.scss";
import styles from "./page.module.scss";
import localFont from "next/font/local";
import { ViewTransitions } from "next-view-transitions";
import StarsWrapper from "@/components/starsWrapper/starsWrapper";
import Providers from "@/components/providers";
import WebVitals from "@/components/utils/web-vitals";
import Socials from "@/components/socials/socials";

const funnelSans = Funnel_Sans({
  variable: "--font-funnel-sans",
  subsets: ["latin"],
});

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ["latin"],
});

const cozetteFont = localFont({
  src: "../../public/fonts/CozetteVector.ttf",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SEAN",
  description: "profesional devloper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <Providers>
        <html lang="en">
          <body
            className={[funnelSans.variable, funnelDisplay.variable].join(" ")}
          >
            <WebVitals />
            <StarsWrapper />
            <main className={[styles.layout, cozetteFont.className].join(" ")}>
              {children}
            </main>
            <footer className={styles.socials}>
              <Socials />
            </footer>
          </body>
        </html>
      </Providers>
    </ViewTransitions>
  );
}
