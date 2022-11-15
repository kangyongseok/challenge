import type { MouseEvent } from 'react';
import { useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useMutation } from 'react-query';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticPropsContext } from 'next';
import { Box, Button } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { BottomNavigation, Header, Tabs } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { ActivityNotificationPanel, NoticeNotificationPanel } from '@components/pages/notices';

import { logEvent } from '@library/amplitude';

import { postManage, putNotiReadAll } from '@api/userHistory';

import { APP_DOWNLOAD_BANNER_HEIGHT, locales } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { showAppDownloadBannerState } from '@recoil/common';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

const labels = [
  {
    key: '활동알림',
    value: '활동알림'
  },
  {
    key: '공지사항',
    value: '공지사항',
    badge: true
  }
];

//  router.push(`/announces/${id}`);

function Notices() {
  const [tab, setTab] = useState(labels[0].value);
  const [allRead, setAllRead] = useState(false);
  const { data: { notViewedAnnounceCount = 0 } = {} } = useQueryUserInfo();
  const { mutate: productNotiReadAllMutate } = useMutation(putNotiReadAll, {
    onSuccess() {
      setAllRead(false);
    }
  });
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const { mutate: mutatePostManage } = useMutation(postManage);

  const changeSelectedValue = (_: MouseEvent<HTMLButtonElement> | null, newValue: string) => {
    if (newValue === '공지사항') {
      logEvent(attrKeys.noti.CLICK_ALARM_LIST);
    } else {
      logEvent(attrKeys.noti.CLICK_ANNOUNCE_LIST);
    }

    if (notViewedAnnounceCount > 0 && newValue === '공지사항') {
      mutatePostManage({ event: 'READ_ALL_ANNOUNCE' });
    }
    setTab(newValue);
  };

  const handleClickAllRead = () => {
    setAllRead(true);
    productNotiReadAllMutate();
  };

  return (
    <GeneralTemplate
      header={
        <Header
          rightIcon={
            tab === labels[0].value ? (
              <Button
                onClick={handleClickAllRead}
                customStyle={{ border: 'none', marginRight: 20, padding: 0, fontSize: 12 }}
              >
                모두 읽음
              </Button>
            ) : (
              <Box customStyle={{ width: 65 }} />
            )
          }
        />
      }
      footer={<BottomNavigation />}
    >
      <TabsWrapper showAppDownloadBanner={showAppDownloadBanner}>
        <Tabs
          value={tab}
          changeValue={changeSelectedValue}
          labels={labels}
          isNew={notViewedAnnounceCount > 0}
        />
      </TabsWrapper>
      <Box customStyle={{ marginTop: 41 }}>
        {tab === labels[0].value && <ActivityNotificationPanel allRead={allRead} />}
        {tab === labels[1].value && <NoticeNotificationPanel />}
      </Box>
    </GeneralTemplate>
  );
}

const TabsWrapper = styled(Box)<{ showAppDownloadBanner: boolean }>`
  position: fixed;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? 56 + APP_DOWNLOAD_BANNER_HEIGHT : 56}px;
  width: 100%;
  z-index: 2;
  margin-left: -16px;
`;

export async function getStaticProps({
  locale,
  defaultLocale = locales.ko.lng
}: GetStaticPropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(locale || defaultLocale))
    }
  };
}

export default Notices;
