import { Button, Icon } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { IOS_SAFE_AREA_TOP } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

export const Img = styled.img<{ rotate: number; isLoading: boolean }>`
  transform: rotate(${({ rotate }) => rotate}deg);
  opacity: ${({ isLoading }) => (isLoading ? 0 : 1)};
  transition: opacity 0.2s;
`;

export const CloseIcon = styled(Icon)`
  position: absolute;
  top: calc(15px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'});
  right: 16px;
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
  cursor: pointer;
`;

export const Pagination = styled.div`
  position: absolute;
  width: fit-content;
  left: 50%;
  padding: 6px 12px;
  bottom: 27px;
  right: 20px;
  border-radius: ${({ theme }) => theme.box.round['16']};
  background-color: rgba(255, 255, 255, 0.6);
  transform: translateX(-50%);
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
  font-size: ${({ theme: { typography } }) => typography.body2.size};
  font-weight: ${({ theme: { typography } }) => typography.body2.weight.bold};
  line-height: ${({ theme: { typography } }) => typography.body2.lineHeight};
  letter-spacing: ${({ theme: { typography } }) => typography.body2.letterSpacing};
`;

export const ZoomOutButton = styled(Button)`
  position: absolute;
  left: 20px;
  bottom: 20px;
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
`;

export const ZoomInButton = styled(Button)`
  position: absolute;
  left: 67px;
  bottom: 20px;
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
`;

export const RotateButton = styled(Button)`
  position: absolute;
  right: 20px;
  bottom: 20px;
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
`;

export const LoadingIcon = styled(Icon)`
  animation: rotate 1s linear infinite;
  z-index: ${({ theme: { zIndex } }) => zIndex.button};

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
