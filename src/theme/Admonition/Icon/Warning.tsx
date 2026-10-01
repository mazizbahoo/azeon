import React, { type ComponentProps } from 'react';
import { TriangleAlert } from 'lucide-react';

export default function AdmonitionIconWarning(props: ComponentProps<'svg'>) {
  return <TriangleAlert strokeWidth={1.75} aria-hidden="true" {...(props as object)} />;
}
