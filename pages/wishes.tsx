import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import { useRouter } from 'next/router';
import { Box, Toast, Typography, useTheme } from 'mrcamel-ui';

import { BottomNavigation, Header, TopButton } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  HistoryPanel,
  WishesBottomCtaButton,
  WishesPanel,
  WishesTabs
} from '@components/pages/wishes';

import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

function WishesPage() {
  const router = useRouter();
  const {
    tab = 'wish',
    hiddenTab
  }: {
    tab?: 'wish' | 'history';
    hiddenTab?: 'legit';
  } = router.query;

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [[showToast, toastMessage], setToast] = useState<[boolean, ReactElement | null]>([
    false,
    null
  ]);

  useEffect(() => {
    logEvent(attrKeys.wishes.VIEW_WISH_LIST);
  }, []);

  useEffect(() => {
    if (hiddenTab === 'legit') {
      logEvent(attrKeys.wishes.VIEW_WISHLEGIT);
      ChannelTalk.moveChannelButtonPosition(-30);
    }

    return () => {
      ChannelTalk.resetChannelButtonPosition();
    };
  }, [hiddenTab]);

  return (
    <>
      <GeneralTemplate
        header={<Header />}
        footer={hiddenTab === 'legit' ? <WishesBottomCtaButton /> : <BottomNavigation />}
      >
        <WishesTabs />
        <Box customStyle={{ marginTop: 41 }}>
          {tab === 'wish' && <WishesPanel />}
          {tab === 'history' && <HistoryPanel />}
        </Box>
      </GeneralTemplate>
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
      <TopButton
        show
        name="WISH_LIST"
        customStyle={{ bottom: hiddenTab === 'legit' ? 167 : undefined }}
      />
    </>
  );
}

export default WishesPage;
