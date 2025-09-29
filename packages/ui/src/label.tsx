'use client';

import { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  // You can add any custom props here if needed
}

export const Label = ({ ...props }: LabelProps) => {
  return <label {...props} />;
};
