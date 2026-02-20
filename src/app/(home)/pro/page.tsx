"use client";
import { NextPage } from "next/types";
import Markdown from "@/mdx/pro.mdx";
import styles from "./pro.module.scss";
import homeStyles from "../home.module.scss";
import { ViewTransition } from "react";
import { pageStoreAtom } from "@/stores/page";
import Canvas from "@/components/three/canvas";
import Link from "next/link";
import { useAtom } from "jotai";

const ProPage: NextPage = () => {
  const [pageStore, setPageStore] = useAtom(pageStoreAtom);
  return (
    <ViewTransition name="pro-page">
      <article
        id="pro-page"
        className={[
          styles.pro_page,
          pageStore === "/" ? homeStyles.animate : homeStyles.show,
        ].join(" ")}
      >
        {/* <Markdown /> */}
        <>
          <h1>hello, i'm sean.</h1>
          <h2>i'm a developer and i really freaking like to code.</h2>
        </>
        <div>
          i've been obsessed with computers for years, getting my first little
          toshiba netbook around 2010. i started programming in high school and
          found a particular passion for web development.
        </div>

        <div className={styles.has_canvas}>
          <Canvas
            fileName="dood_no_sway.glb"
            order={0}
            sceneName="dood_at_desk"
          />
          <p>
            i specialize in node.js and frameworks like next.js and meteor with
            extensive experience in javascript/typescript, css/scss and, less
            obsessively, c++ and lua. i'm trying to always be learning
            something, and i've got my future sights on game development and
            embedded programming.
          </p>
        </div>
        <div className={styles.has_canvas}>
          <p>
            i live in a bunker 2000 miles under the ocean (my house) with this
            small orange thing (cat) named merlin. as merlin grows, so does his
            malicious intent. he may end up killing me and taking my place one
            day. there will be no way to tell.
          </p>
          <Canvas
            fileName="dood_petting_cat.glb"
            order={1}
            sceneName="dood_petting_cat"
          />
        </div>
        <div>
          <h3>
            want to see some of my cool stuff?{" "}
            <Link href="/fun">click this here link.</Link>
          </h3>
          <h3>
            want to contact me?{" "}
            <Link href="mailto:seaniscoding@proton.me">
              click this other link.
            </Link>
          </h3>
        </div>
      </article>
    </ViewTransition>
  );
};

export default ProPage;
