import TransitionsWrapper from "@/components/transitionsWrapper";
import { NextPage } from "next";

const Template: NextPage<React.PropsWithChildren> = ({ children }) => {
  return <TransitionsWrapper>{children}</TransitionsWrapper>
}

export default Template;
