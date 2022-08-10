import { Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const StyledCategoryList = styled.div<{ variant: 'contained' | 'outlined' }>`
  display: grid;
  padding: 0 20px;

  ${({ variant }) =>
    variant === 'contained'
      ? {
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 10
        }
      : {
          overflowX: 'auto',
          gridAutoFlow: 'column',
          gap: 6
        }};
`;

export const CategoryItem = styled.div<{ variant: 'contained' | 'outlined' }>`
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.box.round['8']};
  min-height: 49px;
  height: fit-content;
  white-space: nowrap;

  ${({ theme: { palette }, variant }) =>
    variant === 'contained'
      ? {
          backgroundColor: palette.common.grey['95'],
          padding: '8px 12px'
        }
      : {
          backgroundColor: palette.common.white,
          border: `1px solid ${palette.common.grey['90']}`,
          padding: '12px 16px'
        }};
`;

export const CategoryName = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
