import { Button } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const StyledAppDownloadBanner = styled.div`
  width: 100%;
  height: 60px;
  background: ${({ theme }) => theme.palette.common.grey['95']};
  padding: 0 20px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  cursor: pointer;
`;

export const CamelIconBox = styled.div`
  border-radius: 4px;
  overflow: hidden;
  width: 32px;
  min-width: 32px;
`;

export const DownloadButtonBox = styled(Button)`
  margin-left: auto;
  margin-right: 0;
  border-radius: 16px;
  height: 28px;
  white-space: nowrap;
`;
