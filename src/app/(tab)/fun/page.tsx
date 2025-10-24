"use client";
import { NextPage } from "next/types";
import Markdown from "@/mdx/fun.mdx";
import { Suspense, ViewTransition } from "react";
import styles from "./fun.module.scss";
import tabStyles from "../tab.module.scss";
import usePageStore from "@/stores/page";

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
          <Markdown />
        </Suspense>
      </article>
    </ViewTransition>
  );
};

export default FunPage;
