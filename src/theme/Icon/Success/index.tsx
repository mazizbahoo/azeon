import React, { type ComponentProps } from 'react';
import { Check } from 'lucide-react';

export default function IconSuccess(props: ComponentProps<'svg'>) {
  return <Check strokeWidth={2} aria-hidden="true" {...(props as object)} />;
}
