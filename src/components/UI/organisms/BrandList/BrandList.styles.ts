import { Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

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
          width: 64,
          margin: '0 auto'
        }};
`;

export const BrandImageBox = styled.div<Pick<BrandListProps, 'variant' | 'color'>>`
  border-radius: 50%;
  padding: 8px;

  ${({ variant, color, theme: { palette } }) =>
    variant === 'contained'
      ? {
          backgroundColor: color === 'grey' ? palette.common.grey['95'] : 'white',
          height: 'fit-content'
        }
      : {
          backgroundColor: palette.common.white,
          border: `1px solid ${palette.common.grey['90']}`,
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
  mix-blend-mode: ${({ variant }) => variant === 'contained' && 'multiply'};
`;

export const BrandName = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
