"use client";

import { dehydrate, HydrationBoundary, useQuery } from "@tanstack/react-query";
import { XMLParser } from "fast-xml-parser";
import { useEffect, useState } from "react";
import styles from "./starsWrapper.module.scss";
import { getQueryClient } from "../providers";

const RADIUS = 32;
const tempStarsFunc = (
  rightAscension: number,
  declination: number,
  width?: number,
  height?: number,
) => {
  const raRadians = rightAscension * (Math.PI / 180);
  const dRadians = declination * (Math.PI / 180);
  const starPos = {
    a: raRadians,
    d: dRadians,
  };

  width ??= 2560;
  height ??= 1440;
  const centerPos = {
    a: 3.265,
    d: 0.549,
    x: width,
    y: height,
  };

  const degreesPerPixel = 0.00001;

  let deltaRa = (starPos.a - centerPos.a) * Math.cos(centerPos.d);
  let deltaDec = starPos.d - centerPos.d;

  const x = width / 2 - deltaRa / degreesPerPixel;
  const y = height / 2 + deltaDec / degreesPerPixel;
  const xPix = x;
  const yPix = y;
  return { xPix, yPix };
};
const STAR_COLORS = {
  M: {
    color: "red",
  },
  K: {
    color: "coral",
  },
  G: {
    color: "white",
  },
  F: {
    color: "white",
  },
  A: {
    color: "#27e7f5",
  },
  B: {
    color: "#27e7f5",
  },
  O: {
    color: "blue",
  },
};

const STAR_FIELDS = {
  objectName: {
    id: "MAIN_ID",
    col: 3,
  },
  objectType: {
    id: "OTYPE_S",
    col: 4,
  },
  visualBlue: {
    id: "FLUX_B",
    col: 35,
  },
  visualRed: {
    id: "FLUX_R",
    col: 62,
  },
  visualGreen: {
    id: "FLUX_V",
    col: 44,
  },
  rightAscension: {
    id: "RA_d",
    col: 5,
  },
  declination: {
    id: "DEC_d",
    col: 6,
  },
  spectralType: {
    id: "SP_TYPE",
    col: 22,
  },
};

interface TableInterface {
  [key: string]: any;
}
const parseVOTableData = (
  table: TableInterface,
  width: number,
  height: number,
) => {
  if (!table) return;
  const rawRows = table.VOTABLE.RESOURCE.TABLE.DATA.TABLEDATA.TR;

  const finalArr = [];
  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    let starEntry: any = {};
    for (const [key, field] of Object.entries(STAR_FIELDS)) {
      const value = row.TD[field.col];
      starEntry[key] = value;
    }
    const convertedCoordinates = tempStarsFunc(
      starEntry.rightAscension,
      starEntry.declination,
      width,
      height,
    );
    starEntry.x = convertedCoordinates.xPix;
    starEntry.y = convertedCoordinates.yPix;
    finalArr.push(starEntry);
  }
  return finalArr;
};

const StarsWrapper: React.FC<React.HTMLProps<HTMLSpanElement>> = (props) => {
  const [width, setWidth] = useState<number>(-1);
  const [height, setHeight] = useState<number>(-1);
  const [stars, setStars] = useState<React.ReactNode[]>([]);
  const q = {
    a: {
      h: 12,
      m: 28,
      s: 24.9,
    },
    d: {
      p: "+",
      d: 31,
      m: 28,
      s: 38,
    },
  };

  const url = new URL("https://simbad.cds.unistra.fr/simbad/sim-coo");
  url.searchParams.append("output.format", "VOTable");
  url.searchParams.append("output.max", "500");
  url.searchParams.append("obj.pmsel", "off");
  url.searchParams.append("obj.plxsel", "off");
  url.searchParams.append("obj.rvsel", "off");
  url.searchParams.append("obj.mtsel", "off");
  url.searchParams.append("obj.sizesel", "off");
  url.searchParams.append("obj.bibsel", "off");
  url.searchParams.append("list.bibsel", "off");
  url.searchParams.append("obj.messel", "off");

  // shut up
  const coordString = `${q.a.h}h${q.a.m}m${q.a.s}s ${q.d.p}${q.d.d}d${q.d.m}m${q.d.s}s`;
  url.searchParams.append("Coord", coordString);
  url.searchParams.append("Radius", `${RADIUS}`);
  url.searchParams.append("Radius.unit", "arcmin");
  url.searchParams.append("CooFrame", "ICRS");
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
  const { error, data, isSuccess } = useQuery({
    queryKey: ["starsQuery"],
    queryFn: async () => {
      const rawResponse = await fetch(url, { cache: "force-cache" });
      const xmlString = await rawResponse.text();

      const parsePromise = new Promise((resolve) => {
        const parsedObj = parser.parse(xmlString);
        if (parsedObj) {
          resolve(parsedObj);
        }
      });
      return await parsePromise;
    },
  });

  if (error) {
    return <>error!</>;
  }

  const queryClient = getQueryClient();

  const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
    func: F,
    time: number,
  ) => {
    let timeout: NodeJS.Timeout;

    console.log("trying to debounce!");

    const debounced = (...args: Parameters<F>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), time);
    };
    return debounced;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (width === -1 || height === -1) {
        setWidth(window.visualViewport!.width);
        setHeight(window.visualViewport!.height);
      }
      window.addEventListener(
        "resize",
        debounce(() => {
          console.log("through here");
          setWidth(window.visualViewport!.width);
          setHeight(window.visualViewport!.height);
        }, 500),
      );
    }
  }, []);

  useEffect(() => {
    if (!isSuccess) {
      return;
    }
    const parsedStarResponse = parseVOTableData(
      data as TableInterface,
      height,
      width,
    );
    let starsToSet = [];
    let i = 0;

    for (const star of parsedStarResponse ?? []) {
      const animate = Math.random() > 0.5;
      let backgroundColor = "white";
      if (star.spectralType) {
        for (const [c, { color }] of Object.entries(STAR_COLORS)) {
          if (star.spectralType.startsWith(c)) {
            backgroundColor = color;
          }
        }
      }

      if (backgroundColor === "white") {
        if (star.objectType !== "Star") {
          backgroundColor = Math.random() > 0.7 ? "#FFBAE7" : "#27e7f5";
        }
      }

      let starWidth = "3px";
      let starHeight = "3px";
      if (star.objectType.includes("azar") || star.objectType.startsWith("G")) {
        starWidth = "4px";
        starHeight = "4px";
      }
      const starX = star.x + width / 4;
      const starY = star.y - height / 2;

      const starEl = (
        <>
          <span
            className={styles.star_tooltip}
            data-parent-star-name={star.objectName}
            style={{
              top: starY - 24 + "px",
              left: starX + 24 + "px",
            }}
          >
            <p>{star.objectName}</p>
            <small>{star.objectType}</small>
          </span>
          <span
            className={[styles.star, animate ? styles.animate : ""].join(" ")}
            data-object-name={star.objectName}
            style={{
              top: starY + "px",
              left: starX + "px",
              animationDelay: Math.random() * (++i * 0.3) + "s",
              backgroundColor: backgroundColor,
              width: starWidth,
              height: starHeight,
            }}
          />
        </>
      );
      starsToSet.push(starEl);
    }
    setStars(starsToSet);
  }, [isSuccess, width, height]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.querySelectorAll(`span.${styles.star}`).forEach((star) => {
        const parentStarName = (star as HTMLSpanElement).dataset.objectName;
        const tooltip = document.querySelector(
          `span[data-parent-star-name="${parentStarName}"]`,
        ) as HTMLElement;

        star.addEventListener("mouseover", (e) => {
          if (tooltip) {
            const tooltipBound = tooltip.getBoundingClientRect();
            if (tooltipBound.right >= window.innerWidth) {
              tooltip.style.left =
                tooltipBound.left - tooltipBound.width + 48 + "px";
            }
            tooltip.classList.add(styles.active);
          }
        });
        star.addEventListener("mouseout", (e) => {
          if (tooltip) {
            tooltip.classList.remove(styles.active);
          }
        });
      });
    }
  }, [stars]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <span className={styles.stars_wrapper}>
        <div className={styles.stars}>{...stars}</div>
      </span>
    </HydrationBoundary>
  );
};

export default StarsWrapper;
