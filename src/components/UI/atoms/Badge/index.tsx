import type { HTMLAttributes, PropsWithChildren } from 'react';

import { Flexbox } from 'mrcamel-ui';
import type { BrandColor, CSSValue, CustomStyle } from 'mrcamel-ui';

import { StyledBadge } from './Badge.styles';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  brandColor?: Extract<BrandColor, 'primary' | 'red'>;
  position?: 'relative' | 'absolute';
  open: boolean;
  width?: CSSValue;
  height?: CSSValue;
  customStyle?: CustomStyle;
}

function Badge({
  children,
  position = 'relative',
  brandColor = 'primary',
  open,
  width = 6,
  height = 6,
  customStyle,
  ...props
}: PropsWithChildren<BadgeProps>) {
  if (position === 'absolute') {
    return open ? (
      <StyledBadge
        dataWidth={width}
        dataHeight={height}
        brandColor={brandColor}
        {...props}
        css={customStyle}
      />
    ) : null;
  }

  return (
    <Flexbox customStyle={{ position }} {...props}>
      {children}
      {open && (
        <StyledBadge
          dataWidth={width}
          dataHeight={height}
          brandColor={brandColor}
          css={customStyle}
        />
      )}
    </Flexbox>
  );
}

export default Badge;
