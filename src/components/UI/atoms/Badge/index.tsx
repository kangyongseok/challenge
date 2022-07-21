import { HTMLAttributes, PropsWithChildren } from 'react';

import { Flexbox } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

import { StyledBadge } from './Badge.styles';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  customStyle?: CustomStyle;
}

function Badge({ children, open, customStyle, ...props }: PropsWithChildren<BadgeProps>) {
  return (
    <Flexbox customStyle={{ position: 'relative' }} {...props}>
      {children}
      {open && <StyledBadge css={customStyle} />}
    </Flexbox>
  );
}

export default Badge;
