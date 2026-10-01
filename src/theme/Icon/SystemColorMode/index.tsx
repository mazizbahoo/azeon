import React, { type ComponentProps } from 'react';
import { SunMoon } from 'lucide-react';

export default function IconSystemColorMode(props: ComponentProps<'svg'>) {
  return <SunMoon size={20} strokeWidth={1.75} aria-hidden="true" {...(props as object)} />;
}
