import React, { type ComponentProps } from 'react';
import { StickyNote } from 'lucide-react';

export default function AdmonitionIconNote(props: ComponentProps<'svg'>) {
  return <StickyNote strokeWidth={2} aria-hidden="true" {...(props as object)} />;
}
