'use client'
import { NextPage } from "next/types"
import { unstable_ViewTransition as ViewTransition } from "react"
import Markdown from "@/mdx/pro.mdx"
import styles from './pro.module.scss'

const ProPage: NextPage = () => {
  return (
    <ViewTransition>
      <article id="pro-page" className={styles.pro_page} style={{ viewTransitionName: "pro-page" }}>
        {/* <div className={styles.pro_markdown}> */}
        <Markdown />
        {/* </div> */}
        {/* <div> */}
        <span>other stuff</span>

        {/* </div> */}
      </article>
    </ViewTransition>
  )
}

export default ProPage
