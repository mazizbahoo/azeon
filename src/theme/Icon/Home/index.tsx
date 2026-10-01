import React, { type ComponentProps } from 'react';
import { House } from 'lucide-react';

export default function IconHome(props: ComponentProps<'svg'>) {
  return <House strokeWidth={1.75} aria-hidden="true" {...(props as object)} />;
}
