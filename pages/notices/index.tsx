import type { MouseEvent } from 'react';
import { useState } from 'react';

import { useRecoilValue } from 'recoil';
import { Box } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { BottomNavigation, Header, Tabs } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { ActivityNotificationPanel, HoneyNotificationPanel } from '@components/pages/notices';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

import { showAppDownloadBannerState } from '@recoil/common';

const labels = [
  {
    key: '활동알림',
    value: '활동알림'
  },
  {
    key: '꿀매알림',
    value: '꿀매알림'
  }
];

function Notices() {
  const [tab, setTab] = useState(labels[0].value);
  const changeSelectedValue = (_: MouseEvent<HTMLButtonElement> | null, newValue: string) => {
    setTab(newValue);
  };
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  return (
    <GeneralTemplate header={<Header />} footer={<BottomNavigation />}>
      <TabsWrapper showAppDownloadBanner={showAppDownloadBanner}>
        <Tabs value={tab} changeValue={changeSelectedValue} labels={labels} />
      </TabsWrapper>
      <Box customStyle={{ marginTop: 41 }}>
        {tab === labels[0].value && <ActivityNotificationPanel />}
        {tab === labels[1].value && <HoneyNotificationPanel />}
      </Box>
    </GeneralTemplate>
  );
}

const TabsWrapper = styled(Box)<{ showAppDownloadBanner: boolean }>`
  position: fixed;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? 56 + APP_DOWNLOAD_BANNER_HEIGHT : 56}px;
  width: 100%;
  z-index: 11;
  margin-left: -16px;
`;

export default Notices;
