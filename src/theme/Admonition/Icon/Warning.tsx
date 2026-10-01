import React, { type ComponentProps } from 'react';
import { TriangleAlert } from 'lucide-react';

export default function AdmonitionIconWarning(props: ComponentProps<'svg'>) {
  return <TriangleAlert strokeWidth={2} aria-hidden="true" {...(props as object)} />;
}
