import { useEffect } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';
import styled from '@emotion/styled';

import LegitContactBanner from '@components/UI/organisms/LegitContactBanner';

import { legitResultCommentOpenContactBannerState } from '@recoil/legitResultComment/atom';

function LegitResultContactBanner() {
  const open = useRecoilValue(legitResultCommentOpenContactBannerState);
  const resetState = useResetRecoilState(legitResultCommentOpenContactBannerState);

  useEffect(() => {
    return () => {
      resetState();
    };
  }, [resetState]);

  if (!open) return null;

  return (
    <StyledLegitResultContactBanner open={open}>
      <LegitContactBanner isFixed isDark onClose={() => resetState()} />
    </StyledLegitResultContactBanner>
  );
}

const StyledLegitResultContactBanner = styled.div<{ open: boolean }>`
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  animation: slideIn 0.5s ease forwards;
  z-index: ${({ theme: { zIndex } }) => zIndex.bottomNav};

  @keyframes slideIn {
    0% {
      transform: translateY(200%);
    }
    100% {
      transform: translateY(0);
    }
  }
`;

export default LegitResultContactBanner;
