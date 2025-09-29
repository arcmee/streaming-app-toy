'use client';

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // You can add any custom props here if needed
}

export const Input = ({ ...props }: InputProps) => {
  return <input {...props} />;
};
