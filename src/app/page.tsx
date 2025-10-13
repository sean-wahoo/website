import styles from "./page.module.scss";
import { unstable_ViewTransition as ViewTransition } from "react";
import Block from "@/components/block";
import { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <ViewTransition>
      <section className={styles.button_section}>
        <Block
          text="professional stuff"
          id="pro"
          clickable={true}
          href="/pro"
        />
        <Block text="fun stuff" id="fun" clickable={true} href="/fun" />
      </section>
    </ViewTransition>
  );
};

export default Home;
