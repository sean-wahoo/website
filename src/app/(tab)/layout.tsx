"use client";
import styles from "./tab.module.scss";
import { usePathname } from "next/navigation";
import Block from "@/components/block";
import {
  MouseEventHandler,
  useEffect,
  useRef,
  unstable_ViewTransition as ViewTransition,
} from "react";
import usePageStore from "@/stores/page";
import { useTransitionRouter } from "next-view-transitions";

const tabLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const pageStore = usePageStore((state) => state);

  const router = useTransitionRouter();

  const id = pathname.split("/")[1];
  let blockText = "";
  switch (id) {
    case "pro":
      blockText = "professional stuff";
      break;
    case "fun":
      blockText = "fun stuff";
      break;
  }

  useEffect(() => {
    const loadedPageElement = document.getElementById(`${id}-page`);
    if (!loadedPageElement) return;
    if (pageStore.previousPage === "/") {
      loadedPageElement.style.opacity = "0";
      loadedPageElement.classList.add(styles.animate);
    } else {
      loadedPageElement.style.opacity = "1";
      loadedPageElement.classList.remove(styles.animate);
    }
  }, []);

  const backButton: () => React.ReactNode = () => {
    const onClick: MouseEventHandler = () => {
      router.push("/");
    };
    return (
      <button onClick={onClick} className={styles.back_button}>
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

  return (
    <section className={styles.tab_layout} ref={sectionRef}>
      <ViewTransition name="tab-page-content">
        <header>
          <Block text={blockText} id={id} />
          {backButton()}
        </header>
        {children}
      </ViewTransition>
    </section>
  );
};

export default tabLayout;
