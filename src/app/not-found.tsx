import { Suspense } from "react";
import styles from "./page.module.scss";
const NotFound = () => {
  return (
    <Suspense>
      <span className={styles.not_found}>
        <h2>uh no dude lol</h2>
      </span>
    </Suspense>
  );
};

export default NotFound;
