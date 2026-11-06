import React, { type ComponentProps } from 'react';
import { WrapText } from 'lucide-react';

export default function IconWordWrap(props: ComponentProps<'svg'>) {
  return <WrapText strokeWidth={2} aria-hidden="true" {...(props as object)} />;
}
