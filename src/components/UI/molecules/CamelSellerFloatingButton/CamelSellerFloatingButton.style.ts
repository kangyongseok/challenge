import { Button } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const FloatingButton = styled(Button)`
  position: fixed;
  bottom: 75px;
  right: 14px;
  z-index: ${({ theme: { zIndex } }) => zIndex.button + 2};
  border-radius: 50px;
`;
