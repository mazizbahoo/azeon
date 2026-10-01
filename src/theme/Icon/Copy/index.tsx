import React, { type ComponentProps } from 'react';
import { Copy } from 'lucide-react';

export default function IconCopy(props: ComponentProps<'svg'>) {
  return <Copy strokeWidth={2} aria-hidden="true" {...(props as object)} />;
}
