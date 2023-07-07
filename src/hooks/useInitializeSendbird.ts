import { useCallback } from 'react';

import { useSetRecoilState } from 'recoil';

import Sendbird from '@library/sendbird';
import { logEvent } from '@library/amplitude';

import { checkAgent } from '@utils/common';

import { sendbirdState } from '@recoil/channel';

function useInitializeSendbird() {
  const setSendbirdState = useSetRecoilState(sendbirdState);

  const initialize = useCallback(
    async (userId: string, nickname: string, image?: string | null) => {
      setSendbirdState((currVal) => ({ ...currVal, loading: true }));
      try {
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
      } catch (error) {
        logEvent('SUPPORT_ERROR', {
          type: 'SENDBIRD',
          name: 'SENDBIRD_INITIALIZED',
          error,
          userId,
          nickname,
          at: 'useInitializeSendbird'
        });
        setSendbirdState((currVal) => ({
          ...currVal,
          loading: false,
          initialized: false
        }));
      }
    },
    [setSendbirdState]
  );

  return initialize;
}

export default useInitializeSendbird;
