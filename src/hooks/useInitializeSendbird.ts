import { useCallback } from 'react';

import { useSetRecoilState } from 'recoil';

import Sendbird from '@library/sendbird';

import { checkAgent } from '@utils/common';

import { sendbirdState } from '@recoil/channel';

function useInitializeSendbird() {
  const setSendbirdState = useSetRecoilState(sendbirdState);

  const initialize = useCallback(
    async (userId: string, nickname: string, image?: string | null) => {
      setSendbirdState((currVal) => ({ ...currVal, loading: true }));
      await Sendbird.initialize(userId, nickname, image);

      if (checkAgent.isIOSApp())
        window.webkit?.messageHandlers?.callSetChannelUser?.postMessage?.(userId);

      if (checkAgent.isAndroidApp()) window.webview?.callSetChannelUser?.(+userId);

      const unreadMessagesCount = await Sendbird.unreadMessagesCount();

      setSendbirdState((currVal) => ({
        ...currVal,
        loading: false,
        initialized: true,
        unreadMessagesCount
      }));
    },
    [setSendbirdState]
  );

  return initialize;
}

export default useInitializeSendbird;
