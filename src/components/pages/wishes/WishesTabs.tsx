import { MouseEvent, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, CtaButton, Dialog, Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Tabs } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
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

function WishesTabs() {
  const router = useRouter();
  const {
    tab = 'wish',
    hiddenTab,
    order,
    selectedCategoryIds
  }: {
    tab?: 'wish' | 'history';
    hiddenTab?: string;
    order?: string;
    selectedCategoryIds?: string | string[];
  } = router.query;

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const [open, setOpen] = useState(false);

  const changeSelectedValue = (_: MouseEvent<HTMLButtonElement> | null, newValue: string) => {
    if (newValue === 'wish') {
      logEvent(attrKeys.wishes.VIEW_WISH_LIST);
    }
    if (newValue === 'history') {
      logEvent(attrKeys.wishes.VIEW_RECENT_LIST);
    }
    if (hiddenTab === 'legit') {
      logEvent(attrKeys.wishes.CLICK_WISHLEGIT_TAB, {
        title: attrProperty.productTitle.RECENT
      });
      setOpen(true);
      return;
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

  const handleClose = () => {
    logEvent(attrKeys.wishes.CLICK_WISHLEGIT_POPUP, {
      title: attrProperty.productTitle.RECENT,
      att: 'CLOSE'
    });
    setOpen(false);
  };

  const handleClickConfirm = () => {
    logEvent(attrKeys.wishes.CLICK_WISHLEGIT_POPUP, {
      title: attrProperty.productTitle.RECENT,
      att: 'OK'
    });
    setOpen(false);

    const query = {
      tab: 'history',
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

  return (
    <>
      <StyledWishTabs showAppDownloadBanner={showAppDownloadBanner}>
        <Tabs value={tab} changeValue={changeSelectedValue} labels={labels} />
      </StyledWishTabs>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Typography weight="medium" customStyle={{ textAlign: 'center' }}>
          실시간 사진감정을 중단하고
          <br />
          최근 본 매물로 이동하시겠어요?
        </Typography>
        <Flexbox gap={7} customStyle={{ marginTop: 20 }}>
          <CtaButton
            fullWidth
            variant="ghost"
            brandColor="primary"
            onClick={handleClose}
            customStyle={{ minWidth: 128 }}
          >
            취소
          </CtaButton>
          <CtaButton
            fullWidth
            variant="contained"
            brandColor="primary"
            onClick={handleClickConfirm}
            customStyle={{ minWidth: 128 }}
          >
            확인
          </CtaButton>
        </Flexbox>
      </Dialog>
    </>
  );
}

const StyledWishTabs = styled(Box)<{ showAppDownloadBanner: boolean }>`
  position: fixed;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? 56 + APP_DOWNLOAD_BANNER_HEIGHT : 56}px;
  width: 100%;
  z-index: ${({ theme: { zIndex } }) => zIndex.header + 1};
  margin-left: -20px;
`;

export default WishesTabs;
