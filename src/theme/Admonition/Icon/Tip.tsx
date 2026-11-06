import React, { type ComponentProps } from 'react';
import { Lightbulb } from 'lucide-react';

export default function AdmonitionIconTip(props: ComponentProps<'svg'>) {
  return <Lightbulb strokeWidth={2} aria-hidden="true" {...(props as object)} />;
}
