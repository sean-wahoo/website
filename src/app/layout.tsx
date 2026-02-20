import type { Metadata } from "next";
import { Funnel_Sans, Funnel_Display } from "next/font/google";
import "@/styling/globals.scss";
import styles from "./page.module.scss";
import localFont from "next/font/local";
import { ViewTransitions } from "next-view-transitions";
import StarsWrapper from "@/components/starsWrapper";
import WebVitals from "@/components/lib/web-vitals";
import Socials from "@/components/socials/socials";
import { XMLParser } from "fast-xml-parser";
import { STAR_FIELDS } from "@/components/lib/utils";
import { Suspense } from "react";
import StarsToggle from "@/components/starsWrapper/starsToggle";
import { useAtom } from "jotai";
import { starsToggleAtom } from "@/stores/page";

const getStarData = async () => {
  "use cache";
  const center = {
    a: 12.4736017,
    d: 31.4771192,
  };
  const radius = 8;
  let colCounter = 0;
  const parser = new XMLParser({
    parseTagValue: true,
    processEntities: true,
    htmlEntities: true,
    tagValueProcessor(tagName, tagValue, jPath, hasAttributes, isLeafNode) {
      const indexesToProcess = Object.values(STAR_FIELDS).map((obj) => obj.col);
      if (jPath === "VOTABLE.RESOURCE.TABLE.DATA.TABLEDATA.TR.TD") {
        if (indexesToProcess.includes(colCounter++)) {
          return true;
        }
      }
    },
  });

  const url = new URL("https://simbad.cds.unistra.fr/simbad/sim-coo");
  url.searchParams.append("output.format", "VOTable");
  url.searchParams.append("output.max", "300");
  url.searchParams.append("obj.pmsel", "off");
  url.searchParams.append("obj.plxsel", "off");
  url.searchParams.append("obj.rvsel", "off");
  url.searchParams.append("obj.mtsel", "off");
  url.searchParams.append("obj.sizesel", "off");
  url.searchParams.append("obj.bibsel", "off");
  url.searchParams.append("list.bibsel", "off");
  url.searchParams.append("obj.messel", "off");

  const coordString = `${center.a} ${center.d}`;
  url.searchParams.append("Coord", coordString);
  url.searchParams.append("Radius", `${radius}`);
  url.searchParams.append("Radius.unit", "deg");
  url.searchParams.append("CooFrame", "ICRS");

  const rawResponse = await fetch(url, { cache: "force-cache" });
  const xmlString = await rawResponse.text();

  const parsePromise = new Promise((resolve) => {
    const parsedObj = parser.parse(xmlString);
    if (parsedObj) {
      resolve(parsedObj);
    }
  });
  return await parsePromise;
};

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

const iosevkaFont = localFont({
  src: "../../public/fonts/IosevkaNerdFont-Regular.ttf",
  display: "swap",
  variable: "--font-iosevka",
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
  const starData = getStarData(true);
  return (
    <ViewTransitions>
      <html lang="en">
        <body
          className={[
            funnelSans.variable,
            funnelDisplay.variable,
            iosevkaFont.variable,
          ].join(" ")}
        >
          <WebVitals />
          <Suspense>
            <StarsWrapper starData={starData} />
          </Suspense>
          <main className={[styles.layout, cozetteFont.className].join(" ")}>
            <StarsToggle />
            {children}
          </main>
          <footer className={styles.socials}>
            <Socials />
          </footer>
        </body>
      </html>
    </ViewTransitions>
  );
}
