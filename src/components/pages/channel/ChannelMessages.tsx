import { useEffect, useMemo, useState } from 'react';
import type { MutableRefObject, UIEvent } from 'react';

import { useRouter } from 'next/router';
import { Box, Typography } from 'mrcamel-ui';
import debounce from 'lodash-es/debounce';
import dayjs from 'dayjs';
import type { AdminMessage, FileMessage, UserMessage } from '@sendbird/chat/message';
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import styled from '@emotion/styled';

import DateSeparator from '@components/UI/molecules/DateSeparator';
import ChannelMessage from '@components/pages/channel/ChannelMessage';

import { logEvent } from '@library/amplitude';

import {
  HEADER_HEIGHT,
  MESSAGE_ACTION_BUTTONS_HEIGHT,
  MESSAGE_APPOINTMENT_BANNER_HEIGHT,
  MESSAGE_NEW_MESSAGE_NOTIFICATION_HEIGHT,
  PRODUCT_INFORMATION_HEIGHT
} from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';
import { isAdminMessage } from '@utils/channel';

import type { MemorizedMessage } from '@typings/channel';

import ChannelAppointmentMessage from './ChannelAppointmentMessage';

interface ChannelMessagesProps {
  sendbirdChannel: GroupChannel;
  messages: MemorizedMessage[];
  productId: number;
  productStatus: number;
  isSeller: boolean;
  targetUserId: number;
  targetUserName: string;
  showAppointmentBanner: boolean;
  showNewMessageNotification: boolean;
  showActionButtons: boolean;
  messagesRef: MutableRefObject<HTMLDivElement | null>;
  hasMorePrev: boolean;
  fetchPrevMessages: () => Promise<void>;
  scrollToBottom(behavior?: ScrollBehavior): void;
}

function ChannelMessages({
  sendbirdChannel,
  messages,
  productId,
  productStatus,
  isSeller,
  targetUserId,
  targetUserName,
  showAppointmentBanner,
  showNewMessageNotification,
  showActionButtons,
  messagesRef,
  hasMorePrev,
  fetchPrevMessages,
  scrollToBottom
}: ChannelMessagesProps) {
  const router = useRouter();

  const [initialized, setInitialized] = useState(false);

  const memorizedAllMessages = useMemo(
    () =>
      messages.length > 0 ? (
        messages.map(
          (
            {
              message,
              appointment,
              userReview,
              isPushNoti,
              showChangeProductStatus,
              showAppointmentDetail
            },
            idx
          ) => {
            const previousMessage = messages[idx - 1]?.message;
            const previousAppointment = messages[idx - 1]?.appointment;
            const previousUserReview = messages[idx - 1]?.userReview;
            const nextMessage = messages[idx + 1]?.message;
            const previousCreatedAt =
              previousMessage?.createdAt ||
              previousAppointment?.dateCreated ||
              previousUserReview?.dateCreated;
            const currentCreatedAt =
              message?.createdAt || appointment?.dateCreated || userReview?.dateCreated;
            const hasSeparator = !(
              previousCreatedAt && dayjs(currentCreatedAt).isSame(previousCreatedAt, 'date')
            );

            const handleClickViewReviews = () => {
              logEvent(attrKeys.channel.CLICK_REVIEW_DETAIL, {
                name: attrProperty.name.CHANNEL_DETAIL,
                att: 'SEND'
              });

              if (checkAgent.isIOSApp()) {
                window.webkit?.messageHandlers?.callRedirect?.postMessage?.(
                  JSON.stringify({
                    pathname: `/userInfo/${targetUserId}?tab=reviews`,
                    redirectChannelUrl: router.asPath
                  })
                );
                return;
              }

              router.push({
                pathname: `/userInfo/${targetUserId}`,
                query: {
                  tab: 'reviews'
                }
              });
            };

            return !!message || !!appointment || !!userReview ? (
              <Box
                className="message-scroll"
                key={
                  (appointment && `appointment-message-${appointment.id}${Number(isPushNoti)}`) ||
                  (userReview && `userReview-message-${userReview.id}`) ||
                  `message-${message?.messageId || idx}`
                }
              >
                {hasSeparator && (
                  <DateSeparator customStyle={{ margin: '20px 0' }}>
                    {dayjs(currentCreatedAt).format('YYYY년 MM월 DD일')}
                  </DateSeparator>
                )}
                {!!message &&
                  (isAdminMessage(message) ? (
                    <AdminTextMessage variant="body2" weight="medium">
                      {(message as AdminMessage).message}
                    </AdminTextMessage>
                  ) : (
                    <ChannelMessage
                      sendbirdChannel={sendbirdChannel}
                      message={message as UserMessage | FileMessage}
                      nextMessage={nextMessage as UserMessage | FileMessage | undefined}
                    />
                  ))}
                {!!appointment && (
                  <ChannelAppointmentMessage
                    productId={productId}
                    status={productStatus}
                    appointment={appointment}
                    isPushNoti={isPushNoti}
                    showChangeProductStatus={showChangeProductStatus}
                    showAppointmentDetail={showAppointmentDetail}
                    isSeller={isSeller}
                    targetUserName={targetUserName}
                    isTargetUserSeller={!isSeller}
                  />
                )}
                {!!userReview && (
                  <AdminTextMessage variant="body2" weight="medium">
                    {`${isSeller ? '구매자' : '판매자'} ${targetUserName}에게 후기를 보냈어요. `}
                    <span onClick={handleClickViewReviews}>보낸 후기 보기</span>
                  </AdminTextMessage>
                )}
              </Box>
            ) : null;
          }
        )
      ) : (
        <DateSeparator customStyle={{ margin: '20px 0' }}>
          {dayjs(sendbirdChannel.createdAt).format('YYYY년 MM월 DD일')}
        </DateSeparator>
      ),
    [
      sendbirdChannel,
      isSeller,
      messages,
      productId,
      productStatus,
      router,
      targetUserId,
      targetUserName
    ]
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

const AdminTextMessage = styled(Typography)`
  color: ${({ theme: { palette } }) => palette.common.ui60};
  text-align: center;
  margin: 20px 0;

  span {
    text-decoration: underline;
  }
`;

export default ChannelMessages;
