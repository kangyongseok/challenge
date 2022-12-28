import { Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 4px;
  padding: 12px 16px;
  background-color: ${({ theme: { palette } }) => palette.common.bg02};
  border-radius: 12px;
`;

export const Content = styled(Typography)`
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;
