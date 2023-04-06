/* eslint-disable no-console */
import { useCallback, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import type { GroupChannelHandlerParams, SendableMessage } from '@sendbird/chat/lib/__definition';
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import { GroupChannelHandler } from '@sendbird/chat/groupChannel';

import type { ChannelAppointmentResult } from '@dto/channel';

import Sendbird from '@library/sendbird';

import { fetchChannel } from '@api/channel';

import queryKeys from '@constants/queryKeys';

import { uuidv4 } from '@utils/common';
import { compareIds, scrollIntoLast } from '@utils/channel';

import type { CoreMessageType, MemorizedMessage } from '@typings/channel';
import { sendbirdState } from '@recoil/channel';

const PREV_RESULT_SIZE = 30;

function useQueryChannel(messagesRef: MutableRefObject<HTMLDivElement | null>) {
  const router = useRouter();

  const { initialized } = useRecoilValue(sendbirdState);

  const [{ messages, hasMorePrev, oldestMessageTimeStamp }, setState] = useState<{
    messages: CoreMessageType[];
    hasMorePrev: boolean;
    oldestMessageTimeStamp: number;
  }>({
    messages: [],
    hasMorePrev: false,
    oldestMessageTimeStamp: 0
  });

  const channelId = useMemo(() => Number(router.query.id || ''), [router.query.id]);
  const currentChannel = useRef<GroupChannel | null>(null);
  const prevScrollHeight = useRef(0);

  const useQueryResult = useQuery(
    queryKeys.channels.channel(channelId),
    () => fetchChannel(channelId),
    {
      enabled: !!channelId && initialized,
      refetchOnMount: true,
      async onSuccess(data) {
        const { externalId } = data?.channel || {};

        if (externalId) {
          const channel = await Sendbird.getInstance().groupChannel.getChannel(externalId);

          // TODO 메시지를 불러오지 못하는 문제가 있어 임시로 +5초 처리 추후 분석 후 수정
          channel
            .getMessagesByTimestamp(new Date().getTime() + 5000, {
              prevResultSize: PREV_RESULT_SIZE,
              nextResultSize: 0
            })
            .then((baseMessages) => {
              currentChannel.current = channel;
              setState((prevState) => ({
                ...prevState,
                messages: baseMessages as CoreMessageType[],
                hasMorePrev: baseMessages.length === 30,
                oldestMessageTimeStamp: baseMessages[0]?.createdAt || new Date().getTime()
              }));
            });
          await channel.markAsRead();

          const channelHandlerId = uuidv4();

          Sendbird.getInstance()?.groupChannel.addGroupChannelHandler(
            channelHandlerId,
            new GroupChannelHandler(channelHandler)
          );
        }
      }
    }
  );

  const channelHandler: GroupChannelHandlerParams = useMemo(
    () => ({
      onMessageReceived: (channel, message) => {
        if (
          !compareIds(channel?.url, currentChannel.current?.url) ||
          messages.some((msg) => compareIds(msg.messageId, message.messageId))
        )
          return;

        if (process.env.NODE_ENV === 'development')
          console.log('Channel | onMessageReceived', message);

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
          messages: [...prevState.messages, message] as CoreMessageType[]
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
          if (process.env.NODE_ENV === 'development')
            console.log('Channel | onUnreadMemberStatusUpdated', channel);

          setState((prevState) => ({ ...prevState, sendbirdChannel: channel }));
          currentChannel.current = channel;
        }
      },
      // before(onDeliveryReceiptUpdated)
      onUndeliveredMemberStatusUpdated: (channel) => {
        if (compareIds(channel?.url, currentChannel.current?.url)) {
          if (process.env.NODE_ENV === 'development')
            console.log('Channel | onDeliveryReceiptUpdated', channel);
          setState((prevState) => ({ ...prevState, sendbirdChannel: channel }));
          currentChannel.current = channel;
        }
      },
      onUnreadMemberCountUpdated: (channel: GroupChannel) => {
        if (compareIds(channel?.url, currentChannel.current?.url)) {
          if (process.env.NODE_ENV === 'development')
            console.log('Channel | onUnreadMemberCountUpdated', channel);
          setState((prevState) => ({ ...prevState, sendbirdChannel: channel }));
          currentChannel.current = channel;
        }
      },
      onChannelChanged: (channel) => {
        if (compareIds(channel?.url, currentChannel.current?.url)) {
          if (process.env.NODE_ENV === 'development')
            console.log('Channel | onChannelChanged', channel);
          currentChannel.current = channel as GroupChannel;
        }
      }
    }),
    [messages, messagesRef]
  );

  const memorizedMessages = useMemo<MemorizedMessage[]>(() => {
    if (messages.length === 0) return [];

    const channelMessages = [...messages];
    const channelAppointments: Array<
      {
        appointment: ChannelAppointmentResult;
      } & Pick<MemorizedMessage, 'isPushNoti' | 'showChangeProductStatus' | 'showAppointmentDetail'>
    > = [];
    const channelUserReview = useQueryResult.data?.userReview
      ? [useQueryResult.data?.userReview]
      : [];

    if (useQueryResult.data?.channelAppointments) {
      useQueryResult.data?.channelAppointments
        .filter(
          (channelAppointment) =>
            dayjs(channelAppointment.dateCreated).diff(channelMessages[0].createdAt, 'second') > 0
        )
        .forEach((channelAppointment, index) => {
          const nextAppointment = useQueryResult.data?.channelAppointments?.[index + 1];
          const findNextCreateAppointment = useQueryResult.data?.channelAppointments
            ?.slice(index + 1)
            ?.find(({ type }) => type === 'CREATE');
          const findNextUpdateAppointment = useQueryResult.data?.channelAppointments
            ?.slice(index + 1)
            ?.find(({ type }) => type === 'UPDATE');

          channelAppointments.push({
            appointment: channelAppointment,
            isPushNoti: false,
            showChangeProductStatus:
              channelAppointment.type === 'CREATE' && !findNextCreateAppointment,
            showAppointmentDetail:
              channelAppointment.type === 'UPDATE' && !findNextUpdateAppointment
          });

          // 푸시 알림
          if (
            channelAppointment.type !== 'DELETE' &&
            channelAppointment.notiTime > 0 &&
            dayjs(channelAppointment.dateAppointment).diff(
              channelAppointment.isDeleted ? nextAppointment?.dateCreated || dayjs() : dayjs(),
              'minute'
            ) <= channelAppointment.notiTime
          ) {
            channelAppointments.push({
              appointment: channelAppointment,
              isPushNoti: true,
              showChangeProductStatus: false,
              showAppointmentDetail: false
            });
          }
        });
    }

    return Array.from({
      length: messages.length + channelAppointments.length + channelUserReview.length
    }).map((_) => {
      const [currentMessage] = channelMessages;
      const [channelAppointment] = channelAppointments;
      const currentMessageCreatedAt = currentMessage?.createdAt;

      // 직거래 약속
      if (channelAppointment?.appointment) {
        const {
          isPushNoti,
          appointment: { dateCreated, dateAppointment }
        } = channelAppointment;

        if (
          isPushNoti &&
          dayjs(dateAppointment).diff(currentMessageCreatedAt || dayjs(), 'second') <= 0
        ) {
          return {
            message: undefined,
            userReview: undefined,
            ...channelAppointments.splice(0, 1)[0]
          };
        }

        if (dayjs(dateCreated).diff(currentMessageCreatedAt || dayjs(), 'second') <= 0) {
          return {
            message: undefined,
            userReview: undefined,
            ...channelAppointments.splice(0, 1)[0]
          };
        }
      }

      // 후기
      if (
        channelUserReview.length > 0 &&
        dayjs(channelUserReview[0].dateCreated).diff(
          currentMessageCreatedAt || dayjs(),
          'second'
        ) <= 0
      ) {
        return {
          message: undefined,
          userReview: channelUserReview.splice(0, 1)[0],
          appointment: undefined,
          isPushNoti: false,
          showChangeProductStatus: false,
          showAppointmentDetail: false
        };
      }

      // 일반 메세지
      return {
        message: channelMessages.splice(0, 1)[0],
        userReview: undefined,
        appointment: undefined,
        isPushNoti: false,
        showChangeProductStatus: false,
        showAppointmentDetail: false
      };
    });
  }, [messages, useQueryResult.data?.channelAppointments, useQueryResult.data?.userReview]);

  const fetchPrevMessages = useCallback(async () => {
    prevScrollHeight.current = messagesRef.current?.scrollHeight || 0;

    try {
      const newMessages = await currentChannel.current?.getMessagesByTimestamp(
        oldestMessageTimeStamp || new Date().getTime() + 5000,
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
      messages: [...prevState.messages, msg] as CoreMessageType[]
    }));
    setTimeout(() => scrollIntoLast(), 50);
  }, []);

  return {
    ...useQueryResult,
    sendbirdChannel: currentChannel.current,
    memorizedMessages,
    hasMorePrev,
    fetchPrevMessages,
    updateNewMessage
  };
}

export default useQueryChannel;
