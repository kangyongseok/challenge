/* eslint-disable no-console */
import { useEffect } from 'react';
import type { ReactElement } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { GroupChannelHandler } from '@sendbird/chat/groupChannel';

import Sendbird from '@library/sendbird';

import { getUserName } from '@utils/user';
import { isProduction, uuidv4 } from '@utils/common';
import { getUpdatedChannels } from '@utils/channel';

import { sendbirdState } from '@recoil/channel';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useInitializeSendbird from '@hooks/useInitializeSendbird';

interface SendbirdProviderProps {
  children: ReactElement;
}

function SendbirdProvider({ children }: SendbirdProviderProps) {
  const router = useRouter();
  const [state, setState] = useRecoilState(sendbirdState);

  const { data: accessUser } = useQueryAccessUser();
  const { data: userInfo } = useQueryUserInfo();
  const initialize = useInitializeSendbird();

  const sdk = Sendbird.getInstance();

  useEffect(() => {
    if (
      !!accessUser &&
      (!!userInfo?.hasChannel || router.pathname === '/channels') &&
      !state.initialized
    ) {
      initialize(
        accessUser.userId.toString(),
        getUserName(accessUser.userName, accessUser.userId),
        accessUser.image
      );
    }
    // eslint-disable-next-line
  }, [accessUser?.userId, state.initialized, userInfo?.hasChannel]);

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
        onUnreadMemberStatusUpdated: (channel) => {
          setState((currVal) => {
            if (!isProduction)
              console.log('Sendbird onUnreadMemberStatusUpdated::', { state: currVal, channel });

            return {
              ...currVal,
              allChannels: getUpdatedChannels(currVal.allChannels, channel),
              receivedChannels: getUpdatedChannels(currVal.receivedChannels, channel),
              sendChannels: getUpdatedChannels(currVal.sendChannels, channel)
            };
          });
        },
        onUndeliveredMemberStatusUpdated: (channel) => {
          setState((currVal) => {
            if (!isProduction)
              console.log('Sendbird onUndeliveredMemberStatusUpdated::', {
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

  return children;
}

export default SendbirdProvider;
