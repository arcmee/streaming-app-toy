"use client";

import { ReactNode } from "react";

export function Code({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <code
      className={`ui-relative ui-rounded ui-bg-muted ui-px-[0.3rem] ui-py-[0.2rem] ui-font-mono ui-text-sm ${className}`}
    >
      {children}
    </code>
  );
}
