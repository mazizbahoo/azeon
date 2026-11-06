import React, { type ComponentProps } from 'react';
import { X } from 'lucide-react';

type Props = ComponentProps<'svg'> & { strokeWidth?: number };

export default function IconClose({ width = 20, height = 20, color = 'currentColor', strokeWidth, ...props }: Props) {
  return <X width={width} height={height} color={color} strokeWidth={2} aria-hidden="true" {...(props as object)} />;
}
