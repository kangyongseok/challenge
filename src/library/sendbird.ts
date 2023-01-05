/* eslint-disable no-console */
import dayjs from 'dayjs';
import type {
  FailedMessageHandler,
  FileMessageCreateParams,
  MessageHandler,
  SnoozePeriod,
  UserMessageCreateParams,
  UserUpdateParams
} from '@sendbird/chat/lib/__definition';
import type {
  GroupChannel,
  GroupChannelCollectionEventHandler,
  GroupChannelCreateParams,
  MessageCollectionEventHandler,
  MessageCollectionInitResultHandler
} from '@sendbird/chat/groupChannel';
import {
  GroupChannelFilter,
  GroupChannelListOrder,
  GroupChannelModule,
  MessageCollectionInitPolicy,
  MessageFilter
} from '@sendbird/chat/groupChannel';
import SendbirdChat from '@sendbird/chat';

import { isProduction, wait } from '@utils/common';

import type { CreateChannelParams } from '@typings/channel';

const sb = SendbirdChat.init({
  appId: process.env.SENDBIRD_APP_ID,
  modules: [new GroupChannelModule()]
});

const SendBird = {
  getInstance() {
    return sb;
  },
  async initialize(userId: string, nickname: string, image?: string | null) {
    try {
      const user = await sb.connect(userId);
      const userUpdateParams: UserUpdateParams = { nickname };

      if (image) userUpdateParams.profileUrl = image;

      await sb.updateCurrentUserInfo(userUpdateParams);

      if (!isProduction) console.log('Sendbird initialized', { sb, user });
    } catch (error) {
      console.log('Sendbird error', error);
    }

    return sb;
  },
  async finalize() {
    try {
      await sb.disconnect();
    } catch {
      //
    }

    if (!isProduction) console.log('Sendbird finalized');
  },
  async unregister() {
    try {
      await sb.unregisterFCMPushTokenAllForCurrentUser();
    } catch {
      //
    }
    try {
      await sb.unregisterAPNSPushTokenAllForCurrentUser();
    } catch {
      //
    }

    if (!isProduction) console.log('Sendbird unRegistered');
  },
  async setBlockUser(userId: string, blockOn: boolean) {
    if (blockOn) {
      await sb.blockUserWithUserId(userId);
    } else {
      await sb.unblockUserWithUserId(userId);
    }
  },
  async loadChannels(channelHandler: GroupChannelCollectionEventHandler, channelUrls?: string[]) {
    const groupChannelFilter = new GroupChannelFilter();
    groupChannelFilter.includeEmpty = true;
    // groupChannelFilter.hiddenChannelFilter = HiddenChannelFilter.HIDDEN_ALLOW_AUTO_UNHIDE;

    if (channelUrls) groupChannelFilter.channelUrlsFilter = channelUrls;

    const collection = sb.groupChannel.createGroupChannelCollection({
      filter: groupChannelFilter,
      order: GroupChannelListOrder.LATEST_LAST_MESSAGE
    });
    collection.setGroupChannelCollectionHandler(channelHandler);

    const channels = await collection.loadMore();

    return { channels, collection };
  },
  async getCustomTypeChannels(customType: string) {
    const query = sb.groupChannel.createMyGroupChannelListQuery({
      includeEmpty: true,
      customTypesFilter: [customType]
    });
    const channels = await query.next();

    return channels;
  },
  async createChannel({
    userId,
    targetUserId,
    productId,
    productTitle,
    productImage
  }: CreateChannelParams): Promise<[GroupChannel | null, unknown | null]> {
    try {
      const groupChannelParams: GroupChannelCreateParams = {
        invitedUserIds: [userId, targetUserId],
        customType: productId,
        data: productTitle,
        coverUrl: productImage,
        isDistinct: false
      };

      const groupChannel = await sb.groupChannel.createChannel(groupChannelParams);

      return [groupChannel, null];
    } catch (error) {
      return [null, error];
    }
  },
  async hideChannel(channelUrl: string) {
    try {
      const channel = await sb.groupChannel.getChannel(channelUrl);

      await channel.hide({ hidePreviousMessages: false, allowAutoUnhide: true });

      return [channel, null];
    } catch (error) {
      return [null, error];
    }
  },
  async loadMessages(
    channelUrl: string,
    messageHandlers: MessageCollectionEventHandler,
    onCacheResult: MessageCollectionInitResultHandler,
    onApiResult: MessageCollectionInitResultHandler
  ) {
    const channel = await sb.groupChannel.getChannel(channelUrl);
    const messageFilter = new MessageFilter();
    const collection = channel.createMessageCollection({
      filter: messageFilter,
      startingPoint: Date.now()
    });

    collection.setMessageCollectionHandler(messageHandlers);
    collection
      .initialize(MessageCollectionInitPolicy.CACHE_AND_REPLACE_BY_API)
      .onCacheResult(onCacheResult)
      .onApiResult(onApiResult);

    return collection;
  },
  async unreadMessagesCount(channelUrl?: string, retry = 0): Promise<number> {
    let count = 0;

    try {
      if (channelUrl) {
        const channel = await sb.groupChannel.getChannel(channelUrl);

        count = channel.unreadMessageCount;
      } else {
        count = await sb.groupChannel.getTotalUnreadMessageCount();
      }
    } catch (e) {
      // eslint-disable-next-line no-param-reassign,no-plusplus
      retry++;

      if (retry < 3 && sb.connectionState === 'CLOSED') {
        await wait(1000);
        // eslint-disable-next-line no-return-await
        return await this.unreadMessagesCount(channelUrl, retry);
      }

      throw e;
    }

    return count;
  },
  async sendMessage({
    channelUrl,
    onPending,
    onSucceeded,
    onFailed,
    ...params
  }: {
    channelUrl: string;
    onPending?: MessageHandler;
    onSucceeded: MessageHandler;
    onFailed?: FailedMessageHandler;
  } & UserMessageCreateParams) {
    const channel = await sb.groupChannel.getChannel(channelUrl);

    channel
      .sendUserMessage(params)
      .onPending((message) => {
        if (onPending) onPending(message);
      })
      .onSucceeded((message) => {
        onSucceeded(message);
      })
      .onFailed((error, message) => {
        if (onFailed) onFailed(error, message);
      });
  },
  async sendFile({
    channelUrl,
    onPending,
    onSucceeded,
    onFailed,
    ...params
  }: {
    channelUrl: string;
    onPending?: MessageHandler;
    onSucceeded: MessageHandler;
    onFailed?: FailedMessageHandler;
  } & FileMessageCreateParams) {
    const channel = await sb.groupChannel.getChannel(channelUrl);

    channel
      .sendFileMessage(params)
      .onPending((message) => {
        if (onPending) onPending(message);
      })
      .onSucceeded((fileMessage) => {
        onSucceeded(fileMessage);
      })
      .onFailed((error, message) => {
        if (onFailed) onFailed(error, message);
      });
  },
  async sendFiles({
    channelUrl,
    paramsList,
    onPending,
    onSucceeded,
    onFailed
  }: {
    channelUrl: string;
    paramsList: FileMessageCreateParams[];
    onPending?: MessageHandler;
    onSucceeded: MessageHandler;
    onFailed?: FailedMessageHandler;
  }) {
    const channel = await sb.groupChannel.getChannel(channelUrl);

    channel
      .sendFileMessages(paramsList)
      .onPending((message) => {
        if (onPending) onPending(message);
      })
      .onSucceeded((fileMessage) => {
        onSucceeded(fileMessage);
      })
      .onFailed((error, message) => {
        if (onFailed) onFailed(error, message);
      });
  },
  async isSnoozedNotification(retry = 0): Promise<SnoozePeriod | undefined> {
    let snoozePeriod;

    try {
      snoozePeriod = await sb.getSnoozePeriod();
    } catch (e) {
      // eslint-disable-next-line no-param-reassign,no-plusplus
      retry++;

      if (retry < 3 && sb.connectionState === 'CLOSED') {
        await wait(1000);
        // eslint-disable-next-line no-return-await
        return await this.isSnoozedNotification(retry);
      }

      throw e;
    }

    return snoozePeriod;
  },
  async setSnoozeNotification(snoozeOn: boolean) {
    let snoozePeriod;

    if (sb.connectionState === 'CLOSED') return snoozePeriod;

    try {
      snoozePeriod = await sb.setSnoozePeriod(
        snoozeOn,
        +`${dayjs().format('YYYYMMDD')}00000`,
        +`${dayjs(new Date(2999, 11, 31)).format('YYYYMMDD')}00000`
      );
    } catch {
      //
    }

    return snoozePeriod;
  }
};

export default SendBird;
