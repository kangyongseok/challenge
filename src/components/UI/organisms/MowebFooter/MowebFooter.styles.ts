import { Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const FooterWrap = styled.footer<{ bottomPadding: number }>`
  margin-top: 44px;
  background: ${({ theme: { palette } }) => palette.common.bg02};
  padding: ${({ bottomPadding }) => (bottomPadding ? '32px 20px 100px' : '32px 20px 0')};
`;

export const EllipsisText = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 85%;
`;
