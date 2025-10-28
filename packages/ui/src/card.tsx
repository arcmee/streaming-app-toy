'use client';

import { ReactNode } from "react";
import styles from "./card.module.css";

interface CardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const Card = ({ title, children, className }: CardProps) => {
  return (
    <div className={`${styles.card} ${className || ''}`}>
      <h2 className={styles.title}>{title}</h2>
      <div>{children}</div>
    </div>
  );
};