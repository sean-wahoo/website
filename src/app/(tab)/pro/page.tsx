"use client";
import { NextPage } from "next/types";
import Markdown from "@/mdx/pro.mdx";
import styles from "./pro.module.scss";
import tabStyles from "../tab.module.scss";
import { ViewTransition } from "react";
import usePageStore from "@/stores/page";

const ProPage: NextPage = () => {
  const pageStore = usePageStore();
  return (
    <ViewTransition name="pro-page">
      <article
        id="pro-page"
        className={[
          styles.pro_page,
          pageStore.previousPage === "/" ? tabStyles.animate : tabStyles.show,
        ].join(" ")}
      >
        <Markdown />
      </article>
    </ViewTransition>
  );
};

export default ProPage;
