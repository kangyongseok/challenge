import type { ChannelUser, User, UserBlock } from '@dto/user';
import type { ProductResult } from '@dto/product';
import { Order } from '@dto/order';
import type { Paged } from '@dto/common';

import type { channelType } from '@constants/channel';

export type Channel = {
  dateCreated: string;
  dateUpdated: string;
  externalId: string;
  id: number;
  isDeleted: boolean;
  productId: number;
  targetUserId: number;
  userId: number;
};

export type ChannelAppointmentResult = {
  channelId: number;
  dateAppointment: string;
  dateCreated: string;
  dateUpdated: string;
  id: number;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  isDeleted: boolean;
  notiTime: number;
  place: string;
  userId: number;
};

export type ChannelHistoryManage = {
  channelId: number;
  content: string;
  dateCreated: string;
  dateUpdated: string;
  event: string;
  id: number;
  isDeleted: boolean;
  name: string | null;
  title: string | null;
  userId: number;
};

export type UserReview = {
  content: string;
  dateCreated: string;
  dateUpdated: string;
  id: number;
  isDeleted: boolean;
  productId: number;
  score: string;
  targetUser: User;
  userId: number;
};

export interface ChannelDetail {
  channel: Channel | null;
  channelAppointments: ChannelAppointmentResult[] | null;
  channelTargetUser: ChannelUser | null;
  channelUser: ChannelUser | null;
  isTargetUserNoti: boolean;
  targetUserReview: UserReview | null;
  userReview: UserReview | null;
  product: ProductResult | null;
  orders: Order[];
  userBlocks: UserBlock[] | null;
  lastMessageManage: ChannelHistoryManage | null;
}

export type PageChannelDetail = Paged<ChannelDetail>;

/* ---------- Request Parameters ---------- */
export interface ChannelsParams {
  page?: number;
  size?: number;
  sort?: string[];
  type?: keyof typeof channelType; // 0: 전체, 1: 받은메세지, 2: 보낸메세지
  productId?: number;
}

export interface PostChannelData {
  productId: number;
  externalId: string;
}

export interface PostAppointmentData {
  channelId: number;
  dateAppointment: string;
  place: string;
  notiTime: number;
}

export type PutAppointmentData = PostAppointmentData;

export interface PostHistoryManageData {
  channelId: number;
  content?: string;
  event: string;
  name?: string;
  title?: string;
}
