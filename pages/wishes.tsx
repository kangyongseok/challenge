import { useEffect, useState } from 'react';
import type { MouseEvent, ReactElement } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Toast, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { BottomNavigation, Header, Tabs, TopButton } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { HistoryPanel, WishesPanel } from '@components/pages/wishes';

import { logEvent } from '@library/amplitude';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { showAppDownloadBannerState } from '@recoil/common';

const labels = [
  {
    key: 'wish',
    value: '찜'
  },
  {
    key: 'history',
    value: '최근'
  }
];

function WishesPage() {
  const router = useRouter();
  const {
    tab = 'wish',
    order,
    selectedCategoryIds
  }: {
    tab?: 'wish' | 'history';
    order?: string;
    selectedCategoryIds?: string | string[];
  } = router.query;

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const [[showToast, toastMessage], setToast] = useState<[boolean, ReactElement | null]>([
    false,
    null
  ]);
  const changeSelectedValue = (_: MouseEvent<HTMLButtonElement>, newValue: string) => {
    if (newValue === 'wish') {
      logEvent(attrKeys.wishes.VIEW_WISH_LIST);
    }
    if (newValue === 'history') {
      logEvent(attrKeys.wishes.VIEW_RECENT_LIST);
    }

    const query = {
      tab: newValue,
      order,
      selectedCategoryIds
    };

    if (!selectedCategoryIds) delete query.selectedCategoryIds;
    if (!order) delete query.order;

    router
      .replace(
        {
          pathname: '/wishes',
          query
        },
        undefined,
        { shallow: true }
      )
      .then(() => window.scrollTo(0, 0));
  };

  useEffect(() => {
    logEvent(attrKeys.wishes.VIEW_WISH_LIST);
  }, []);

  return (
    <GeneralTemplate header={<Header />} footer={<BottomNavigation />}>
      <WishesPanelsWrapper showAppDownloadBanner={showAppDownloadBanner}>
        <Tabs value={tab} changeValue={changeSelectedValue} labels={labels} />
      </WishesPanelsWrapper>
      <Box customStyle={{ marginTop: 41 }}>
        {tab === 'wish' && <WishesPanel />}
        {tab === 'history' && <HistoryPanel />}
      </Box>
      <Toast
        open={toastMessage !== null && showToast}
        bottom="74px"
        onClose={() => setToast([false, toastMessage])}
        autoHideDuration={1000}
      >
        <Typography
          customStyle={{
            color: common.white
          }}
        >
          {toastMessage}
        </Typography>
      </Toast>
      <TopButton show name="WISH_LIST" />
    </GeneralTemplate>
  );
}

const WishesPanelsWrapper = styled(Box)<{ showAppDownloadBanner: boolean }>`
  position: fixed;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? 56 + APP_DOWNLOAD_BANNER_HEIGHT : 56}px;
  width: 100%;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  margin-left: -20px;
`;

export default WishesPage;
