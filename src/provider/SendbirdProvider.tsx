/* eslint-disable no-console */
import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { GroupChannelHandler } from '@sendbird/chat/groupChannel';

import Sendbird from '@library/sendbird';

import { isProduction, uuidv4 } from '@utils/common';
import { getUpdatedChannels } from '@utils/channel';

import { decryptPendingState } from '@recoil/common';
import { sendbirdState } from '@recoil/channel';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useInitializeSendbird from '@hooks/useInitializeSendbird';

interface SendbirdProviderProps {
  children: ReactElement;
}

function SendbirdProvider({ children }: SendbirdProviderProps) {
  const router = useRouter();
  const [state, setState] = useRecoilState(sendbirdState);
  const decryptPending = useRecoilValue(decryptPendingState);

  const { data: userInfo } = useQueryUserInfo();
  const { userId, userNickName, userImageProfile } = useQueryMyUserInfo();
  const initialize = useInitializeSendbird();

  const initializingRef = useRef(false);

  const sdk = Sendbird.getInstance();

  useEffect(() => {
    if (
      !decryptPending &&
      !!userId &&
      (!!userInfo?.hasChannel ||
        router.pathname.indexOf('channels') !== -1 ||
        router.pathname.indexOf('nonMember') !== -1) &&
      !state.loading &&
      !state.initialized &&
      !initializingRef.current
    ) {
      initializingRef.current = true;
      initialize(userId.toString(), userNickName, userImageProfile);
    }
  }, [
    decryptPending,
    router.pathname,
    userId,
    state.initialized,
    state.loading,
    userInfo?.hasChannel,
    initialize,
    userNickName,
    userImageProfile
  ]);

  useEffect(() => {
    initializingRef.current = false;
  }, [router.pathname]);

  useEffect(() => {
    const typingHandlerId = uuidv4();

    if (sdk.groupChannel?.addGroupChannelHandler) {
      const handler = new GroupChannelHandler({
        onTypingStatusUpdated: (channel) => {
          const typingMemberCount = channel.getTypingUsers()?.length;
          const channelList = state.typingChannels.filter((ch) => ch.url !== channel.url);

          setState((currVal) => {
            if (!isProduction)
              console.log('Sendbird onTypingStatusUpdated::', {
                state: currVal,
                typingMemberCount,
                channel,
                channelList
              });

            return {
              ...currVal,
              typingChannels: JSON.parse(
                JSON.stringify(typingMemberCount > 0 ? [...channelList, channel] : channelList)
              )
            };
          });
        },
        onMessageUpdated: (channel) => {
          setState((currVal) => {
            if (!isProduction)
              console.log('Sendbird onMessageUpdated::', {
                state: currVal,
                channel
              });

            return {
              ...currVal,
              allChannels: getUpdatedChannels(currVal.allChannels, channel),
              receivedChannels: getUpdatedChannels(currVal.receivedChannels, channel),
              sendChannels: getUpdatedChannels(currVal.sendChannels, channel)
            };
          });
          sdk.groupChannel.getChannelWithoutCache(channel.url).then((ch) => {
            setState((currVal) => ({
              ...currVal,
              allChannels: getUpdatedChannels(currVal.allChannels, ch),
              receivedChannels: getUpdatedChannels(currVal.receivedChannels, ch),
              sendChannels: getUpdatedChannels(currVal.sendChannels, ch)
            }));
          });
        }
      });
      sdk.groupChannel.addGroupChannelHandler(typingHandlerId, handler);
    }

    return () => {
      if (sdk?.groupChannel?.removeGroupChannelHandler && typingHandlerId) {
        sdk.groupChannel.removeGroupChannelHandler(typingHandlerId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdk?.currentUser?.userId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        Sendbird.getInstance().reconnect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return children;
}

export default SendbirdProvider;
