import React, { type ComponentProps } from 'react';
import { Moon } from 'lucide-react';

export default function IconDarkMode(props: ComponentProps<'svg'>) {
  return <Moon size={20} strokeWidth={2} aria-hidden="true" {...(props as object)} />;
}
