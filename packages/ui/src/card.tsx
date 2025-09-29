'use client';

import { ReactNode } from "react";

interface CardProps {
  title: string;
  children: ReactNode;
}

export const Card = ({ title, children }: CardProps) => {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
};