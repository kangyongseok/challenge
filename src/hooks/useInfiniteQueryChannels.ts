/* eslint-disable no-console */
import { useMemo } from 'react';

import { useRecoilState } from 'recoil';
import { useInfiniteQuery } from 'react-query';
import type { GroupChannelCollectionEventHandler } from '@sendbird/chat/groupChannel';

import type { Channel, ChannelsParams } from '@dto/channel';

import Sendbird from '@library/sendbird';

import { fetchChannels } from '@api/channel';

import queryKeys from '@constants/queryKeys';

import { sendbirdState } from '@recoil/channel';

type UseInfiniteQueryChannelsProps = ChannelsParams;

function useInfiniteQueryChannels({
  type = 0,
  size = 20,
  ...params
}: UseInfiniteQueryChannelsProps) {
  const [sendbird, setSendbirdState] = useRecoilState(sendbirdState);

  const channelsParams = useMemo<ChannelsParams>(
    () => ({ size, type, ...params }),
    [params, size, type]
  );

  const {
    data: { pages = [] } = {},
    isLoading,
    isFetched,
    ...useInfiniteQueryResult
  } = useInfiniteQuery(
    queryKeys.channels.channels(channelsParams),
    ({ pageParam = 0 }) => fetchChannels({ ...channelsParams, page: pageParam }),
    {
      enabled: sendbird.initialized,
      refetchOnMount: true,
      getNextPageParam: (nextData) => {
        const { number = 0, totalPages = 0 } = nextData || {};

        return number < totalPages - 1 ? number + 1 : undefined;
      },
      async onSuccess(data) {
        setSendbirdState((currVal) => ({ ...currVal, loading: true }));

        const { pages: successPages } = data || {};

        if (!successPages.some((successPage) => !!successPage)) {
          setSendbirdState((currVal) => ({ ...currVal, loading: false }));
          return;
        }

        const channelUrls = successPages
          .flatMap(({ content }) => content)
          .filter(({ channel }) => !!channel?.externalId)
          .map(({ channel }) => (channel as Channel).externalId);
        const sendBirdChannels = await Sendbird.loadChannels(channelHandlers, channelUrls);

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

  const channelHandlers: GroupChannelCollectionEventHandler = useMemo(
    () => ({
      onChannelsAdded: async (_, channels) => {
        if (process.env.NODE_ENV === 'development')
          console.debug('Sendbird onChannelsAdded::', { channels });
        await useInfiniteQueryResult.refetch();
      },
      onChannelsUpdated: async (_, channels) => {
        const unreadMessagesCount = await Sendbird.unreadMessagesCount();

        setSendbirdState((currVal) => {
          const updatedAllChannels = currVal.allChannels.map((channel) => {
            const updatedChannel = channels.find(
              (incomingChannel) => incomingChannel.url === channel.url
            );

            return updatedChannel || channel;
          });
          const updatedReceivedChannels = currVal.receivedChannels.map((channel) => {
            const updatedChannel = channels.find(
              (incomingChannel) => incomingChannel.url === channel.url
            );

            return updatedChannel || channel;
          });
          const updatedSendChannels = currVal.sendChannels.map((channel) => {
            const updatedChannel = channels.find(
              (incomingChannel) => incomingChannel.url === channel.url
            );

            return updatedChannel || channel;
          });

          if (process.env.NODE_ENV === 'development')
            console.debug('Sendbird onChannelsUpdated::', {
              state: currVal,
              channels,
              updatedAllChannels,
              updatedReceivedChannels,
              updatedSendChannels,
              unreadMessagesCount
            });

          return {
            ...currVal,
            allChannels: JSON.parse(JSON.stringify(updatedAllChannels)),
            receivedChannels: JSON.parse(JSON.stringify(updatedReceivedChannels)),
            sendChannels: JSON.parse(JSON.stringify(updatedSendChannels)),
            unreadMessagesCount
          };
        });
      },
      onChannelsDeleted: (_, channelUrls) => {
        setSendbirdState((currVal) => {
          const updatedAllChannels = currVal.allChannels.filter(
            (channel) => !channelUrls.includes(channel.url)
          );
          const updatedReceivedChannels = currVal.receivedChannels.filter(
            (channel) => !channelUrls.includes(channel.url)
          );
          const updatedSendChannels = currVal.sendChannels.filter(
            (channel) => !channelUrls.includes(channel.url)
          );

          if (process.env.NODE_ENV === 'development')
            console.debug('Sendbird onChannelsDeleted::', {
              state: currVal,
              channelUrls,
              updatedAllChannels,
              updatedReceivedChannels,
              updatedSendChannels
            });

          return {
            ...currVal,
            allChannels: JSON.parse(JSON.stringify(updatedAllChannels)),
            receivedChannels: JSON.parse(JSON.stringify(updatedReceivedChannels)),
            sendChannels: JSON.parse(JSON.stringify(updatedSendChannels))
          };
        });
      }
    }),
    [setSendbirdState, useInfiniteQueryResult]
  );

  const channels = useMemo(
    () =>
      !pages.some((page) => !!page)
        ? []
        : pages
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
    [pages, sendbird.allChannels, sendbird.receivedChannels, sendbird.sendChannels, type]
  );

  return {
    channels,
    isLoading: isLoading || !sendbird.initialized || (isFetched && sendbird.loading),
    isFetched,
    ...useInfiniteQueryResult
  };
}

export default useInfiniteQueryChannels;
