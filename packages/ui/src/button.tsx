'use client';

import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  appName?: string;
}

export const Button = ({ children, appName, ...props }: ButtonProps) => {
  return (
    <button {...props}>
      {children}
    </button>
  );
};
