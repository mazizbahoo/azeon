import React, { type ComponentProps } from 'react';
import { Menu } from 'lucide-react';

export default function IconMenu({ width = 24, height = 24, ...props }: ComponentProps<'svg'>) {
  return <Menu width={width} height={height} strokeWidth={2} aria-hidden="true" {...(props as object)} />;
}
