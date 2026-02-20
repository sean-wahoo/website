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
  async rewrites() {
    return [
      {
        source: "/blog",
        destination: `${process.env.BLOG_URL}/blog`,
      },
      {
        source: "/blog/:path+",
        destination: `${process.env.BLOG_URL}/blog/:path+`,
      },
      {
        source: "/blog-static/:path+",
        destination: `${process.env.BLOG_URL}/blog-static/:path+`,
      },
      {
        source: "/blog/images/:path*",
        destination: `${process.env.BLOG_URL}/blog/images/:path*`,
      },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
