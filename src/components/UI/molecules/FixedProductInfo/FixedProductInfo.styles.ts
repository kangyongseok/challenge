import { Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const Wrapper = styled.div`
  position: fixed;
  width: 100%;
  display: flex;
  align-items: center;
  column-gap: 12px;
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  border-bottom: 1px solid ${({ theme: { palette } }) => palette.common.line01};
  padding: 4px 20px 12px;
  transition: all 0.5s;
  cursor: pointer;
`;

export const Title = styled(Typography)<{ isDeletedProduct: boolean }>`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ isDeletedProduct, theme: { palette } }) => isDeletedProduct && palette.common.ui80};
`;
