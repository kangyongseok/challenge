import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { find, groupBy } from 'lodash-es';
import dayjs from 'dayjs';
import type {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters
} from '@tanstack/react-query';
import { useIsFetching } from '@tanstack/react-query';
import type { AdminMessage, FileMessage, UserMessage } from '@sendbird/chat/message';
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import { Box, Chip, Icon } from '@mrcamelhub/camel-ui';

import DateSeparator from '@components/UI/molecules/DateSeparator';
import ChannelMessage from '@components/pages/channel/ChannelMessage';
import ChannelAdminMessage from '@components/pages/channel/ChannelAdminMessage';
import { ChannelAdminBlockMessage } from '@components/pages/channel';

import type { ProductOffer } from '@dto/productOffer';
import type { Order } from '@dto/order';
import type { ChannelDetail } from '@dto/channel';

import { isAdminMessage } from '@utils/channel';

import type { CoreMessageType } from '@typings/channel';

interface ChannelMessagesProps {
  sendbirdChannel: GroupChannel;
  messages: CoreMessageType[];
  productId: number;
  targetUserId: number;
  targetUserName: string;
  showNewMessageNotification: boolean;
  hasMorePrev: boolean;
  hasUserReview: boolean;
  hasTargetUserReview: boolean;
  isSeller: boolean;
  isTargetUserBlocked: boolean;
  isAdminBlockUser: boolean;
  orders: Order[];
  offers: ProductOffer[];
  status: number;
  unreadCount: number;
  isFocused: boolean;
  isPrevFetching: boolean;
  focusScrollY: number;
  fetchPrevMessages: () => Promise<void>;
  refetchChannel: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ChannelDetail, unknown>>;
  onClickSafePayment?: (e: MouseEvent<HTMLButtonElement>) => void;
  onClickUnreadCount?: () => void;
}

function ChannelMessages({
  sendbirdChannel,
  messages,
  productId,
  targetUserId,
  targetUserName,
  showNewMessageNotification,
  hasMorePrev,
  hasUserReview,
  isSeller,
  isTargetUserBlocked,
  isAdminBlockUser,
  orders,
  offers,
  status,
  unreadCount,
  isFocused,
  isPrevFetching,
  focusScrollY,
  fetchPrevMessages,
  refetchChannel,
  onClickSafePayment,
  onClickUnreadCount
}: ChannelMessagesProps) {
  const fetchingCount = useIsFetching();

  const [initialized, setInitialized] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const initScrollRef = useRef(false);
  const chipRef = useRef<HTMLButtonElement>(null);
  const scrollingTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const prevScrollHeightRef = useRef(0);

  const groupLastMessages = useMemo(() => {
    const groupMessage = groupBy(messages, (message) =>
      dayjs(message.createdAt).format('MMDDHHmm')
    );
    const groupMessageArr = Object.values(groupMessage);
    return groupMessageArr.map((arr) => arr[arr.length - 1]);
  }, [messages]);

  const memorizedAllMessages = useMemo(
    () =>
      messages.length > 0 ? (
        messages.map((message, idx) => {
          const previousMessage = messages[idx - 1];
          const nextMessage = messages[idx + 1];

          const previousSender = (messages[idx - 1] as UserMessage | FileMessage)?.sender?.userId;
          const nextSender = (messages[idx + 1] as UserMessage | FileMessage)?.sender?.userId;
          const currentSender = (message as UserMessage | FileMessage)?.sender?.userId;

          const previousCreatedAt = previousMessage?.createdAt;
          const currentCreatedAt = message?.createdAt;
          const hasSeparator = !(
            previousCreatedAt && dayjs(currentCreatedAt).isSame(previousCreatedAt, 'date')
          );
          const hasSameTimeMessage = !(
            previousCreatedAt && dayjs(currentCreatedAt).isSame(previousCreatedAt, 'minute')
          );
          const sameGroupLastMessage = !!find(groupLastMessages, { createdAt: currentCreatedAt });

          return message ? (
            <Box key={`message-${message.messageId}`}>
              {hasSeparator && (
                <DateSeparator customStyle={{ margin: '20px 0' }}>
                  {dayjs(currentCreatedAt).format('YYYY년 MM월 DD일')}
                </DateSeparator>
              )}
              {isAdminMessage(message) ? (
                <ChannelAdminMessage
                  sendbirdChannel={sendbirdChannel}
                  message={message as AdminMessage}
                  productId={productId}
                  targetUserId={targetUserId}
                  targetUserName={targetUserName}
                  refetchChannel={refetchChannel}
                  isSeller={isSeller}
                  orders={orders}
                  offers={offers}
                  hasUserReview={hasUserReview}
                  isTargetUserBlocked={isTargetUserBlocked}
                  isAdminBlockUser={isAdminBlockUser}
                  status={status}
                  onClickSafePayment={onClickSafePayment}
                />
              ) : (
                <ChannelMessage
                  sendbirdChannel={sendbirdChannel}
                  message={message as UserMessage | FileMessage}
                  nextMessage={nextMessage as UserMessage | FileMessage | undefined}
                  hasSameTimeMessage={hasSameTimeMessage || previousSender !== currentSender}
                  sameGroupLastMessage={sameGroupLastMessage || nextSender !== currentSender}
                />
              )}
              {isAdminBlockUser && <ChannelAdminBlockMessage message={message as AdminMessage} />}
            </Box>
          ) : null;
        })
      ) : (
        <DateSeparator customStyle={{ margin: '20px 0' }}>
          {dayjs(sendbirdChannel.createdAt).format('YYYY년 MM월 DD일')}
        </DateSeparator>
      ),
    [
      messages,
      sendbirdChannel,
      productId,
      targetUserId,
      targetUserName,
      refetchChannel,
      isSeller,
      orders,
      offers,
      hasUserReview,
      isTargetUserBlocked,
      isAdminBlockUser,
      status,
      onClickSafePayment,
      groupLastMessages
    ]
  );

  // 최초 로드 시 메시지 목록 컨테이너 스크롤이 최하단에 위치하도록 처리
  useEffect(() => {
    if (messages.length > 0 && !initialized) {
      window.flexibleContent.scrollTo({
        top: window.flexibleContent.scrollHeight
      });
      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // 메시지 목록 컨테이너 스크롤이 최상단에 위치할 경우 이전 메시지를 불러오도록 처리
  useEffect(() => {
    const handleScroll = async (e: Event) => {
      const { scrollTop, scrollHeight } = e.currentTarget as HTMLElement;

      if (scrollTop === 0) {
        if (!hasMorePrev || isPrevFetching) return;
        prevScrollHeightRef.current = scrollHeight;

        await fetchPrevMessages();
      }
    };

    window.flexibleContent.addEventListener('scroll', handleScroll);

    return () => {
      window.flexibleContent.removeEventListener('scroll', handleScroll);
    };
  }, [fetchPrevMessages, hasMorePrev, sendbirdChannel, showNewMessageNotification, isPrevFetching]);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = window.flexibleContent;

      if (Math.ceil(scrollTop + clientHeight) >= scrollHeight) {
        if (scrollingTimerRef.current) {
          clearTimeout(scrollingTimerRef.current);
        }
        setTranslateY(0);
        setIsScrolling(false);
        return;
      }

      setIsScrolling(true);

      if (scrollingTimerRef.current) {
        clearTimeout(scrollingTimerRef.current);
      }

      scrollingTimerRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 200);

      if (chipRef.current) {
        setTranslateY(window.flexibleContent.scrollTop + (isFocused ? focusScrollY : 0));
      }
    };

    window.flexibleContent.addEventListener('scroll', handleScroll);

    return () => {
      window.flexibleContent.removeEventListener('scroll', handleScroll);
    };
  }, [focusScrollY, isFocused]);

  useEffect(() => {
    if (!unreadCount) {
      setIsScrolling(false);
    } else if (chipRef.current) {
      setTranslateY(window.flexibleContent.scrollTop + (isFocused ? focusScrollY : 0));
    }
  }, [focusScrollY, isFocused, unreadCount]);

  // 최초 로드 시 메시지 목록 컨테이너 스크롤이 최하단에 위치하도록 처리 보완
  useEffect(() => {
    if (!fetchingCount && initialized && !initScrollRef.current) {
      initScrollRef.current = true;
      window.flexibleContent.scrollTo({
        top: window.flexibleContent.scrollHeight
      });
    }
  }, [fetchingCount, initialized]);

  return (
    <Box
      component="section"
      customStyle={{
        position: 'relative',
        padding: `${isFocused ? `${focusScrollY}px` : 0} 20px 0`,
        flexGrow: 1,
        userSelect: 'auto',
        '& *': {
          userSelect: 'auto'
        }
      }}
    >
      {unreadCount > 0 && (
        <Chip
          ref={chipRef}
          size="medium"
          variant="solid"
          isRound
          brandColor="blue"
          startIcon={<Icon name="Arrow1DownOutlined" />}
          customStyle={{
            position: 'absolute',
            top: 20,
            left: '50%',
            gap: 2,
            transform: `translate(-50%, ${isScrolling ? 0 : translateY}px)`,
            opacity: isScrolling ? 0 : 1,
            transition: 'transform 0.6s, opacity 0.2s',
            zIndex: 1
          }}
          onClick={onClickUnreadCount}
        >
          새 메세지 {unreadCount}개
        </Chip>
      )}
      {memorizedAllMessages}
    </Box>
  );
}

export default ChannelMessages;
