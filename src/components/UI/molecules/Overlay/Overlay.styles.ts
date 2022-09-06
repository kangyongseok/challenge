import type { TypographyVariant } from 'mrcamel-ui';
import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/styled';

export const BaseOverlay = styled.div<{ variant?: TypographyVariant; isRound?: boolean }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  pointer-events: none;
  // TODO UI 라이브러리 zIndex 값 추가 또는 조정 후 적용 필요
  z-index: 1;
  border-radius: ${({ isRound }) => isRound && '8px'};

  ${({ theme: { typography }, variant }): CSSObject => ({
    fontSize: typography[variant || 'h2'].size,
    fontWeight: typography[variant || 'h2'].weight.bold,
    lineHeight: typography[variant || 'h2'].lineHeight,
    letterSpacing: typography[variant || 'h2'].letterSpacing
  })};

  & ::after {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    color: ${({ theme: { palette } }) => palette.common.white};
  }
`;

export const SoldOutOverlay = styled(BaseOverlay)`
  & ::after {
    content: '판매완료';
  }
`;

export const ReservingOverlay = styled(BaseOverlay)`
  & ::after {
    content: '예약중';
  }
`;

export const DuplicatedOverlay = styled(BaseOverlay)`
  & ::after {
    content: '판매자가 같은 매물을 다시 올렸어요';
  }
`;

export const PriceDownOverlay = styled(BaseOverlay)`
  & ::after {
    content: '판매자가 가격을 내려서\A다시 올렸어요';
    text-align: center;
    white-space: pre;
  }
`;
