import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';

import type { PostChannelData } from '@dto/channel';

import Sendbird from '@library/sendbird';

import { postChannel } from '@api/channel';

import queryKeys from '@constants/queryKeys';

import type { CreateChannelParams } from '@typings/channel';
import { sendbirdState } from '@recoil/channel';
import useSession from '@hooks/useSession';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useInitializeSendbird from '@hooks/useInitializeSendbird';

function useMutationCreateChannel() {
  const router = useRouter();

  const toastStack = useToastStack();

  const queryClient = useQueryClient();

  const state = useRecoilValue(sendbirdState);

  const { refetch } = useSession();
  const {
    userId,
    userNickName,
    userImageProfile,
    refetch: refetchMyUserInfo
  } = useQueryMyUserInfo();
  const initializeSendbird = useInitializeSendbird();

  const { mutate: mutatePostChannel, ...useMutationResult } = useMutation(postChannel);

  const mutate = async (
    params: CreateChannelParams,
    options?: Omit<UseMutationOptions<number, unknown, PostChannelData, unknown>, 'mutationFn'>,
    callback?: (channelId?: number) => void,
    afterCallback?: (channelId?: number, externalId?: string) => void,
    deActiveRouting?: boolean,
    errorCallback?: () => void
  ) => {
    await refetch();
    await refetchMyUserInfo();

    if (!!userId && !state.initialized) {
      await initializeSendbird(userId.toString(), userNickName, userImageProfile);
    } else if (!!params.userId && !state.initialized) {
      await initializeSendbird(params.userId, userNickName, userImageProfile);
    }

    await Sendbird.createChannel(params)
      .then(([groupChannel]) => {
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

                if (afterCallback && typeof afterCallback === 'function') {
                  await afterCallback(channelId);
                }
              },
              onError() {
                toastStack({
                  children: '채팅방 생성에 실패했어요. 새로고침 후 시도해 주세요.'
                });
                if (errorCallback && typeof errorCallback === 'function') {
                  errorCallback();
                }
              },
              ...options
            }
          );
        } else {
          toastStack({
            children: '채팅방 생성에 실패했어요. 새로고침 후 시도해 주세요.'
          });
          if (errorCallback && typeof errorCallback === 'function') {
            errorCallback();
          }
        }
      })
      .catch(() => {
        toastStack({
          children: '채팅방 생성에 실패했어요. 새로고침 후 시도해 주세요.'
        });
        if (errorCallback && typeof errorCallback === 'function') {
          errorCallback();
        }
      });
  };

  return { mutate, ...useMutationResult };
}

export default useMutationCreateChannel;
