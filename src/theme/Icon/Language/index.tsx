import React, { type ComponentProps } from 'react';
import { Languages } from 'lucide-react';

export default function IconLanguage({ width = 20, height = 20, ...props }: ComponentProps<'svg'>) {
  return <Languages width={width} height={height} strokeWidth={2} aria-hidden="true" {...(props as object)} />;
}
