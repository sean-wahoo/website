"use client";
import { unstable_ViewTransition as ViewTransition } from "react";
import styles from "./index.module.scss";
import { useEffect, useRef } from "react";
import { useTransitionRouter } from "next-view-transitions";
import usePageStore from "@/stores/page";

const Block: React.FC<{
  text: string;
  id: string;
  clickable?: Boolean;
  href?: string;
}> = ({ text, id, clickable, href }) => {
  const router = useTransitionRouter();
  const blockRef = useRef<HTMLSpanElement>(null);
  const outlineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const page = id?.split("-")[0] ?? "";
    router.prefetch(page);

    if (blockRef.current) {
      const block = blockRef.current as HTMLSpanElement;

      if (clickable) {
        block.classList.add(styles.clickable);
        const outline = outlineRef.current as HTMLSpanElement;

        if (outline) {
          outline.style.animationName = "";

          const root = document.querySelector(":root") as HTMLElement;
          let blockPos = block.getBoundingClientRect();

          const blockClickOffset = 48;

          root.style.setProperty("--outline-offset", "48px");
          root.style.setProperty("--block-width", blockPos.width + "px");
          root.style.setProperty("--block-height", blockPos.height + "px");
          root.style.setProperty("--block-top", blockPos.y + "px");
          root.style.setProperty("--block-left", blockPos.x + "px");

          block.addEventListener("mouseup", () => {
            outline.classList.add("animate");
            blockPos = block.getBoundingClientRect();

            root.style.setProperty(
              "--outline-to-width",
              blockPos.width + blockClickOffset + "px",
            );
            root.style.setProperty(
              "--outline-to-height",
              blockPos.height + blockClickOffset + "px",
            );
            root.style.setProperty(
              "--outline-to-top",
              blockPos.top - blockClickOffset / 2 + "px",
            );
            root.style.setProperty(
              "--outline-to-left",
              blockPos.left - blockClickOffset / 2 + "px",
            );
          });
        }
      }
    }
  });
  const pageStore = usePageStore((state) => state);

  const onClick: React.MouseEventHandler = () => {
    if (clickable && href) {
      pageStore.setPreviousPage("/");
      router.push(href);
    }
  };
  return (
    <>
      <ViewTransition name={id}>
        <span
          style={{ viewTransitionName: id }}
          id={id}
          className={styles.block}
          onClick={onClick}
          ref={blockRef}
        >
          <h3>{text}</h3>
        </span>
      </ViewTransition>
    </>
  );
};

export default Block;
