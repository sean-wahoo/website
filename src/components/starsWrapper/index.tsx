"use client";

import { CSSProperties, use, useEffect, useState } from "react";
import styles from "./starsWrapper.module.scss";
import {
  debounce,
  parseVOTableData,
  STAR_COLORS,
  TableInterface,
} from "../lib/utils";
import { starsToggleAtom } from "@/stores/page";
import { useAtom } from "jotai";

const StarsWrapper: React.FC<
  React.HTMLProps<HTMLSpanElement> & {
    starData: Promise<unknown>;
  }
> = ({ starData }) => {
  const [width, setWidth] = useState<number>(-1);
  const [height, setHeight] = useState<number>(-1);
  const [stars, setStars] = useState<React.ReactNode[]>([]);

  const data = use(starData);

  const [showStars] = useAtom(starsToggleAtom);

  useEffect(() => {
    if (showStars === false) {
      return;
    }
    if (typeof window !== "undefined") {
      if (width === -1 || height === -1) {
        setWidth(window.visualViewport!.width);
        setHeight(window.visualViewport!.height);
      }

      const resizeDebounce = debounce(() => {
        setWidth(window.visualViewport!.width);
        setHeight(window.visualViewport!.height);
      }, 500);
      window.addEventListener("resize", resizeDebounce);

      return () => window.removeEventListener("resize", resizeDebounce);
    }
  }, [showStars]);

  useEffect(() => {
    if (showStars === false) {
      setStars([]);
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
      const starX = star.x;
      const starY = star.y;

      const tooltipStyleObj: CSSProperties = {
        top: starY - 24 + "px",
      };

      const starEl = (
        <>
          <span
            className={styles.star_tooltip}
            data-parent-star-name={star.objectName}
            style={tooltipStyleObj}
          >
            <p>{star.objectName}</p>
            <small>{star.objectType}</small>
          </span>
          <span
            className={[styles.star, animate ? styles.animate : ""].join(" ")}
            data-object-name={star.objectName}
            onMouseEnter={(e) => {
              const tooltip = e.currentTarget
                .previousElementSibling as HTMLSpanElement;
              if (tooltip) {
                tooltip.classList.add(styles.active);
                const tooltipBound = tooltip.getBoundingClientRect();
                if (window.visualViewport!.width / 2 < starX) {
                  tooltip.style.left = starX - 24 - tooltipBound.width + "px";
                } else {
                  tooltip.style.left = starX + 24 + "px";
                }
              }
            }}
            onMouseLeave={(e) => {
              const tooltip = e.currentTarget
                .previousElementSibling as HTMLSpanElement;
              if (tooltip) {
                tooltip.classList.remove(styles.active);
              }
            }}
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
  }, [width, height, showStars]);

  return (
    <span className={styles.stars_wrapper}>
      <div className={styles.stars}>{...stars}</div>
    </span>
  );
};

export default StarsWrapper;
