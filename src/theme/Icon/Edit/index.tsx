import React, { type ComponentProps } from 'react';
import clsx from 'clsx';
import { SquarePen } from 'lucide-react';

export default function IconEdit({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <SquarePen
      size={16}
      strokeWidth={1.75}
      aria-hidden="true"
      className={clsx('az-icon-edit', className)}
      {...(props as object)}
    />
  );
}
