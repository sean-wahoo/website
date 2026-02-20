"use client";
import styles from "./home.module.scss";
import Block from "@/components/block";
import { ViewTransition } from "react";
import BackButton from "@/components/backButton/backButton";
import { usePathname } from "next/navigation";

const tabLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const pathname = usePathname();
  const id = pathname.split("/")[1];
  let text;
  switch (id) {
    case "pro":
      text = "professional stuff";
      break;
    case "fun":
      text = "fun stuff";
      break;
  }
  return (
    <section className={styles.tab_layout}>
      <ViewTransition>
        <header>
          <Block id={id} text={text} />
          <BackButton />
        </header>
        {children}
      </ViewTransition>
    </section>
  );
};

export default tabLayout;
