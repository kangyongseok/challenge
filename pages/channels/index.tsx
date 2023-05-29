import { useEffect, useMemo, useState } from 'react';

import { useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';

import { AppUpdateForChatDialog } from '@components/UI/organisms';
import { BottomNavigation, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ChannelsFilteredMessagesPanel,
  ChannelsMessagesPanel,
  ChannelsTabs
} from '@components/pages/channels';

import Initializer from '@library/initializer';

import { channelType } from '@constants/channel';

import { getCookies } from '@utils/cookies';
import { needUpdateChatIOSVersion } from '@utils/common';

import { channelBottomSheetStateFamily } from '@recoil/channel';

const labels = Object.entries(channelType).map(([key, value]) => ({ key, value }));

function Channels() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const resetProductStatusBottomSheetState = useResetRecoilState(
    channelBottomSheetStateFamily('productStatus')
  );

  const { type } = useMemo(
    () => ({
      type: Number(router.query.type || labels[0].key) as keyof typeof channelType
    }),
    [router.query.type]
  );

  useEffect(() => {
    const { channelId } = router.query;

    if (needUpdateChatIOSVersion()) {
      setOpen(true);
    } else if (channelId) {
      router.replace('/channels').then(() => router.push(`/channels/${channelId}`));
    }

    return () => {
      resetProductStatusBottomSheetState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <GeneralTemplate
        header={<Header />}
        footer={<BottomNavigation />}
        disablePadding
        hideAppDownloadBanner
      >
        <ChannelsTabs labels={labels} value={type.toString()} />
        {type === +labels[0].key && <ChannelsMessagesPanel type={0} />}
        {type === +labels[1].key && <ChannelsFilteredMessagesPanel />}
        {type === +labels[2].key && <ChannelsMessagesPanel type={2} />}
      </GeneralTemplate>
      <AppUpdateForChatDialog open={open} />
    </>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  return {
    props: {}
  };
}

export default Channels;
