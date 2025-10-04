import Image from "next/image";
import styles from "./page.module.scss";
import { unstable_ViewTransition as ViewTransition } from "react";
import Canvas from '@/components/three/canvas'
import Block from "@/components/block";
import { redirect } from "next/navigation";


const Home: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <ViewTransition>
      <section className={styles.button_section}>
        <Block
          text="professional stuff"
          id="pro"
          clickable={true}
          href="/pro"
        />
        <Block
          text="fun stuff"
          id="fun"
          clickable={true}
          href="/fun"
        />
      </section>
    </ViewTransition>
  );
}

export default Home;
