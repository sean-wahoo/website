"use client";
import { NextPage } from "next/types";
import Markdown from "@/mdx/pro.mdx";
import styles from "./pro.module.scss";

const ProPage: NextPage = () => {
  return (
    <article
      id="pro-page"
      className={styles.pro_page}
      style={{ viewTransitionName: "pro-page" }}
    >
      <Markdown />
    </article>
  );
};

export default ProPage;
