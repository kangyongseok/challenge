/* eslint-disable no-console */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import has from 'lodash-es/has';
import dayjs from 'dayjs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FileMessage, UserMessage } from '@sendbird/chat/message';
import type { SendableMessage } from '@sendbird/chat/lib/__definition';
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import { GroupChannelHandler } from '@sendbird/chat/groupChannel';
import { ConnectionHandler } from '@sendbird/chat';

import type { ChannelAppointmentResult } from '@dto/channel';

import StompJs from '@library/stompJs';
import Sendbird from '@library/sendbird';
import { logEvent } from '@library/amplitude';

import { fetchChannel, postHistoryManage } from '@api/channel';

import { channelUserType } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { productStatus } from '@constants/channel';

import { getUserName } from '@utils/user';
import { isProduction } from '@utils/common';
import { compareIds, isAdminMessage } from '@utils/channel';

import type { CoreMessageType } from '@typings/channel';
import { sendbirdState } from '@recoil/channel';
import useSession from '@hooks/useSession';

const PREV_RESULT_SIZE = 30;

function useChannel() {
  const router = useRouter();
  const { id } = router.query;

  const [{ initialized }, setSendbirdState] = useRecoilState(sendbirdState);

  const { isLoggedInWithSMS, data: accessUser } = useSession();
  const { mutate: mutatePostHistoryManage } = useMutation(postHistoryManage);

  const [{ messages, hasMorePrev, oldestMessageTimeStamp }, setState] = useState<{
    messages: CoreMessageType[];
    hasMorePrev: boolean;
    oldestMessageTimeStamp: number;
  }>({
    messages: [],
    hasMorePrev: false,
    oldestMessageTimeStamp: 0
  });
  const [pending, setPending] = useState(false);
  const [isPrevFetching, setIsPrevFetching] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [senderUserId, setSenderUserId] = useState(0);
  const [currentChannel, setCurrentChannel] = useState<GroupChannel>();

  const prevScrollHeightRef = useRef(0);
  const fetchingPrevMessagesRef = useRef(false);
  const initializedChannelRef = useRef(false);
  const markAsReadingRef = useRef(false);

  const useQueryResult = useQuery(
    queryKeys.channels.channel(Number(id)),
    () => fetchChannel(Number(id)),
    {
      enabled: !!id && initialized && isLoggedInWithSMS,
      refetchOnMount: 'always',
      async onSuccess(data) {
        // 최초 채널 입장시에만 초기화
        if (messages.length > 0 && initializedChannelRef.current) {
          return;
        }
        if (!messages.length) {
          setPending(true);
        }

        initializedChannelRef.current = true;

        const { externalId } = data?.channel || {};

        if (externalId) {
          const channel = await Sendbird.getInstance().groupChannel.getChannel(externalId);

          setCurrentChannel(channel);

          const unreadMessagesCount = await Sendbird.unreadMessagesCount(externalId);

          setSendbirdState((prevState) => ({
            ...prevState,
            unreadMessagesCount
          }));

          setUnreadCount(0);

          const newMessages = await channel.getMessagesByTimestamp(new Date().getTime() + 5000, {
            prevResultSize: PREV_RESULT_SIZE,
            nextResultSize: 0
          });

          setState({
            messages: newMessages as CoreMessageType[],
            hasMorePrev: newMessages.length === 30,
            oldestMessageTimeStamp: newMessages[0]?.createdAt || new Date().getTime() + 5000
          });

          setPending(false);
        } else {
          setPending(false);
        }
      }
    }
  );

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
    isCamelAdminUser: boolean;
    productId: number;
    productStatus: number;
    isDeletedProduct: boolean;
  }>(() => {
    const { product, channel, channelUser, channelTargetUser, channelAppointments, userBlocks } =
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
      isCamelAdminUser: !!router.query.isCamelChannel || channel?.userId === 100,
      productId: product?.id || 0,
      productStatus: product?.status || 0,
      isDeletedProduct: product?.status === 3
    };
  }, [accessUser?.userId, router.query.isCamelChannel, useQueryResult.data]);
  const filteredMessages = useMemo(
    () =>
      messages.filter((message, index) => {
        if (!isAdminMessage(message)) return true;
        if (message.customType === 'reviewSent') return true;

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

  const hasSentMessage = useMemo(() => {
    if (useQueryResult.data?.isSentMessage) return true;
    if (filteredMessages.length >= 30) return true;

    if (currentChannel && !channelData.isSeller && filteredMessages.length < 30 && accessUser) {
      return filteredMessages.some(
        (filteredMessage) =>
          (filteredMessage as UserMessage | FileMessage).sender?.userId ===
          String(accessUser?.userId)
      );
    }

    return true;
  }, [
    accessUser,
    channelData.isSeller,
    filteredMessages,
    useQueryResult.data?.isSentMessage,
    currentChannel
  ]);

  const fetchPrevMessages = useCallback(async () => {
    try {
      prevScrollHeightRef.current = window.flexibleContent.scrollHeight;
      fetchingPrevMessagesRef.current = true;
      setIsPrevFetching(true);

      const newMessages = await currentChannel?.getMessagesByTimestamp(
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
      } else {
        setState((prevState) => ({ ...prevState, hasMorePrev: false }));
      }
    } catch {
      //
    } finally {
      setIsPrevFetching(false);
    }
  }, [currentChannel, oldestMessageTimeStamp]);

  const updateNewMessage = useCallback((msg: SendableMessage) => {
    setState((prevState) => ({
      ...prevState,
      messages: [
        ...prevState.messages.filter(({ messageId }) => messageId !== msg.messageId),
        msg
      ] as CoreMessageType[]
    }));
  }, []);

  useEffect(() => {
    StompJs.initialize(Number(id));
    setTimeout(() => {
      StompJs.subScribeChannel({
        channelId: Number(id),
        callback: () => {
          useQueryResult.refetch();
        }
      });
    }, 3000);

    return () => {
      StompJs.finalize();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 이전 메시지를 불러오기를 시도했을 때의 스크롤 위치를 유지하도록 처리
  useEffect(() => {
    if (fetchingPrevMessagesRef.current) {
      fetchingPrevMessagesRef.current = false;

      window.flexibleContent.scrollTo({
        top: window.flexibleContent.scrollHeight - prevScrollHeightRef.current
      });
    }
  }, [filteredMessages]);

  // 메시지 목록 컨테이너의 스크롤이 최하단에 위치한 경우 읽음 처리
  useEffect(() => {
    const handleScroll = async () => {
      const { scrollTop, clientHeight, scrollHeight } = window.flexibleContent;

      if (
        Math.ceil(scrollTop + clientHeight) >= scrollHeight &&
        currentChannel &&
        !pending &&
        !markAsReadingRef.current &&
        document.visibilityState === 'visible'
      ) {
        markAsReadingRef.current = true;

        currentChannel
          .markAsRead()
          .then(async () => {
            setUnreadCount(0);
            const unreadMessagesCount = await Sendbird.unreadMessagesCount();
            setSendbirdState((prevState) => ({
              ...prevState,
              unreadMessagesCount
            }));
          })
          .catch((error) => {
            logEvent('SUPPORT_ERROR', {
              name: 'MARK_AS_READ_FAIL',
              type: 'SENDBIRD',
              error
            });
          })
          .finally(() => {
            markAsReadingRef.current = false;
          });
      }
    };

    window.flexibleContent.addEventListener('scroll', handleScroll);

    return () => {
      window.flexibleContent.removeEventListener('scroll', handleScroll);
    };
  }, [setSendbirdState, pending, useQueryResult.data?.channel?.externalId, currentChannel]);

  // 메시지 목록 컨테이너의 스크롤이 하단 1/4 만큼 위치한 경우, 항상 최신 메시지를 볼 수 있도록 스크롤 처리
  useEffect(() => {
    if (senderUserId && senderUserId !== accessUser?.userId && !useQueryResult.isFetching) {
      const { scrollTop, clientHeight, scrollHeight } = window.flexibleContent;

      if (Math.ceil(scrollTop + clientHeight) >= scrollHeight - scrollHeight / 4) {
        window.flexibleContent.scrollTo({
          top: scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [senderUserId, accessUser, useQueryResult.isFetching, filteredMessages]);

  useEffect(() => {
    if (!accessUser?.userId || useQueryResult.isLoading || !useQueryResult.data) return;

    Sendbird.getInstance().removeConnectionHandler(String(accessUser?.userId || ''));
    Sendbird.getInstance().groupChannel?.removeGroupChannelHandler?.(
      String(accessUser?.userId || '')
    );

    Sendbird.getInstance().addConnectionHandler(
      String(accessUser?.userId || ''),
      new ConnectionHandler({
        onReconnectSucceeded: async () => {
          if (!useQueryResult.data?.channel?.externalId) return;
          const newChannel = await Sendbird.getInstance().groupChannel.getChannel(
            useQueryResult.data?.channel?.externalId || ''
          );
          setCurrentChannel(newChannel);
          newChannel.refresh().then(async () => {
            initializedChannelRef.current = false;
            await useQueryResult.refetch();
          });
        }
      })
    );
    Sendbird.getInstance().groupChannel?.addGroupChannelHandler?.(
      String(accessUser?.userId || ''),
      new GroupChannelHandler({
        onMessageReceived: async (channel, message) => {
          const unreadMessagesCount = await Sendbird.unreadMessagesCount();
          setSendbirdState((prevState) => ({
            ...prevState,
            unreadMessagesCount
          }));
          await useQueryResult.refetch();

          if (
            !compareIds(channel?.url, currentChannel?.url) ||
            messages.some((msg) => compareIds(msg.messageId, message.messageId))
          )
            return;

          if (!isProduction) console.log('Channel | onMessageReceived', message);

          setUnreadCount(unreadCount + 1);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          setSenderUserId((channel as GroupChannel).lastMessage.sender?.userId);
          setState((prevState) => ({
            ...prevState,
            messages: [
              ...prevState.messages.filter(({ messageId }) => messageId !== message.messageId),
              message
            ] as CoreMessageType[]
          }));
        },
        // before(onDeliveryReceiptUpdated)
        onChannelChanged: async (channel) => {
          const unreadMessagesCount = await Sendbird.unreadMessagesCount();
          setSendbirdState((prevState) => ({
            ...prevState,
            unreadMessagesCount
          }));
          await useQueryResult.refetch();

          if (compareIds(channel?.url, currentChannel?.url)) {
            if (!isProduction) console.log('Channel | onChannelChanged', channel);
          }
        },
        onUnreadMemberStatusUpdated: async (channel) => {
          const unreadMessagesCount = await Sendbird.unreadMessagesCount();
          setSendbirdState((prevState) => ({
            ...prevState,
            unreadMessagesCount
          }));

          if (compareIds(channel?.url, currentChannel?.url)) {
            if (!isProduction) console.log('Channel | onUnreadMemberStatusUpdated', channel);
            mutatePostHistoryManage({
              channelId: Number(router.query.id || ''),
              event: 'LAST_CHECK'
            });
            channel
              .getMessagesByTimestamp(new Date().getTime() + 5000, {
                prevResultSize: PREV_RESULT_SIZE,
                nextResultSize: 0
              })
              .then((baseMessages) => {
                setState((prevState) => ({
                  ...prevState,
                  messages: prevState.messages.map(
                    (prevMessage) =>
                      baseMessages.find(({ messageId }) => prevMessage.messageId === messageId) ||
                      prevMessage
                  ) as CoreMessageType[]
                }));
              });
          }
        }
      })
    );
  }, [
    accessUser,
    messages,
    mutatePostHistoryManage,
    router.query.id,
    setSendbirdState,
    useQueryResult,
    currentChannel,
    unreadCount
  ]);

  useEffect(() => {
    return () => {
      Sendbird.getInstance().removeConnectionHandler(String(accessUser?.userId || ''));
      Sendbird.getInstance().groupChannel?.removeGroupChannelHandler?.(
        String(accessUser?.userId || '')
      );
    };
  }, [accessUser]);

  return {
    useQueryChannel: useQueryResult,
    pending,
    channelData,
    sendbirdChannel: currentChannel,
    messages: filteredMessages,
    hasMorePrev,
    fetchPrevMessages,
    updateNewMessage,
    isPrevFetching,
    unreadCount,
    hasSentMessage
  };
}

export default useChannel;
