"use client";
import { useAtom } from "jotai";
import styles from "./starsWrapper.module.scss";
import { starsToggleAtom } from "@/stores/page";
import { c } from "../lib/utils";
import { MouseEventHandler } from "react";
const StarsToggle = () => {
  const [showStars, setShowStars] = useAtom(starsToggleAtom);

  const toggleOnClick: MouseEventHandler = () => {
    setShowStars(!showStars);
  };

  return (
    <span className={styles.stars_toggle}>
      <input
        type="checkbox"
        id="starsToggle"
        onClick={toggleOnClick}
        name="starsToggle"
        className={showStars ? styles.stars_on : styles.stars_off}
      />
    </span>
  );
};

export default StarsToggle;
