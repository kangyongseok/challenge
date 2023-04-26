import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { PostChannelData } from '@dto/channel';

import Sendbird from '@library/sendbird';

import { postChannel } from '@api/channel';

import queryKeys from '@constants/queryKeys';

import type { CreateChannelParams } from '@typings/channel';
import { toastState } from '@recoil/common';
import { sendbirdState } from '@recoil/channel';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useInitializeSendbird from '@hooks/useInitializeSendbird';

function useMutationCreateChannel() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const state = useRecoilValue(sendbirdState);
  const setToastState = useSetRecoilState(toastState);

  const { userId, userNickName, userImageProfile } = useQueryMyUserInfo();
  const initializeSendbird = useInitializeSendbird();

  const { mutate: mutatePostChannel, ...useMutationResult } = useMutation(postChannel);

  const mutate = async (
    params: CreateChannelParams,
    options?: Omit<UseMutationOptions<number, unknown, PostChannelData, unknown>, 'mutationFn'>,
    callback?: (channelId?: number) => void,
    afterCallback?: (channelId?: number) => void,
    deActiveRouting?: boolean
  ) => {
    if (!!userId && !state.initialized) {
      await initializeSendbird(userId.toString(), userNickName, userImageProfile);
    }

    await Sendbird.createChannel(params).then(([groupChannel]) => {
      if (groupChannel) {
        mutatePostChannel(
          {
            productId: +params.productId,
            externalId: groupChannel.url
          },
          {
            async onSuccess(channelId) {
              if (callback && typeof callback === 'function') {
                await callback(channelId);
              }

              await groupChannel.createMetaData({ ...params, channelId: String(channelId) });

              await queryClient.invalidateQueries(
                queryKeys.products.product({ productId: +params.productId })
              );

              if (!deActiveRouting) {
                router.push(`/channels/${channelId}`);
              }

              // if (checkAgent.isIOSApp() && !deActiveRouting) {
              //   window.webkit?.messageHandlers?.callChannel?.postMessage?.(
              //     `/channels/${channelId}`
              //   );
              // } else if (!deActiveRouting) {
              //   router.push(`/channels/${channelId}`);
              // }

              if (afterCallback && typeof afterCallback === 'function') {
                await afterCallback(channelId);
              }
            },
            onError() {
              setToastState({ type: 'channel', status: 'createFail' });
            },
            ...options
          }
        );
      } else {
        setToastState({ type: 'sendbird', status: 'createFail' });
      }
    });
  };

  return { mutate, ...useMutationResult };
}

export default useMutationCreateChannel;
