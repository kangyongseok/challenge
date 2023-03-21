import { Button, Tooltip, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { fadeOut } from '@styles/transition';

export const CloseIcon = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
`;

export const IconBox = styled.div<{ selected: boolean }>`
  width: 64px;
  height: 64px;
  background: ${({
    theme: {
      palette: { common }
    },
    selected
  }) => (selected ? '#FFD911' : common.bg03)};
  border-radius: 8px;
  font-size: 40px;
`;

export const Description = styled.div`
  position: relative;
  display: flex;
  transition-delay: 0.5s;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  border-radius: 8px;
  margin-top: 12px;

  textarea {
    min-height: 120px;
    width: 100%;
    background-color: ${({ theme: { palette } }) => palette.common.bg01};
    border: 1px solid ${({ theme: { palette } }) => palette.common.line01};
    border-radius: 8px;
    padding: 12px 12px 24px;
    resize: none;
    color: ${({ theme: { palette } }) => palette.common.ui20};
    caret-color: ${({ theme: { palette } }) => palette.common.ui20};

    ${({ theme: { typography } }) => ({
      fontSize: typography.h4.size,
      fontWeight: typography.h4.weight.regular,
      lineHeight: typography.h4.lineHeight,
      letterSpacing: typography.h4.letterSpacing
    })};

    ::placeholder {
      color: ${({ theme: { palette } }) => palette.common.ui80};
      white-space: pre-wrap;
    }
  }
`;

export const DescriptionInfo = styled(Typography)`
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: inline-flex;
  width: 100%;
  color: ${({ theme: { palette } }) => palette.common.ui60};

  span {
    margin-left: 4px;
    color: ${({ theme: { palette } }) => palette.common.ui80};
  }
`;

export const NextButton = styled(Button)<{ selected: boolean }>`
  width: 115px;
  margin-top: ${({ selected }) => (selected ? 32 : 44)}px;
  background: ${({
    selected,
    theme: {
      palette: { primary, common }
    }
  }) => (selected ? primary.main : common.ui95)} !important;
  color: ${({
    selected,
    theme: {
      palette: { common }
    }
  }) => (selected ? common.uiWhite : common.ui60)} !important;
  border: none;
`;

export const EvaluationTooltip = styled(Tooltip)<{ isAnimation: boolean }>`
  div:nth-of-type(2) {
    animation: ${({ isAnimation }) => (isAnimation ? fadeOut : '')} 0.5s forwards;
    animation-delay: 2s;
  }
`;
