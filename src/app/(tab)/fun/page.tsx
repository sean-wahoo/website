"use client";
import { NextPage } from "next/types";
import Markdown from "@/mdx/fun.mdx";

const FunPage: NextPage = () => {
  return (
    <article id="fun-page" style={{ viewTransitionName: "fun-page" }}>
      <Markdown />
    </article>
  );
};

export default FunPage;
