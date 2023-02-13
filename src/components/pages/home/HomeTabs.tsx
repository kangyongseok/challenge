import { useEffect } from 'react';

import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

import Badge from '@components/UI/atoms/Badge';

import { logEvent } from '@library/amplitude';

import { APP_TOP_STATUS_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { hasHomeTabChangeState } from '@recoil/home';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function HomeTabs() {
  const router = useRouter();
  const { tab = 'recommend' } = router.query;

  const { data: { notViewedHistoryCount = 0 } = {} } = useQueryUserInfo();

  const { data: accessUser } = useQueryAccessUser();
  const setHasHomeTab = useSetRecoilState(hasHomeTabChangeState);
  const resetHasHomeTab = useResetRecoilState(hasHomeTabChangeState);

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClick = (newTab: string) => () => {
    logEvent(attrKeys.home.CLICK_MAIN_TAB, {
      att: newTab === 'recommend' ? 'RECOMM' : 'FOLLOWING'
    });
    setHasHomeTab(true);

    router.replace(
      {
        pathname: '/',
        query: {
          tab: newTab
        }
      },
      undefined,
      {
        shallow: false
      }
    );
  };

  const handleClickAlarm = () => {
    logEvent(attrKeys.home.CLICK_BEHAVIOR_LIST, {
      name: attrProperty.name.MAIN,
      title: notViewedHistoryCount > 0 ? attrProperty.title.NEW : attrProperty.title.GENERAL
    });

    if (!accessUser) {
      router.push('/login');
      return;
    }

    router.push('/notices');
  };

  const handleClickWish = () => {
    logEvent(attrKeys.home.CLICK_TAB_WISH);

    router.push('/wishes');
  };

  useEffect(() => {
    return () => resetHasHomeTab();
  }, [resetHasHomeTab]);

  return (
    <Flexbox
      alignment="center"
      justifyContent="space-between"
      customStyle={{
        marginTop: 16,
        padding: `${isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0}px 20px 0`
      }}
    >
      <Flexbox gap={12}>
        <Typography
          variant="h2"
          weight="bold"
          onClick={handleClick('recommend')}
          customStyle={{
            color: tab !== 'recommend' ? common.ui80 : undefined,
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          추천
        </Typography>
        <Typography
          variant="h2"
          weight="bold"
          onClick={handleClick('following')}
          customStyle={{
            color: tab !== 'following' ? common.ui80 : undefined,
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          팔로잉
        </Typography>
      </Flexbox>
      <Flexbox gap={16}>
        <Icon name="HeartOutlined" onClick={handleClickWish} />
        <Badge
          open={!!notViewedHistoryCount}
          variant="two-tone"
          brandColor="red"
          text={notViewedHistoryCount > 99 ? '99+' : notViewedHistoryCount}
          width={20}
          height={20}
          customStyle={{ top: -8, right: -8, width: 'fit-content', minWidth: 20 }}
        >
          <Icon name="AlarmOutlined" onClick={handleClickAlarm} />
        </Badge>
      </Flexbox>
    </Flexbox>
  );
}

export default HomeTabs;
