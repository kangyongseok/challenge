import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticPropsContext } from 'next';
import { Box, Toast } from 'mrcamel-ui';

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

import { locales } from '@constants/common';
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
        <Box customStyle={{ marginTop: 45 }}>
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
        {toastMessage}
      </Toast>
      <TopButton
        show
        name="WISH_LIST"
        customStyle={{ bottom: hiddenTab === 'legit' ? 167 : undefined }}
      />
    </>
  );
}

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

export default WishesPage;
