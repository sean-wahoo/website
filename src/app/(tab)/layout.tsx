'use client'
import { NextPage } from "next/types";
import styles from './tab.module.scss'
import { usePathname } from "next/navigation";
import Block from "@/components/block";
import { useEffect, useLayoutEffect, unstable_ViewTransition as ViewTransition } from 'react'
import usePageStore from "@/stores/page";

const tabLayout: NextPage<React.PropsWithChildren> = ({ children }) => {
  const pathname = usePathname()
  const pageStore = usePageStore(state => state)
  const id = pathname.split('/')[1]
  let blockText = ''
  switch (id) {
    case 'pro':
      blockText = "professional stuff"
      break;
    case 'fun':
      blockText = "fun stuff"
      break;
  }

  useEffect(() => {
    const loadedPageElement = document.getElementById(`${id}-page`)
    if (loadedPageElement && pageStore.previousPage === '/') {
      loadedPageElement.classList.add(styles.animate)
    }
  })
  return (
    <section className={styles.tab_layout}>
      <Block
        text={blockText}
        id={id}
      />
      {children}
    </section>
  )
}

export default tabLayout;
