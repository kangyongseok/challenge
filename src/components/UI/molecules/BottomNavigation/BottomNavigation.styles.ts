import { Label, Tooltip } from 'mrcamel-ui';
import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/styled';

export const StyledBottomNavigation = styled.nav<{
  display?: 'block' | 'none';
}>`
  width: 100%;
  min-height: 60px;
  display: ${({ display }) => display || 'block'};
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
  height: 60px;
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
    bottom: 30px;
    text-align: center;
  }
  z-index: ${({ theme: { zIndex } }) => zIndex.sheet - 1};
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
    }) => common.uiWhite};
  background-color: ${({
    theme: {
      palette: { secondary }
    }
  }) => secondary.red.main};
  border-radius: 10px;
  font-weight: 700;
  z-index: ${({ theme: { zIndex } }) => zIndex.tooltip};
`;
