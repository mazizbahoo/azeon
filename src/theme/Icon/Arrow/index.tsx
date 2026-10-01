import React, { type ComponentProps } from 'react';
import { ChevronsRight } from 'lucide-react';

export default function IconArrow(props: ComponentProps<'svg'>) {
  return <ChevronsRight size={18} strokeWidth={1.75} aria-hidden="true" {...(props as object)} />;
}
