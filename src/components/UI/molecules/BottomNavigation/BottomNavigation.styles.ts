import { Label, Tooltip } from 'mrcamel-ui';
import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/styled';

import Badge from '@components/UI/atoms/Badge';

export const StyledBottomNavigation = styled.nav<{
  display?: 'block' | 'none';
}>`
  width: 100%;
  min-height: 64px;
  display: ${({ display }) => display || 'block'};
`;

export const List = styled.ul<{ triggered: boolean }>`
  position: fixed;
  z-index: ${({ theme: { zIndex } }) => zIndex.bottomNav + 3};
  opacity: 1;
  bottom: 0;
  border-top: ${({ theme: { palette } }) => `1px solid ${palette.common.grey['90']}`};
  background: ${({ theme: { palette } }) => palette.common.white};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 64px;
  ${({ triggered }): CSSObject =>
    triggered
      ? {
          opacity: 1
        }
      : {
          opacity: 0,
          pointerEvents: 'none'
        }}

  transition: opacity 0.1s ease-in;
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
`;

export const NewLabel = styled(Label)`
  position: absolute;
  top: -9.5px;
  left: 50%;
  transform: translateX(-50%);
  border: 2px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.white};
  background-color: ${({
    theme: {
      palette: { secondary }
    }
  }) => secondary.red.main};
  border-radius: 10px;
  font-weight: 700;
  z-index: ${({ theme: { zIndex } }) => zIndex.tooltip};
`;

export const NewBadge = styled(Badge)`
  top: -1px;
  left: 135%;
  transform: translate(-135%, -1px);
  border: 2px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.white};
`;

export const LegitResultTooltip = styled(Tooltip)`
  & > div {
    position: fixed;
    width: calc(100% - 40px);
    height: fit-content;
    top: auto;
    bottom: -30px;
    text-align: center;
  }
  z-index: ${({ theme: { zIndex } }) => zIndex.sheet - 1};
`;
