"use client";
import { NextPage } from "next/types";
import Markdown from "@/mdx/fun.mdx";
import { ComponentProps, Suspense, ViewTransition } from "react";
import styles from "./fun.module.scss";
import tabStyles from "../tab.module.scss";
import usePageStore from "@/stores/page";
import Image from "next/image";
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

const CustomAnchor = ({ children, ...props }: ComponentProps<"a">) => {
  return (
    <a {...props} target="_blank">
      {children}
    </a>
  );
};

const FunPage: NextPage = () => {
  const pageStore = usePageStore();
  return (
    <ViewTransition name="fun-page">
      <article
        id="fun-page"
        className={[
          styles.pro_page,
          pageStore.previousPage === "/" ? tabStyles.animate : tabStyles.show,
        ].join(" ")}
      >
        <Suspense>
          <Markdown components={{ Project, a: CustomAnchor }} />
        </Suspense>
      </article>
    </ViewTransition>
  );
};

export default FunPage;
