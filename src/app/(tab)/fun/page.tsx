import { NextPage } from "next/types"
import { unstable_ViewTransition as ViewTransition } from "react"

const FunPage: NextPage = () => {
  return (
    <ViewTransition>
      <article id="fun-page" style={{ viewTransitionName: "fun-page" }}>
        fun page
      </article>
    </ViewTransition>
  )
}

export default FunPage
