/* eslint-disable @typescript-eslint/ban-ts-comment,no-console */
import type { SetterOrUpdater } from 'recoil';
import { isNaN } from 'lodash-es';
import dayjs from 'dayjs';
import type { AdminMessage, FileMessage, UserMessage } from '@sendbird/chat/message';
import { MessageType } from '@sendbird/chat/message';
import type { GroupChannel, GroupChannelCollectionEventHandler } from '@sendbird/chat/groupChannel';
import type { BaseChannel } from '@sendbird/chat';

import type { ChannelUser } from '@dto/user';
import type { ChannelHistoryManage } from '@dto/channel';

import Sendbird from '@library/sendbird';

import { fetchChannel } from '@api/channel';

import { SUPPORTED_MIMES } from '@constants/common';
import { messageStates, productStatus } from '@constants/channel';
import attrProperty from '@constants/attrProperty';

import { isProduction, truncateString } from '@utils/common';

import type { CoreMessageType } from '@typings/channel';
import type { SendbirdState } from '@recoil/channel';

export const getUnreadMessagesCount = (count: number): string => (count > 99 ? '+99' : `${count}`);

export const getChannelTitle = ({
  targetUser,
  groupChannel,
  isTargetUserBlocked,
  isAdminBlockUser,
  currentUserId
}: {
  targetUser: ChannelUser | null;
  groupChannel: GroupChannel | undefined;
  isTargetUserBlocked: boolean;
  isAdminBlockUser: boolean;
  currentUserId: string;
}): string => {
  if (targetUser) {
    let suffix = '';

    if (isTargetUserBlocked || isAdminBlockUser) suffix = ' (차단)';

    if (targetUser.user.isDeleted) suffix = ' (탈퇴)';

    if (targetUser.user.nickName || targetUser.user.name)
      return `${targetUser.user.nickName || targetUser.user.name}${suffix}`;

    return `회원${targetUser.user.id}${suffix}`;
  }

  if (!groupChannel?.name && !groupChannel?.members) return 'No title';

  if (groupChannel?.name && groupChannel.name !== 'Group Channel') return groupChannel.name;

  if (groupChannel?.members?.length === 1) return '(멤버 없음)';

  return (groupChannel?.members || [])
    .filter(({ userId }) => userId !== currentUserId)
    .map(({ nickname }) => nickname || '(이름 없음)')
    .join(', ');
};

export const getLastMessageCreatedAt = (
  lastMessageManage: ChannelHistoryManage | null,
  channel: GroupChannel | undefined
): string => {
  const createdAt = lastMessageManage?.dateUpdated || channel?.lastMessage?.createdAt;

  if (!createdAt) return '';

  const dateDiff = dayjs(createdAt).diff(dayjs(), 'day');

  return dayjs(createdAt).format(dateDiff < -1 ? 'MM월 DD일' : 'A hh:mm');
};

export const getLastMessage = (channel: GroupChannel | undefined): string => {
  if (!channel?.lastMessage) return '';

  const MAXLEN = 30;
  // @ts-ignore
  const { messageType, name = '', message } = channel.lastMessage;

  if (!isNaN(Number(message)) && messageType === 'admin') return '';
  return messageType === 'file' ? truncateString(name, MAXLEN) : message;
};

export const getUpdatedChannels = (
  currChannels: GroupChannel[],
  updatedChannel: GroupChannel | BaseChannel
) => {
  return JSON.parse(
    JSON.stringify(
      currChannels.map((currChannel) =>
        currChannel.url === updatedChannel.url ? updatedChannel : currChannel
      )
    )
  );
};

export const getOutgoingMessageState = (
  channel: GroupChannel | null,
  message: UserMessage | FileMessage
): string => {
  if (message.sendingStatus === 'pending') {
    return messageStates.pending;
  }

  if (message.sendingStatus === 'failed') {
    return messageStates.failed;
  }

  if (channel?.isGroupChannel?.()) {
    /* GroupChannel only */

    if ((channel as GroupChannel).getUnreadMemberCount?.(message) === 0) {
      return messageStates.read;
    }

    if ((channel as GroupChannel).getUndeliveredMemberCount?.(message) === 0) {
      return messageStates.delivered;
    }
  }

  if (message.sendingStatus === 'succeeded') {
    return messageStates.sent;
  }

  return messageStates.none;
};

export const getAppointmentDataFormat = (data: string): string =>
  `${data.substring(0, 4)}-${data.substring(4, 6)}-${data.substring(6, 8)}`;

export const getAppointmentTimeFormat = (time: string): string =>
  `${time.substring(0, 2)}:${time.substring(2, 4)}`;

export const getNotiTimeText = (notiTime: number): string => {
  if (notiTime === 0) return '알림 없음';

  if (notiTime === 60) return '1시간 전 알림';

  return `${notiTime}분 전 알림`;
};

export const isImage = (type: string): boolean => SUPPORTED_MIMES.IMAGE.indexOf(type) >= 0;
export const isVideo = (type: string): boolean => SUPPORTED_MIMES.VIDEO.indexOf(type) >= 0;
export const isGif = (type: string): boolean => type === 'image/gif';
export const isSupportedFileView = (type: string): boolean => isImage(type) || isVideo(type);
export const isAudio = (type: string): boolean => SUPPORTED_MIMES.AUDIO.indexOf(type) >= 0;

export const isAdminMessage = (message: AdminMessage | UserMessage | FileMessage): boolean =>
  !!message &&
  !!(
    message.isAdminMessage?.() ||
    (message.messageType && message.messageType === MessageType.ADMIN)
  );
export const isUserMessage = (message: AdminMessage | UserMessage | FileMessage): boolean =>
  !!message &&
  !!(
    message.isUserMessage?.() ||
    (message.messageType && message.messageType === MessageType.USER)
  );
export const isFileMessage = (message: AdminMessage | UserMessage | FileMessage): boolean =>
  !!message &&
  !!(
    message.isFileMessage?.() ||
    (message.messageType && message.messageType === MessageType.FILE)
  );

export const isOGMessage = (message: UserMessage): boolean =>
  !!(message && isUserMessage(message) && message?.ogMetaData && message?.ogMetaData?.url);
export const isTextMessage = (message: UserMessage): boolean =>
  isUserMessage(message) && !isOGMessage(message);
export const isThumbnailMessage = (message: FileMessage): boolean =>
  message && isFileMessage(message) && isSupportedFileView(message.type);
export const isImageMessage = (message: FileMessage): boolean =>
  message && isThumbnailMessage(message) && isImage(message.type);
export const isVideoMessage = (message: FileMessage): boolean =>
  message && isThumbnailMessage(message) && isVideo(message.type);
export const isGifMessage = (message: FileMessage): boolean =>
  message && isThumbnailMessage(message) && isGif(message.type);
export const isAudioMessage = (message: FileMessage): boolean =>
  message && isFileMessage(message) && isAudio(message.type);

export const getLogEventTitle = (status: number) => {
  if (productStatus[0] === productStatus[status as keyof typeof productStatus])
    return attrProperty.title.SALE;

  if (productStatus[4] === productStatus[status as keyof typeof productStatus])
    return attrProperty.title.RESERVED;

  return attrProperty.title.SOLD;
};

export const getLogEventAtt = (status: number) => {
  if (productStatus[0] === productStatus[status as keyof typeof productStatus]) return 'FORSALE';

  if (productStatus[4] === productStatus[status as keyof typeof productStatus]) return 'RESERVED';

  if (productStatus[8] === productStatus[status as keyof typeof productStatus]) return 'HIDE';

  return attrProperty.title.SOLD;
};

export const scrollIntoLast = (intialTry = 0) => {
  const MAX_TRIES = 20;
  const currentTry = intialTry;

  if (currentTry > MAX_TRIES) return;

  try {
    const scrollDOM = window.flexibleContent;
    const { clientHeight, scrollTop, scrollHeight } = scrollDOM;

    if (scrollDOM) {
      scrollDOM.scrollTo({
        top: scrollDOM.scrollHeight
      });

      if (Math.ceil(clientHeight + scrollTop) < scrollHeight) {
        setTimeout(() => {
          scrollIntoLast(currentTry + 1);
        }, 100 * currentTry);
      }
    }
  } catch {
    //
  }
};

// Some Ids return string and number inconsistently
// only use to comapre IDs
export const compareIds = (a: unknown, b: unknown) => {
  const isEmpty = (val: unknown) => val === null || val === undefined;

  if (isEmpty(a) || isEmpty(b)) return false;

  return String(a).toString() === String(b).toString();
};

export const getChannelHandler = ({
  channelsRefetch,
  setSendbirdState,
  setChannelsData
}: {
  channelsRefetch: () => void;
  setSendbirdState: SetterOrUpdater<SendbirdState>;
  setChannelsData: (channelId: number, lastMessageManage: ChannelHistoryManage | null) => void;
}): GroupChannelCollectionEventHandler => {
  const updateChannelsState = (stateChannels: GroupChannel[], incomingChannels: BaseChannel[]) => {
    return stateChannels.map((channel) => {
      const updatedChannel = incomingChannels.find(
        (incomingChannel) => incomingChannel.url === channel.url
      );

      if (updatedChannel) {
        const channelId = +((channel.lastMessage as CoreMessageType)?.customType || 0);

        if (channelId > 0) {
          fetchChannel(channelId).then((result) => {
            if (channelId === result.channel?.id) {
              setChannelsData(channelId, result.lastMessageManage);
            }
          });
        }
      }

      return updatedChannel || channel;
    });
  };

  return {
    onChannelsAdded: async (_, channels) => {
      if (!isProduction) console.log('Channels | onChannelsAdded::', { channels });
      channelsRefetch();
    },
    onChannelsUpdated: async (_, channels) => {
      const unreadMessagesCount = await Sendbird.unreadMessagesCount();

      setSendbirdState((currVal) => {
        const updatedAllChannels = updateChannelsState(currVal.allChannels, channels);
        const updatedReceivedChannels = updateChannelsState(currVal.receivedChannels, channels);
        const updatedSendChannels = updateChannelsState(currVal.sendChannels, channels);

        if (!isProduction)
          console.log('Channels | onChannelsUpdated::', {
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

      channelsRefetch();
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

        if (!isProduction)
          console.log('Channels | onChannelsDeleted::', {
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
  };
};

export const getCustomTypeMessage = (type: string) => {
  switch (type) {
    case 'orderSettleProgress':
      return '정산계좌로 영업일 기준 7일 이내에 판매대금이 입금예정이에요.';
    case 'orderRefundProgress':
      return '거래가 취소되어 등록된 정산계좌로 영업일 기준 2일 이내에 환불 예정입니다.';
    case 'orderDeliveryProgressWeek':
      return '구매한 매물을 받으셨나요? 매물을 잘 받으셨다면 구매확정 버튼을 눌러주세요.';
    case 'offerTimeout':
      return '가격제안이 시간초과로 거절되었어요';
    case 'orderPaymentComplete':
      return '판매자가 주문을 확인하면 거래가 진행됩니다.';
    case 'orderPaymentCancel':
      return '품절로 인해 가상계좌 결제가 취소되었어요.';
    case 'orderDeliveryProgress':
      return '배송이 시작되었어요. 배송현황을 배송조회를 클릭하여 확인해 주세요.';
    default:
      return type;
  }
};
