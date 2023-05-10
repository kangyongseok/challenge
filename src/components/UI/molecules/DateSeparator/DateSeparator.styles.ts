import { Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

export const Separator = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

export const Text = styled.div`
  margin: 0 16px;
  display: flex;
  white-space: nowrap;
`;

export const Date = styled(Typography)`
  white-space: nowrap;
  color: ${({ theme: { palette } }) => palette.common.ui60};
`;

export const Line = styled.div<{ showLine: boolean }>`
  border: none;
  height: 1px;
  display: inline-block;
  width: 100%;
  background-color: ${({ showLine, theme: { palette } }) => showLine && palette.common.line01};
`;
