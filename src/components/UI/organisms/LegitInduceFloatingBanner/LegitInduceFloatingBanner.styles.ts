import { Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { LegitInduceFloatingBannerProps } from '.';

export const StyledLegitInduceFloatingBanner = styled.div<
  Pick<LegitInduceFloatingBannerProps, 'themeType' | 'edgeSpacing' | 'halfRound' | 'bottom'>
>`
  position: fixed;
  left: 0;
  bottom: ${({ bottom }) => bottom}px;
  ${({ edgeSpacing }) =>
    edgeSpacing
      ? {
          width: `calc(100% - ${edgeSpacing * 2}px)`,
          margin: `0 ${edgeSpacing}px`
        }
      : {
          width: '100%'
        }};
  background-color: ${({ theme: { palette }, themeType }) =>
    themeType === 'dark' ? palette.common.black : palette.common.white};
  ${({
    theme: {
      palette: { common }
    },
    themeType
  }) =>
    themeType === 'light'
      ? {
          border: `1px solid ${common.grey['90']}`
        }
      : {}}
  border-radius: ${({ halfRound }) => (!halfRound ? '32px' : '16px 16px 0px 0px')};
  z-index: ${({ theme: { zIndex } }) => zIndex.button + 2};

  cursor: pointer;
  animation: slideIn 0.2s ease;

  @keyframes slideIn {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

export const MessageTypography = styled(Typography)<
  Pick<LegitInduceFloatingBannerProps, 'themeType'>
>`
  margin-right: 4px;
  color: ${({
    theme: {
      palette: { common }
    },
    themeType
  }) => (themeType === 'dark' ? common.white : common.black)};
  & > strong {
    color: ${({
      theme: {
        palette: { primary }
      },
      themeType
    }) => (themeType === 'dark' ? primary.light : primary.main)};
  }
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;
