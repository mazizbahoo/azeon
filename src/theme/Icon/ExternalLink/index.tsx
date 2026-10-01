import React from 'react';
import { translate } from '@docusaurus/Translate';
import { ArrowUpRight } from 'lucide-react';

export default function IconExternalLink({ width = 14, height = 14 }: { width?: number; height?: number }) {
  return (
    <ArrowUpRight
      width={width}
      height={height}
      strokeWidth={2}
      className="az-icon-external"
      aria-label={translate({
        id: 'theme.IconExternalLink.ariaLabel',
        message: '(opens in new tab)',
        description: 'The ARIA label for the external link icon',
      })}
    />
  );
}
