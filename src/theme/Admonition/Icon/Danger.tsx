import React, { type ComponentProps } from 'react';
import { OctagonAlert } from 'lucide-react';

export default function AdmonitionIconDanger(props: ComponentProps<'svg'>) {
  return <OctagonAlert strokeWidth={2} aria-hidden="true" {...(props as object)} />;
}
