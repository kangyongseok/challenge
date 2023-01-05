/* eslint-disable no-console */
import { useEffect, useMemo, useRef } from 'react';

import { useRecoilState } from 'recoil';
import { useQuery, useQueryClient } from 'react-query';
import { GroupChannelCollection } from '@sendbird/chat/lib/__definition';

import type { Channel, ChannelsParams } from '@dto/channel';

import Sendbird from '@library/sendbird';

import { fetchChannels } from '@api/channel';

import queryKeys from '@constants/queryKeys';

import { getChannelHandler } from '@utils/channel';

import { sendbirdState } from '@recoil/channel';

type UseQueryChannelsProps = ChannelsParams;

function useQueryChannels({ type = 0, size = 100, ...params }: UseQueryChannelsProps) {
  const queryClient = useQueryClient();

  const [sendbird, setSendbirdState] = useRecoilState(sendbirdState);

  const channelsParams = useMemo<ChannelsParams>(
    () => ({ size, type, ...params }),
    [params, size, type]
  );
  const groupChannelCollection = useRef<GroupChannelCollection | null>(null);

  const { data, ...useQueryResult } = useQuery(
    queryKeys.channels.channels(channelsParams),
    ({ pageParam = 0 }) => fetchChannels({ ...channelsParams, page: pageParam }),
    {
      enabled: sendbird.initialized,
      refetchOnMount: true,
      async onSuccess(successData) {
        // 이전 핸들러 클리닝
        groupChannelCollection.current?.dispose?.();
        setSendbirdState((currVal) => ({ ...currVal, loading: true }));

        const { content } = successData || {};

        if (!content) return;

        const channelHandler = getChannelHandler({
          setSendbirdState,
          channelsRefetch: () => {
            useQueryResult.refetch();
          },
          setChannelsData: (channelId, lastMessageManage) => {
            const updatedChannel = successData.content.find(
              (camelChannel) => channelId === camelChannel?.channel?.id
            );

            if (
              !!updatedChannel?.lastMessageManage &&
              !!lastMessageManage &&
              updatedChannel.lastMessageManage.content !== lastMessageManage.content
            ) {
              queryClient.setQueryData(queryKeys.channels.channels(channelsParams), {
                ...successData,
                content: successData.content.map((camelChannel) =>
                  channelId === camelChannel?.channel?.id
                    ? { ...camelChannel, lastMessageManage }
                    : camelChannel
                )
              });
            }
          }
        });
        const channelUrls = content
          .filter(({ channel }) => !!channel)
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

  const { channels, filteredChannels } = useMemo(() => {
    const { content = [] } = data || {};
    const filteredSendbirdChannels = Array.from(
      new Set(content.map(({ product }) => product?.id).filter((id) => !!id))
    ).map((filterProductId) =>
      content
        .filter(({ product }) => product?.id === filterProductId)
        .map((camelChannel) => ({
          sendbird: sendbird.receivedChannels.find(
            ({ url }) => url === camelChannel.channel?.externalId
          ),
          camel: camelChannel
        }))
    );
    let sendbirdChannels = sendbird.allChannels;

    if (type === 1) sendbirdChannels = sendbird.receivedChannels;

    if (type === 2) sendbirdChannels = sendbird.sendChannels;

    return {
      channels: content.map((camelChannel) => ({
        sendbird: sendbirdChannels.find(({ url }) => url === camelChannel.channel?.externalId),
        camel: camelChannel
      })),
      filteredChannels: filteredSendbirdChannels
    };
  }, [data, sendbird.allChannels, sendbird.receivedChannels, sendbird.sendChannels, type]);

  useEffect(() => {
    return () => {
      groupChannelCollection.current?.dispose?.();
    };
  }, []);

  return { data: { ...data, channels, filteredChannels }, ...useQueryResult };
}

export default useQueryChannels;
