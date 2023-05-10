import type { HTMLAttributes, PropsWithChildren } from 'react';

import { Flexbox } from '@mrcamelhub/camel-ui';
import type { BrandColor, CSSValue, CustomStyle } from '@mrcamelhub/camel-ui';

import { StyledBadge } from './Badge.styles';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'contained' | 'two-tone';
  brandColor?: Extract<BrandColor, 'primary' | 'red'>;
  type?: 'wrapper' | 'alone';
  open: boolean;
  width?: CSSValue | 'auto';
  height?: CSSValue | 'auto';
  text?: string | number;
  customStyle?: CustomStyle;
}

function Badge({
  children,
  variant = 'contained',
  type = 'wrapper',
  brandColor = 'primary',
  open,
  width = 6,
  height = 6,
  text,
  customStyle,
  ...props
}: PropsWithChildren<BadgeProps>) {
  if (type === 'alone') {
    return open ? (
      <StyledBadge
        variant={variant}
        type={type}
        dataWidth={width}
        dataHeight={height}
        brandColor={brandColor}
        {...props}
        css={customStyle}
      >
        {children}
      </StyledBadge>
    ) : null;
  }

  return (
    <Flexbox customStyle={{ position: 'relative' }} {...props}>
      {children}
      {open && (
        <StyledBadge
          variant={variant}
          type={type}
          dataWidth={width}
          dataHeight={height}
          brandColor={brandColor}
          css={customStyle}
        >
          {text}
        </StyledBadge>
      )}
    </Flexbox>
  );
}

export default Badge;
