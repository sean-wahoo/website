"use client";
import { Suspense, ViewTransition } from "react";
import styles from "./fun.module.scss";
import tabsStyles from "../tabs.module.scss";
import { pageStoreAtom } from "@/stores/page";
import Image from "next/image";
import Link from "next/link";
import { useAtom } from "jotai";
interface ProjectProps {
  imgSrc: string;
  imgAlt: string;
  children: React.ReactNode;
}

const Project = (props: ProjectProps) => {
  return (
    <div data-project>
      <Image src={props.imgSrc} alt={props.imgAlt} width={240} height={135} />
      <main>{props.children}</main>
    </div>
  );
};

const FunPage = () => {
  const [pageStore] = useAtom(pageStoreAtom);
  return (
    <Suspense>
      <ViewTransition name="fun-page">
        <article
          id="fun-page"
          className={[
            styles.fun_page,
            pageStore === "/" ? tabsStyles.animate : tabsStyles.show,
          ].join(" ")}
        >
          <Project imgSrc="/images/dotfiles_img.png" imgAlt="dotfiles image">
            <h2>
              <Link href="https://github.com/sean-wahoo/dotfiles">
                dotfiles
              </Link>
            </h2>
            <span className={styles.desc}>
              this is my config for my current setup (arch btw)
            </span>
            <br />
            <small>this repo is basically my house where i live</small>
          </Project>
          <Project imgSrc="/images/twack_img.png" imgAlt="twack image">
            <h2>
              <Link href="https://github.com/sean-wahoo/twack">twack</Link>
            </h2>
            <span className={styles.desc}>
              the natural progression of an obsession with video games and
              coding.
            </span>
            <br />
            <small>
              something about crud apps and hooking up databases and apis and
              stuff just stratches my brain
            </small>
          </Project>
          <Project imgSrc="/images/blerg_img.png" imgAlt="blerg image">
            <h2>
              <Link href="https://github.com/sean-wahoo/blerg">blerg</Link>
            </h2>
            <h4>
              <Link href="https://blog.seanline.dev">visit!</Link>
            </h4>
            <span className={styles.desc}>
              cute little blog (blerg) because obviously i'd make one.
            </span>
            <br />
            <small>
              sometimes i say stuff here and sometimes it could be funny
            </small>
          </Project>
        </article>
      </ViewTransition>
    </Suspense>
  );
};

export default FunPage;
