"use client";

import { useReportWebVitals } from "next/web-vitals";

const WebVitals = () => {
  useReportWebVitals((metric) => {
    // analytics eventually
  });
  return <></>;
};

export default WebVitals;
