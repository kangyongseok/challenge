import type { AdminMessage, FileMessage, UserMessage } from '@sendbird/chat/message';
import type { User } from '@sendbird/chat';

import type { ChannelAppointmentResult, UserReview } from '@dto/channel';

export type CreateChannelParams = {
  userId: string;
  targetUserId: string;
  productId: string;
  productTitle: string;
  productImage: string;
};

export interface ClientMessage {
  reqId: string;
  file?: File;
  localUrl?: string;
  _sender: User;
}

export interface ClientUserMessage extends UserMessage, ClientMessage {}
export interface ClientFileMessage extends FileMessage, ClientMessage {}
export interface ClientAdminMessage extends AdminMessage, ClientMessage {}
export type CoreMessageType = ClientUserMessage | ClientFileMessage | ClientAdminMessage;
export type ClientSentMessages = ClientUserMessage | ClientFileMessage;

export type MemorizedMessage = {
  message: CoreMessageType | undefined;
  appointment: ChannelAppointmentResult | undefined;
  userReview: UserReview | undefined;
  isPushNoti: boolean;
  showChangeProductStatus: boolean;
  showAppointmentDetail: boolean;
};
