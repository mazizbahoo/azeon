import React, { type ComponentProps } from 'react';
import { Moon } from 'lucide-react';

export default function IconDarkMode(props: ComponentProps<'svg'>) {
  return <Moon size={20} strokeWidth={1.75} aria-hidden="true" {...(props as object)} />;
}
