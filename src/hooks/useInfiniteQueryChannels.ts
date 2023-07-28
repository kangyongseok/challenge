import { useEffect, useMemo, useRef } from 'react';

import { useRecoilState } from 'recoil';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { GroupChannelCollection } from '@sendbird/chat/lib/__definition';
import { ConnectionHandler } from '@sendbird/chat';

import type { Channel, ChannelsParams } from '@dto/channel';

import Sendbird from '@library/sendbird';

import { fetchChannels } from '@api/channel';

import queryKeys from '@constants/queryKeys';

import { getChannelHandler } from '@utils/channel';

import { sendbirdState } from '@recoil/channel';
import useSession from '@hooks/useSession';

type UseInfiniteQueryChannelsProps = ChannelsParams;

function useInfiniteQueryChannels({
  type = 0,
  size = 20,
  ...params
}: UseInfiniteQueryChannelsProps) {
  const queryClient = useQueryClient();

  const { data: accessUser } = useSession();

  const [sendbird, setSendbirdState] = useRecoilState(sendbirdState);

  const channelsParams = useMemo<ChannelsParams>(
    () => ({ size, type, ...params }),
    [params, size, type]
  );
  const groupChannelCollection = useRef<GroupChannelCollection | null>(null);

  const { data, isInitialLoading, isLoading, isFetched, ...useInfiniteQueryResult } =
    useInfiniteQuery(
      queryKeys.channels.channels(channelsParams),
      ({ pageParam = 0 }) => fetchChannels({ ...channelsParams, page: pageParam }),
      {
        enabled: sendbird.initialized,
        refetchOnMount: true,
        getNextPageParam: (nextData) => {
          const { number = 0, totalPages = 0 } = nextData || {};

          return number < totalPages - 1 ? number + 1 : undefined;
        },
        async onSuccess(successData) {
          // 이전 핸들러 클리닝
          groupChannelCollection.current?.dispose?.();
          setSendbirdState((currVal) => ({ ...currVal, loading: true }));

          const { pages: successPages } = successData || {};

          if (!successPages.some((successPage) => !!successPage)) {
            setSendbirdState((currVal) => ({ ...currVal, loading: false }));
            return;
          }

          const channelHandler = getChannelHandler({
            setSendbirdState,
            channelsRefetch: () => {
              useInfiniteQueryResult.refetch();
            },
            setChannelsData: (channelId, lastMessageManage) => {
              const updatedChannel = successData.pages
                .flatMap((page) => page.content)
                .find((camelChannel) => channelId === camelChannel?.channel?.id);

              if (
                !!updatedChannel?.lastMessageManage &&
                !!lastMessageManage &&
                updatedChannel.lastMessageManage.content !== lastMessageManage.content
              ) {
                queryClient.setQueryData(queryKeys.channels.channels(channelsParams), {
                  ...successData,
                  pages: successData.pages.map((page) => ({
                    ...page,
                    content: page.content.map((camelChannel) =>
                      channelId === camelChannel?.channel?.id
                        ? { ...camelChannel, lastMessageManage }
                        : camelChannel
                    )
                  }))
                });
              }
            }
          });
          const channelUrls = successPages
            .flatMap(({ content }) => content)
            .filter(({ channel }) => !!channel?.externalId)
            .map(({ channel }) => (channel as Channel).externalId);
          const { channels: sendBirdChannels, collection } = await Sendbird.loadChannels(
            channelHandler,
            channelUrls
          );
          groupChannelCollection.current = collection;

          if (type === 0) {
            setSendbirdState((currVal) => ({
              ...currVal,
              loading: false,
              allChannels: JSON.parse(JSON.stringify(sendBirdChannels))
            }));
          }

          if (type === 1) {
            setSendbirdState((currVal) => ({
              ...currVal,
              loading: false,
              receivedChannels: JSON.parse(JSON.stringify(sendBirdChannels))
            }));
          }

          if (type === 2) {
            setSendbirdState((currVal) => ({
              ...currVal,
              loading: false,
              sendChannels: JSON.parse(JSON.stringify(sendBirdChannels))
            }));
          }
        }
      }
    );

  const channels = useMemo(
    () =>
      !(data?.pages || []).some((page) => !!page)
        ? []
        : (data?.pages || [])
            .flatMap(({ content }) => content)
            .map((camelChannel) => {
              let sendbirdChannels = sendbird.allChannels;

              if (type === 1) sendbirdChannels = sendbird.receivedChannels;

              if (type === 2) sendbirdChannels = sendbird.sendChannels;

              return {
                sendbird: sendbirdChannels.find(
                  ({ url }) => url === camelChannel.channel?.externalId
                ),
                camel: camelChannel
              };
            }),
    [data?.pages, sendbird.allChannels, sendbird.receivedChannels, sendbird.sendChannels, type]
  );

  useEffect(() => {
    if (accessUser?.userId) {
      Sendbird.getInstance().addConnectionHandler(
        `${String(accessUser?.userId || '')}-channels`,
        new ConnectionHandler({
          onReconnectSucceeded: async () => {
            groupChannelCollection.current?.dispose();
            const newUnreadMessagesCount = await Sendbird.unreadMessagesCount();
            setSendbirdState((prevState) => ({
              ...prevState,
              unreadMessagesCount: newUnreadMessagesCount
            }));
            await useInfiniteQueryResult.refetch();
          }
        })
      );
    }

    return () => {
      if (accessUser?.userId) {
        Sendbird.getInstance().removeConnectionHandler(
          `${String(accessUser?.userId || '')}-channels`
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessUser?.userId, setSendbirdState, useInfiniteQueryResult.refetch]);

  useEffect(() => {
    return () => {
      groupChannelCollection.current?.dispose?.();
    };
  }, []);

  return {
    channels,
    isInitialLoading,
    isLoading: isLoading || !sendbird.initialized || sendbird.loading,
    isFetched,
    totalChannelCount: data?.pages[0]?.totalElements,
    ...useInfiniteQueryResult
  };
}

export default useInfiniteQueryChannels;
