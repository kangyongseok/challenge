/* eslint-disable no-console */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';

import { useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import has from 'lodash-es/has';
import dayjs from 'dayjs';
import type { SendableMessage } from '@sendbird/chat/lib/__definition';
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import { GroupChannelHandler } from '@sendbird/chat/groupChannel';

import type { ChannelAppointmentResult } from '@dto/channel';

import StompJs from '@library/stompJs';
import Sendbird from '@library/sendbird';

import { fetchChannel } from '@api/channel';

import { channelUserType } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { productStatus } from '@constants/channel';

import { getUserName } from '@utils/user';
import { isProduction, uuidv4 } from '@utils/common';
import { compareIds, isAdminMessage, scrollIntoLast } from '@utils/channel';

import type { CoreMessageType } from '@typings/channel';
import { sendbirdState } from '@recoil/channel';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

const PREV_RESULT_SIZE = 30;

function useChannel(messagesRef: MutableRefObject<HTMLDivElement | null>) {
  const router = useRouter();

  const { initialized } = useRecoilValue(sendbirdState);

  const { data: accessUser } = useQueryAccessUser();

  const { channelId, channelHandlerId } = useMemo(
    () => ({
      channelId: Number(router.query.id || ''),
      channelHandlerId: uuidv4()
    }),
    [router.query.id]
  );
  const sendbirdSdk = Sendbird.getInstance();
  const channelHandler = new GroupChannelHandler({
    onMessageReceived: (channel, message) => {
      if (
        !compareIds(channel?.url, currentChannel.current?.url) ||
        messages.some((msg) => compareIds(msg.messageId, message.messageId))
      )
        return;

      if (!isProduction) console.log('Channel | onMessageReceived', message);

      let scrollToEnd = false;

      try {
        if (messagesRef.current) {
          const { clientHeight, scrollTop, scrollHeight } = messagesRef.current;

          scrollToEnd = Math.round(clientHeight + scrollTop) >= scrollHeight;
        }
      } catch {
        //
      }

      currentChannel.current = channel as GroupChannel;
      setState((prevState) => ({
        ...prevState,
        messages: [
          ...prevState.messages.filter(({ messageId }) => messageId !== message.messageId),
          message
        ] as CoreMessageType[]
      }));

      if (scrollToEnd) {
        try {
          setTimeout(async () => {
            await currentChannel.current?.markAsRead();
            scrollIntoLast();
          }, 100);
        } catch (error) {
          console.warn('Channel | onMessageReceived | scroll to end failed');
        }
      }
    },
    onUnreadMemberStatusUpdated: (channel) => {
      if (compareIds(channel?.url, currentChannel.current?.url)) {
        if (!isProduction) console.log('Channel | onUnreadMemberStatusUpdated', channel);

        currentChannel.current = channel;
        channel
          .getMessagesByTimestamp(new Date().getTime(), {
            prevResultSize: PREV_RESULT_SIZE,
            nextResultSize: 0
          })
          .then((baseMessages) => {
            setState({
              messages: baseMessages as CoreMessageType[],
              hasMorePrev: baseMessages.length === 30,
              oldestMessageTimeStamp: baseMessages[0]?.createdAt || new Date().getTime()
            });
          });
      }
    },
    // before(onDeliveryReceiptUpdated)
    onUndeliveredMemberStatusUpdated: (channel) => {
      if (compareIds(channel?.url, currentChannel.current?.url)) {
        if (!isProduction) console.log('Channel | onDeliveryReceiptUpdated', channel);
        currentChannel.current = channel;
      }
    },
    onChannelChanged: (channel) => {
      if (compareIds(channel?.url, currentChannel.current?.url)) {
        if (!isProduction) console.log('Channel | onChannelChanged', channel);
        currentChannel.current = channel as GroupChannel;
      }
    }
  });

  const useQueryResult = useQuery(
    queryKeys.channels.channel(channelId),
    () => fetchChannel(channelId),
    {
      enabled: !!channelId && initialized,
      refetchOnMount: true,
      async onSuccess(data) {
        if (messages.length > 0) return; // 최초 채널 입장시에만 초기화

        const { externalId } = data?.channel || {};

        if (externalId) {
          const channel = await Sendbird.getInstance().groupChannel.getChannel(externalId);

          channel
            .getMessagesByTimestamp(new Date().getTime(), {
              prevResultSize: PREV_RESULT_SIZE,
              nextResultSize: 0
            })
            .then((baseMessages) => {
              currentChannel.current = channel;
              setState({
                messages: baseMessages as CoreMessageType[],
                hasMorePrev: baseMessages.length === 30,
                oldestMessageTimeStamp: baseMessages[0]?.createdAt || new Date().getTime()
              });
            });
          await channel.markAsRead();

          sendbirdSdk.groupChannel?.addGroupChannelHandler?.(channelHandlerId, channelHandler);
        }
      }
    }
  );

  const [{ messages, hasMorePrev, oldestMessageTimeStamp }, setState] = useState<{
    messages: CoreMessageType[];
    hasMorePrev: boolean;
    oldestMessageTimeStamp: number;
  }>({
    messages: [],
    hasMorePrev: false,
    oldestMessageTimeStamp: 0
  });

  const currentChannel = useRef<GroupChannel | null>(null);
  const prevScrollHeight = useRef(0);

  const channelData = useMemo<{
    userName: string;
    isSeller: boolean;
    appointment: ChannelAppointmentResult | undefined;
    showAppointmentBanner: boolean;
    showProductReserveMessage: boolean;
    targetUserId: number;
    targetUserName: string;
    isTargetUserBlocked: boolean;
    isDeletedTargetUser: boolean;
    productId: number;
    productStatus: number;
    isDeletedProduct: boolean;
  }>(() => {
    const { product, channelUser, channelTargetUser, channelAppointments, userBlocks } =
      useQueryResult.data || {};

    const findAppointment = channelAppointments?.find(
      ({ isDeleted, type }) => !isDeleted && type !== 'DELETE'
    );
    const channelTargetUserId = channelTargetUser?.user?.id || 0;
    const isSeller =
      typeof channelUser?.type === 'number' &&
      channelUserType[channelUser.type as keyof typeof channelUserType] === channelUserType[1];

    return {
      userName: getUserName(
        channelUser?.user.nickName || channelUser?.user.name,
        channelUser?.user.id || 0
      ),
      isSeller,
      appointment: findAppointment,
      showAppointmentBanner:
        !!findAppointment && dayjs().diff(findAppointment.dateAppointment, 'minute') < 0,
      showProductReserveMessage:
        isSeller &&
        productStatus[(product?.status || 0) as keyof typeof productStatus] === productStatus[0] &&
        !!findAppointment,
      targetUserId: channelTargetUserId,
      targetUserName: getUserName(
        channelTargetUser?.user?.nickName || channelTargetUser?.user?.name,
        channelTargetUserId
      ),
      isTargetUserBlocked: !!userBlocks?.some(
        (blockedUser) =>
          blockedUser.userId === accessUser?.userId &&
          blockedUser.targetUser.id === channelTargetUserId
      ),
      isDeletedTargetUser: !!channelTargetUser?.user?.isDeleted,
      productId: product?.id || 0,
      productStatus: product?.status || 0,
      isDeletedProduct: !!product?.isDeleted
    };
  }, [accessUser?.userId, useQueryResult.data]);
  const filteredMessages = useMemo(
    () =>
      messages.filter((message, index) => {
        if (!isAdminMessage(message)) return true;

        const messageData: Record<string, string> = JSON.parse(message.data || '{}');

        if (!has(messageData, 'userId')) return true;

        // 판매자인 경우 매물 변경 노티는 가장 마지막 메세지만 표시하도록 필터 처리
        if (Number(messageData.userId || 0) === accessUser?.userId) {
          if (message.customType !== 'productReserve') return true;

          if (
            messages.slice(index + 1).every((msg) => msg.customType !== 'productReserve') &&
            channelData.showProductReserveMessage
          )
            return true;
        }

        return false;
      }),
    [accessUser?.userId, channelData.showProductReserveMessage, messages]
  );

  const fetchPrevMessages = useCallback(async () => {
    prevScrollHeight.current = messagesRef.current?.scrollHeight || 0;

    try {
      const newMessages = await currentChannel.current?.getMessagesByTimestamp(
        oldestMessageTimeStamp || new Date().getTime(),
        {
          prevResultSize: PREV_RESULT_SIZE,
          nextResultSize: 0,
          isInclusive: true
        }
      );

      if (newMessages) {
        setState((prevState) => {
          // Remove duplicated messages
          const duplicatedMessageIds: number[] = [];
          const updatedOldMessages = prevState.messages.map((msg) => {
            const duplicatedMessage = newMessages.find(({ messageId }) =>
              compareIds(messageId, msg.messageId)
            );

            if (!duplicatedMessage) return msg;

            duplicatedMessageIds.push(duplicatedMessage.messageId);

            return (duplicatedMessage?.updatedAt || 0) > (msg?.updatedAt || 0)
              ? duplicatedMessage
              : msg;
          });
          const filteredNewMessages =
            duplicatedMessageIds.length > 0
              ? newMessages.filter(
                  (msg) =>
                    !duplicatedMessageIds.find((messageId) => compareIds(messageId, msg.messageId))
                )
              : newMessages;

          return {
            ...prevState,
            hasMorePrev: newMessages.length === PREV_RESULT_SIZE + 1,
            oldestMessageTimeStamp: newMessages[0].createdAt,
            messages: [...filteredNewMessages, ...updatedOldMessages] as CoreMessageType[]
          };
        });

        setTimeout(() => {
          try {
            if (messagesRef.current) {
              // eslint-disable-next-line no-param-reassign
              messagesRef.current.scrollTop =
                messagesRef.current.scrollHeight - prevScrollHeight.current;
              prevScrollHeight.current = 0;
            }
          } catch (error) {
            //
          }
        }, 50);
      } else {
        setState((prevState) => ({ ...prevState, hasMorePrev: false }));
      }
    } catch {
      //
    }
  }, [currentChannel, oldestMessageTimeStamp, messagesRef]);

  const updateNewMessage = useCallback((msg: SendableMessage) => {
    setState((prevState) => ({
      ...prevState,
      messages: [
        ...prevState.messages.filter(({ messageId }) => messageId !== msg.messageId),
        msg
      ] as CoreMessageType[]
    }));
    setTimeout(() => scrollIntoLast(), 50);
  }, []);

  useEffect(() => {
    StompJs.initialize(channelId);
    setTimeout(() => {
      StompJs.subScribeChannel({
        channelId,
        callback: () => {
          useQueryResult.refetch();
        }
      });
    }, 3000);

    return () => {
      StompJs.finalize();
      sendbirdSdk.groupChannel?.removeGroupChannelHandler?.(channelHandlerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    useQueryChannel: useQueryResult,
    channelData,
    sendbirdChannel: currentChannel.current,
    messages: filteredMessages,
    hasMorePrev,
    fetchPrevMessages,
    updateNewMessage
  };
}

export default useChannel;
