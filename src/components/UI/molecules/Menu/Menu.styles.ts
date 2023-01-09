import { Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const StyledMenu = styled.section<{ gap?: number }>`
  display: flex;
  justify-content: center;
  flex-direction: column;
  row-gap: ${({ gap }) => gap || 20}px;
  padding: 32px 20px;
`;

export const Title = styled(Typography)`
  color: ${({ theme: { palette } }) => palette.common.ui80};
  cursor: default;
`;

export const StyledMenuItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 0;
  min-height: 28px;
  cursor: pointer;
`;
