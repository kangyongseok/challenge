import { Button, Flexbox } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';
import { CSSObject } from '@emotion/react';

export const StyledDropDownWrap = styled.div`
  position: relative;
  min-width: fit-content;
`;

export const FilterButton = styled(Button)<{
  disabledBorder: boolean;
  isSelectValue: boolean;
  disabledBg?: boolean;
}>`
  height: 36px;
  padding: 6px 8px;
  line-height: 1;
  background: ${({ theme: { palette } }) => palette.common.ui95};
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  border-radius: 8px;
  svg {
    color: ${({
      isSelectValue,
      theme: {
        palette: { primary, common }
      }
    }) => (isSelectValue ? primary.main : common.ui20)};
  }
  ${({ disabledBorder, isSelectValue, disabledBg, theme: { palette } }): CSSObject => {
    if (disabledBg) {
      return {
        background: 'none',
        padding: 0
      };
    }
    if (disabledBorder) {
      return {
        border: 'none',
        padding: 0
      };
    }
    if (isSelectValue) {
      return {
        // border: `1px solid ${palette.primary.light}`,
        color: palette.primary.main,
        background: palette.primary.highlight
      };
    }
    return {};
  }};
`;

export const DropDownArea = styled(Flexbox)<{ isDisplay: boolean; right: number }>`
  position: absolute;
  z-index: 5;
  right: ${({ right }) => right}px;
  top: 45px;
  display: ${({ isDisplay }) => (isDisplay ? 'block' : 'none')};
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.1);
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
  border-radius: 4px;
  padding: 8px 4px;
  min-width: 200px;
  max-height: 320px;
  overflow-y: auto;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
`;

export const Item = styled(Flexbox)<{ isActive: boolean }>`
  background: ${({
    theme: {
      palette: { primary, common }
    },
    isActive
  }) => (isActive ? primary.highlight : common.uiWhite)};
  padding: 10px 12px;
  border-radius: 4px;
`;
