/* eslint-disable no-nested-ternary */
import { Button } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const FloatingButton = styled(Button)<{ isLegitTooltip: boolean; isUserShop: boolean }>`
  position: fixed;
  bottom: ${({ isLegitTooltip, isUserShop }) => (isUserShop ? 12 : isLegitTooltip ? 110 : 72)}px;
  right: 14px;
  z-index: ${({ theme: { zIndex } }) => zIndex.button + 2};
  border-radius: 50px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
`;
