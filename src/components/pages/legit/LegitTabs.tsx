import type { MouseEvent } from 'react';

import { useRouter } from 'next/router';
import { Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/react';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function LegitTabs() {
  const router = useRouter();
  const { tab = 'live' } = router.query;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const dataTab = e.currentTarget.getAttribute('data-tab');

    logEvent(attrKeys.legit.CLICK_LEGIT_TAB, {
      name: tab === 'live' ? attrProperty.legitName.LEGIT_MAIN : attrProperty.legitName.LEGIT_MY,
      att: dataTab === 'live' ? 'LEGIT_MAIN' : 'LEGIT_MY'
    });

    router.replace({
      pathname: '/legit',
      query: {
        tab: dataTab
      }
    });
  };

  return (
    <StyledAuthTabs>
      <AuthTab isActive={tab === 'live'} data-tab="live" onClick={handleClick}>
        <Typography variant="h4" weight="bold">
          실시간 사진감정
        </Typography>
      </AuthTab>
      <AuthTab isActive={tab === 'my'} data-tab="my" onClick={handleClick}>
        <Typography variant="h4" weight="bold">
          내 사진감정
        </Typography>
        <NewCounterBadge>5</NewCounterBadge>
      </AuthTab>
    </StyledAuthTabs>
  );
}

const StyledAuthTabs = styled(Flexbox)`
  width: 100%;
  max-width: 268px;
  white-space: nowrap;
  margin: 20px auto 0 auto;
  padding: 4px;
  border-radius: ${({ theme: { box } }) => box.round['8']};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.grey['90']};
  overflow: hidden;
`;

const AuthTab = styled.button<{ isActive?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: ${({ theme: { box } }) => box.round['8']};

  ${({
    theme: {
      palette: { common }
    },
    isActive
  }): CSSObject =>
    isActive
      ? {
          backgroundColor: common.white,
          boxShadow: '0 4px 4px rgba(0, 0, 0, 0.04)'
        }
      : {
          '& > h4': {
            color: common.grey['80']
          }
        }};
`;

const NewCounterBadge = styled.div`
  display: none;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 2px;
  border-radius: 10px;
  background-color: ${({
    theme: {
      palette: { secondary }
    }
  }) => secondary.red.main};

  ${({
    theme: {
      typography: { small2 },
      palette: { common }
    }
  }): CSSObject => ({
    fontSize: small2.size,
    fontWeight: small2.weight.bold,
    lineHeight: small2.lineHeight,
    letterSpacing: small2.letterSpacing,
    color: common.white
  })};
`;

export default LegitTabs;
