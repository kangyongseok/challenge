import { Image, Typography } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { BrandListProps } from './index';

export const StyledBrandList = styled.div<Pick<BrandListProps, 'variant'>>`
  padding: 0 20px;
  display: grid;
  user-select: none;

  ${({ variant }) =>
    variant === 'solid'
      ? {
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '20px 12px'
        }
      : {
          gridAutoFlow: 'column',
          overflowX: 'auto',
          columnGap: 12
        }};
`;

export const BrandItem = styled.div<Pick<BrandListProps, 'variant'>>`
  row-gap: 8px;
  text-align: center;
  position: relative;
  overflow: hidden;
  height: fit-content;
  cursor: pointer;

  ${({ variant }) =>
    variant === 'solid'
      ? {
          display: 'grid',
          gridAutoColumns: 'minmax(0, 64px)',
          gridTemplateRows: '64px 18px',
          margin: 'auto'
        }
      : {
          display: 'flex',
          flexDirection: 'column',
          flex: 'none',
          width: 64
        }};
`;

export const BrandImageBox = styled.div<Pick<BrandListProps, 'variant' | 'color'>>`
  border-radius: 50%;
  padding: 8px;

  ${({
    variant,
    color,
    theme: {
      palette: { common }
    }
  }) =>
    variant === 'solid'
      ? {
          backgroundColor: color === 'grey' ? common.ui95 : common.uiWhite,
          height: 'fit-content'
        }
      : {
          backgroundColor: common.uiWhite,
          border: `1px solid ${common.ui90}`,
          height: 64
        }};
`;

export const BrandImage = styled(Image)<Pick<BrandListProps, 'variant'>>`
  ${({ theme: { mode }, variant }): CSSObject => {
    switch (mode) {
      case 'dark':
        return {
          mixBlendMode: 'screen'
        };
      default: {
        return {
          mixBlendMode: variant === 'solid' ? 'multiply' : undefined
        };
      }
    }
  }}
`;

export const BrandName = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
