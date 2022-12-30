import { useState } from 'react';

import { useRouter } from 'next/router';
import { Box, Button, Dialog, Flexbox, Tab, TabGroup, Typography, useTheme } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import { APP_TOP_STATUS_HEIGHT, TAB_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

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

  const {
    theme: {
      palette: { common },
      zIndex: { header }
    }
  } = useTheme();

  const [open, setOpen] = useState(false);

  const changeSelectedValue = (newValue: string | number) => {
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
      <Box
        component="section"
        customStyle={{
          minHeight: TAB_HEIGHT,
          zIndex: header,
          paddingTop: isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0
        }}
      >
        <TabGroup
          value={tab}
          onChange={changeSelectedValue}
          fullWidth
          // TODO backgroundColor UI 라이브러리 수정 필요
          customStyle={{
            position: 'fixed',
            width: '100%',
            backgroundColor: common.uiWhite,
            '& button': { flex: 1 }
          }}
        >
          <Tab text="찜" value="wish" />
          <Tab text="최근" value="history" />
        </TabGroup>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Typography weight="medium" customStyle={{ textAlign: 'center' }}>
          실시간 사진감정을 중단하고
          <br />
          최근 본 매물로 이동하시겠어요?
        </Typography>
        <Flexbox gap={7} customStyle={{ marginTop: 20 }}>
          <Button
            fullWidth
            variant="ghost"
            brandColor="primary"
            onClick={handleClose}
            customStyle={{ minWidth: 128 }}
          >
            취소
          </Button>
          <Button
            fullWidth
            variant="solid"
            brandColor="primary"
            onClick={handleClickConfirm}
            customStyle={{ minWidth: 128 }}
          >
            확인
          </Button>
        </Flexbox>
      </Dialog>
    </>
  );
}

export default WishesTabs;
