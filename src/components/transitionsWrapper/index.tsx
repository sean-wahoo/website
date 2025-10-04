"use client"
import { ViewTransitions } from "next-view-transitions"

function TransitionsWrapper({ children }: React.PropsWithChildren) {
  return (
    <ViewTransitions>
      {children}
    </ViewTransitions>
  )
}

export default TransitionsWrapper
