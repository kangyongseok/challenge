import { useEffect, useMemo } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';

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
import { checkAgent, needUpdateChatIOSVersion } from '@utils/common';

import { dialogState } from '@recoil/common';
import { channelBottomSheetStateFamily, channelPushPageState } from '@recoil/channel';
import useRedirectVC from '@hooks/useRedirectVC';

const labels = Object.entries(channelType).map(([key, value]) => ({ key, value }));

function Channels() {
  const router = useRouter();
  useRedirectVC('/channels');

  const channelPushPage = useRecoilValue(channelPushPageState);
  const setDialogState = useSetRecoilState(dialogState);
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
    const { channelId, isCamelChannel } = router.query;

    if (needUpdateChatIOSVersion()) {
      setDialogState({
        type: 'requiredAppUpdateForChat',
        customStyleTitle: { minWidth: 270 },
        disabledOnClose: true,
        secondButtonAction: () => {
          window.webkit?.messageHandlers?.callExecuteApp?.postMessage?.(
            'itms-apps://itunes.apple.com/app/id1541101835'
          );
        }
      });
    } else if (channelId) {
      router.replace('/channels').then(() => {
        if (checkAgent.isIOSApp()) {
          window.webkit?.messageHandlers?.callChannel?.postMessage?.(
            `/channels/${channelId}${isCamelChannel ? 'isCamelChannel=true' : ''}`
          );
          return;
        }

        router.push(`/channels/${channelId}`);
      });
    }

    return () => {
      resetProductStatusBottomSheetState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return channelPushPage ? (
    <div />
  ) : (
    <GeneralTemplate header={<Header />} footer={<BottomNavigation />} disablePadding subset>
      <ChannelsTabs labels={labels} value={type.toString()} />
      {type === +labels[0].key && <ChannelsMessagesPanel type={0} />}
      {type === +labels[1].key && <ChannelsFilteredMessagesPanel />}
      {type === +labels[2].key && <ChannelsMessagesPanel type={2} />}
    </GeneralTemplate>
  );
}

export async function getServerSideProps({ req, query: { productId } }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(getCookies({ req }));
  const accessUser = Initializer.initAccessUserInQueryClientByCookies(
    getCookies({ req }),
    queryClient
  );

  if (!accessUser) {
    return {
      redirect: {
        destination: `/login?returnUrl=/channels&isRequiredLogin=true${
          productId ? `&productId=${productId}` : ''
        }`,
        permanent: false
      }
    };
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default Channels;
