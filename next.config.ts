import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ["ts", "tsx", "md", "mdx", "js", "jsx"],
  cacheComponents: true,
  experimental: {
    viewTransition: true,
    mdxRs: true,
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
