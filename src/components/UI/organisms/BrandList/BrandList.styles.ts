import { Typography } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { BrandListProps } from './index';

export const StyledBrandList = styled.div<Pick<BrandListProps, 'variant'>>`
  padding: 0 20px;
  display: grid;
  user-select: none;

  ${({ variant }) =>
    variant === 'contained'
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
    variant === 'contained'
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
    variant === 'contained'
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

export const BrandImage = styled.div<
  Pick<BrandListProps, 'variant'> & {
    src: string;
  }
>`
  width: 100%;
  padding-bottom: 100%;
  background-image: url(${({ src }) => src});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border-radius: 50%;

  ${({ theme: { mode }, variant }): CSSObject => {
    switch (mode) {
      case 'dark':
        return {
          mixBlendMode: 'screen'
        };
      default: {
        return {
          mixBlendMode: variant === 'contained' ? 'multiply' : undefined
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
