import React, { type ReactNode } from 'react';
import Footer from '@theme-original/Footer';
import type FooterType from '@theme/Footer';
import type { WrapperProps } from '@docusaurus/types';
import { useLocation } from '@docusaurus/router';

type Props = WrapperProps<typeof FooterType>;

export default function FooterWrapper(props: Props): ReactNode {
  const { pathname } = useLocation();
  const hideFooter = pathname.includes('/p-vs-np') || pathname.includes('/blog');

  if (hideFooter) {
    return null;
  }

  return (
    <>
      <Footer {...props} />
    </>
  );
}
