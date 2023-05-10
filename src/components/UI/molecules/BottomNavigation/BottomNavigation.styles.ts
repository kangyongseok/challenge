import { Tooltip } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/styled';

import { IOS_SAFE_AREA_BOTTOM } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

export const StyledBottomNavigation = styled.nav<{
  display?: 'block' | 'none';
}>`
  width: 100%;
  min-height: calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : '0px'} + 60px);
  display: ${({ display }) => display || 'block'};
  padding-bottom: ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : 0};
  padding-top: ${isExtendedLayoutIOSVersion() ? `calc(${IOS_SAFE_AREA_BOTTOM} / 3)` : 0};
`;

export const List = styled.ul<{ triggered: boolean }>`
  position: fixed;
  z-index: ${({ theme: { zIndex } }) => zIndex.bottomNav};
  opacity: 1;
  bottom: 0;
  border-top: ${({
    theme: {
      palette: { common }
    }
  }) => `1px solid ${common.ui90}`};
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 60px;
  transition: opacity 0.1s ease-in;

  ${({ triggered }): CSSObject =>
    triggered
      ? {
          opacity: 1
        }
      : {
          opacity: 0,
          pointerEvents: 'none'
        }};
  padding-bottom: ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : 0};
  padding-top: ${isExtendedLayoutIOSVersion() ? `calc(${IOS_SAFE_AREA_BOTTOM} / 3)` : 0};
`;

export const ListItem = styled.li`
  position: relative;
  flex-grow: 1;
  height: 100%;
  text-align: center;

  & a {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
  & > .tooltip {
    width: 100%;
    height: 100%;
  }
`;

export const LegitResultTooltip = styled(Tooltip)`
  & > div {
    position: fixed;
    width: calc(100% - 80px);
    height: fit-content;
    top: auto;
    bottom: calc(20px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : '0px'});
    text-align: center;
  }
  z-index: ${({ theme: { zIndex } }) => zIndex.sheet - 1};
`;
