import type { FC, ReactNode } from "react";
import { HighlightPanel } from "./highlight-card";

export const PortalCard: FC<{
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  onClick?: () => void;
}> = ({ children, className, innerClassName, onClick }) => (
  <HighlightPanel variant="feature" className={className} innerClassName={innerClassName} onClick={onClick}>
    {children}
  </HighlightPanel>
);

export default PortalCard;
