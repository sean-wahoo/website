"use client";
import { useTransitionRouter } from "next-view-transitions";
import styles from "./backButton.module.scss";
import homeStyles from "@/app/(home)/home.module.scss";

const BackButton = () => {
  const router = useTransitionRouter();
  const onClick: React.MouseEventHandler = () => {
    router.push("/");
  };
  return (
    <button
      onClick={onClick}
      className={[styles.back_button, homeStyles.animate].join(" ")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
        />
      </svg>
    </button>
  );
};

export default BackButton;
