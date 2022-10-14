import { Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const ImageBox = styled.div`
  position: relative;
  min-width: 56px;
  max-width: 56px;
  border-radius: ${({
    theme: {
      box: { round }
    }
  }) => round['4']};
  overflow: hidden;
`;

export const Content = styled(Flexbox)`
  flex-grow: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const Title = styled(Typography)`
  color: ${({ theme }) => theme.palette.common.ui60};
  overflow: hidden;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;
