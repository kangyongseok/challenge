import type { MouseEvent } from 'react';

import { useRouter } from 'next/router';
import { Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/react';

import Badge from '@components/UI/atoms/Badge';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryUserInfo from '@hooks/useQueryUserInfo';

function LegitTabs() {
  const router = useRouter();
  const { tab = 'live' } = router.query;

  const { data: { notViewedLegitCount = 0 } = {}, isLoading } = useQueryUserInfo();

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
        {!isLoading && notViewedLegitCount > 0 && (
          <Badge variant="two-tone" brandColor="red" type="alone" open width={20} height={20}>
            N
          </Badge>
        )}
      </AuthTab>
    </StyledAuthTabs>
  );
}

const StyledAuthTabs = styled(Flexbox)`
  width: 100%;
  max-width: 268px;
  white-space: nowrap;
  margin: 20px auto 20px;
  padding: 4px;
  border-radius: ${({ theme: { box } }) => box.round['8']};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
  overflow: hidden;
`;

const AuthTab = styled.button<{ isActive?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
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
          backgroundColor: common.uiWhite,
          boxShadow: '0 4px 4px rgba(0, 0, 0, 0.04)'
        }
      : {
          '& > h4': {
            color: common.ui80
          }
        }};
`;

export default LegitTabs;
