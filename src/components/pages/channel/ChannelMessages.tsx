import { useEffect, useMemo, useState } from 'react';
import type { MutableRefObject, UIEvent } from 'react';

import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from 'react-query';
import { Box } from 'mrcamel-ui';
import debounce from 'lodash-es/debounce';
import dayjs from 'dayjs';
import type { AdminMessage, FileMessage, UserMessage } from '@sendbird/chat/message';
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import styled from '@emotion/styled';

import DateSeparator from '@components/UI/molecules/DateSeparator';
import ChannelMessage from '@components/pages/channel/ChannelMessage';
import ChannelAdminMessage from '@components/pages/channel/ChannelAdminMessage';

import type { ChannelDetail } from '@dto/channel';

import {
  HEADER_HEIGHT,
  MESSAGE_ACTION_BUTTONS_HEIGHT,
  MESSAGE_APPOINTMENT_BANNER_HEIGHT,
  MESSAGE_NEW_MESSAGE_NOTIFICATION_HEIGHT,
  PRODUCT_INFORMATION_HEIGHT
} from '@constants/common';

import { isAdminMessage } from '@utils/channel';

import type { CoreMessageType } from '@typings/channel';

interface ChannelMessagesProps {
  sendbirdChannel: GroupChannel;
  messages: CoreMessageType[];
  productId: number;
  targetUserId: number;
  showAppointmentBanner: boolean;
  showNewMessageNotification: boolean;
  showActionButtons: boolean;
  messagesRef: MutableRefObject<HTMLDivElement | null>;
  hasMorePrev: boolean;
  fetchPrevMessages: () => Promise<void>;
  scrollToBottom(behavior?: ScrollBehavior): void;
  refetchChannel: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ChannelDetail, unknown>>;
}

function ChannelMessages({
  sendbirdChannel,
  messages,
  productId,
  targetUserId,
  showAppointmentBanner,
  showNewMessageNotification,
  showActionButtons,
  messagesRef,
  hasMorePrev,
  fetchPrevMessages,
  scrollToBottom,
  refetchChannel
}: ChannelMessagesProps) {
  const [initialized, setInitialized] = useState(false);

  const memorizedAllMessages = useMemo(
    () =>
      messages.length > 0 ? (
        messages.map((message, idx) => {
          const previousMessage = messages[idx - 1];
          const nextMessage = messages[idx + 1];
          const previousCreatedAt = previousMessage?.createdAt;
          const currentCreatedAt = message?.createdAt;
          const hasSeparator = !(
            previousCreatedAt && dayjs(currentCreatedAt).isSame(previousCreatedAt, 'date')
          );

          return message ? (
            <Box className="message-scroll" key={`message-${message.messageId}`}>
              {hasSeparator && (
                <DateSeparator customStyle={{ margin: '20px 0' }}>
                  {dayjs(currentCreatedAt).format('YYYY년 MM월 DD일')}
                </DateSeparator>
              )}
              {isAdminMessage(message) ? (
                <ChannelAdminMessage
                  message={message as AdminMessage}
                  productId={productId}
                  targetUserId={targetUserId}
                  refetchChannel={refetchChannel}
                />
              ) : (
                <ChannelMessage
                  sendbirdChannel={sendbirdChannel}
                  message={message as UserMessage | FileMessage}
                  nextMessage={nextMessage as UserMessage | FileMessage | undefined}
                />
              )}
            </Box>
          ) : null;
        })
      ) : (
        <DateSeparator customStyle={{ margin: '20px 0' }}>
          {dayjs(sendbirdChannel.createdAt).format('YYYY년 MM월 DD일')}
        </DateSeparator>
      ),
    [messages, sendbirdChannel, productId, targetUserId, refetchChannel]
  );

  const handleScroll = debounce((e: UIEvent<HTMLDivElement>) => {
    const element = e.target;
    const { clientHeight, scrollTop, scrollHeight } = element as HTMLDivElement;

    if (scrollTop === 0) {
      if (!hasMorePrev) return;

      fetchPrevMessages();
    }

    setTimeout(async () => {
      if (showNewMessageNotification && Math.round(clientHeight + scrollTop) >= scrollHeight) {
        try {
          await sendbirdChannel.markAsRead();
        } catch {
          //
        }
      }
    }, 500);
  }, 200);

  useEffect(() => {
    if (messages.length > 0 && !initialized) {
      scrollToBottom();
      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return (
    <FixedScroll className="messages" ref={messagesRef} onScroll={handleScroll}>
      <ScrollElement>
        <Content
          showAppointmentBanner={showAppointmentBanner}
          showNewMessageNotification={showNewMessageNotification}
        >
          {memorizedAllMessages}
          <Box
            customStyle={{ height: showActionButtons ? MESSAGE_ACTION_BUTTONS_HEIGHT + 8 : 0 }}
          />
        </Content>
      </ScrollElement>
    </FixedScroll>
  );
}

const FixedScroll = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  overflow: hidden scroll;
`;

const ScrollElement = styled.div`
  position: relative;
  width: 100%;
  height: auto;
`;

const Content = styled.div<{
  showAppointmentBanner: boolean;
  showNewMessageNotification: boolean;
}>`
  padding: ${({ showAppointmentBanner, showNewMessageNotification }) =>
    `${
      HEADER_HEIGHT +
      PRODUCT_INFORMATION_HEIGHT +
      (showAppointmentBanner ? MESSAGE_APPOINTMENT_BANNER_HEIGHT : 0) +
      (showNewMessageNotification ? MESSAGE_NEW_MESSAGE_NOTIFICATION_HEIGHT : 0)
    }px 16px 0px`};
  transition: all 0.3s;
  position: relative;
  width: 100%;
  overflow: hidden;
`;

export default ChannelMessages;