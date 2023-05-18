import { useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, Box, Button, Tab, TabGroup, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { BottomNavigation, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { ActivityNotificationPanel, NoticeNotificationPanel } from '@components/pages/notices';

import { logEvent } from '@library/amplitude';

import { postManage, putNotiReadAll } from '@api/userHistory';

import queryKeys from '@constants/queryKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT, IOS_SAFE_AREA_TOP, TAB_HEIGHT } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function Notices() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const queryClient = useQueryClient();
  const [tab, setTab] = useState<string | number>('활동알림');
  const { data: accessUser } = useQueryAccessUser();
  const params = {
    size: 20,
    sort: 'dateCreated,DESC',
    type: 0
  };
  const { data: { notViewedAnnounceCount = 0 } = {} } = useQueryUserInfo();
  const { mutate: productNotiReadAllMutate } = useMutation(putNotiReadAll, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userHistory.userNoti(params, accessUser?.userId),
        refetchType: 'inactive'
      });
    }
  });
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const { mutate: mutatePostManage } = useMutation(postManage);

  const changeSelectedValue = (newValue: string | number) => {
    if (newValue === '공지사항') {
      logEvent(attrKeys.noti.CLICK_ANNOUNCE_LIST);
    } else {
      logEvent(attrKeys.noti.CLICK_BEHAVIOR_LIST);
    }

    if (notViewedAnnounceCount > 0 && newValue === '공지사항') {
      mutatePostManage({ event: 'READ_ALL_ANNOUNCE' });
    }
    setTab(newValue);
  };

  const handleClickAllRead = () => {
    productNotiReadAllMutate();
  };

  return (
    <GeneralTemplate
      disablePadding
      header={
        <Header
          showRight={tab !== '활동알림'}
          rightIcon={
            tab === '활동알림' ? (
              <Button
                onClick={handleClickAllRead}
                customStyle={{ marginLeft: 'auto', border: 'none', fontSize: 12 }}
              >
                모두 읽음
              </Button>
            ) : undefined
          }
          customStyle={tab === '활동알림' ? { '> div > div> div': { minWidth: 110 } } : {}}
        />
      }
      footer={<BottomNavigation />}
    >
      <TabsWrapper showAppDownloadBanner={showAppDownloadBanner}>
        <TabGroup
          fullWidth
          value={tab}
          onChange={changeSelectedValue}
          customStyle={{
            backgroundColor: common.uiWhite
          }}
        >
          <Tab text="활동알림" value="활동알림" />
          <Tab
            text={
              <Badge
                variant="solid"
                open={notViewedAnnounceCount > 0}
                text="N"
                brandColor="red"
                size="xsmall"
                position={{
                  top: '50%',
                  right: -26
                }}
                // TODO UI 라이브러리 수정 필요
                customStyle={{
                  width: 16,
                  height: 16,
                  fontWeight: 700,
                  justifyContent: 'center',
                  transform: 'translateY(-50%)'
                }}
              >
                <Typography
                  weight={tab === '공지사항' ? 'bold' : 'regular'}
                  // TODO UI 라이브러리 수정 필요, text 가 ReactElement 인 경우 onChange 이벤트가 동작하지 않음에 따른 임시 조치
                  onClick={() => changeSelectedValue('공지사항')}
                  color={tab === '공지사항' ? undefined : 'ui60'}
                >
                  공지사항
                </Typography>
              </Badge>
            }
            value="공지사항"
          />
        </TabGroup>
      </TabsWrapper>
      <Box customStyle={{ marginTop: 41 }}>
        {tab === '활동알림' && <ActivityNotificationPanel />}
        {tab === '공지사항' && <NoticeNotificationPanel />}
      </Box>
    </GeneralTemplate>
  );
}

const TabsWrapper = styled(Box)<{ showAppDownloadBanner: boolean }>`
  position: fixed;
  top: calc(
    ${({ showAppDownloadBanner }) =>
        showAppDownloadBanner ? 56 + APP_DOWNLOAD_BANNER_HEIGHT : 56}px +
      ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'}
  );
  width: 100%;
  min-height: ${TAB_HEIGHT}px;
  z-index: 2;
  transition: top 0.5s;
`;

export default Notices;
