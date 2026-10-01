import React, { type ComponentProps } from 'react';
import { Info } from 'lucide-react';

export default function AdmonitionIconInfo(props: ComponentProps<'svg'>) {
  return <Info strokeWidth={2} aria-hidden="true" {...(props as object)} />;
}
