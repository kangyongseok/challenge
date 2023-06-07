/* eslint-disable no-console */
import { useEffect } from 'react';
import type { ReactElement } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { GroupChannelHandler } from '@sendbird/chat/groupChannel';

import Sendbird from '@library/sendbird';

import { isProduction, uuidv4 } from '@utils/common';
import { getUpdatedChannels } from '@utils/channel';

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

  const { data: userInfo } = useQueryUserInfo();
  const { userId, userNickName, userImageProfile, isLoading } = useQueryMyUserInfo();
  const initialize = useInitializeSendbird();

  const sdk = Sendbird.getInstance();

  useEffect(() => {
    if (
      !!userId &&
      (!!userInfo?.hasChannel || router.pathname.indexOf('channels') !== -1) &&
      !state.loading &&
      !state.initialized &&
      !isLoading
    ) {
      initialize(userId.toString(), userNickName, userImageProfile);
    }
  }, [
    router.pathname,
    userId,
    state.initialized,
    state.loading,
    userInfo?.hasChannel,
    initialize,
    userNickName,
    userImageProfile,
    isLoading
  ]);

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
