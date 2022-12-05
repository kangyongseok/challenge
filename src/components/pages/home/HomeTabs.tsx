import { useMemo } from 'react';

import { useRouter } from 'next/router';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

import Badge from '@components/UI/atoms/Badge';

import { logEvent } from '@library/amplitude';

import { APP_TOP_STATUS_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function HomeTabs() {
  const router = useRouter();
  const { tab } = router.query;

  const { data: { notViewedHistoryCount = 0, isNewUser } = {} } = useQueryUserInfo();
  const { data: accessUser } = useQueryAccessUser();

  const currentTab = useMemo(() => {
    if (!tab) {
      if (isNewUser || isNewUser === undefined) {
        return 'recommend';
      }
      return 'following';
    }
    return tab;
  }, [tab, isNewUser]);

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClick = (newTab: string) => () => {
    logEvent(attrKeys.home.CLICK_MAIN_TAB, {
      att: newTab === 'recommend' ? 'RECOMM' : 'FOLLOWING'
    });

    router.push({
      pathname: '/',
      query: {
        tab: newTab
      }
    });
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
            color: currentTab !== 'recommend' ? common.ui80 : undefined,
            cursor: 'pointer'
          }}
        >
          추천
        </Typography>
        <Typography
          variant="h2"
          weight="bold"
          onClick={handleClick('following')}
          customStyle={{
            color: currentTab !== 'following' ? common.ui80 : undefined,
            cursor: 'pointer'
          }}
        >
          팔로잉
        </Typography>
      </Flexbox>
      <Flexbox gap={16}>
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
        <Icon name="HeartOutlined" onClick={handleClickWish} />
      </Flexbox>
    </Flexbox>
  );
}

export default HomeTabs;
