import Link from "next/link";
import type { MDXComponents } from "mdx/types";
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return {
    ...components,
    a: ({ href = "", children, ...rest }) => {
      return (
        <Link {...rest} href={href}>
          {children}
        </Link>
      );
    },
  };
}
