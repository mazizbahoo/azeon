import React, { type ComponentProps } from 'react';
import { Sun } from 'lucide-react';

export default function IconLightMode(props: ComponentProps<'svg'>) {
  return <Sun size={20} strokeWidth={1.75} aria-hidden="true" {...(props as object)} />;
}
