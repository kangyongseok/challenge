export type AppBanner = {
  sessionId: number;
  counts: {
    IOSBUNJANG?: number;
    PURCHASE?: number;
    PRODUCT_LIST?: number;
    WISH?: number;
    PRODUCT_DETAIL?: number;
    WISH_LIST?: number;
  };
  isInit: boolean;
  lastAction: string;
  isClosed: boolean;
  mainCloseTime: string;
  mainType: number;
  isTooltipView: boolean;
  viewProductList: number[];
};

export type UtmParams = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
};

export type ChannelTalkBootOption = {
  pluginKey: string;
  trackDefaultEvent: boolean;
  mobileMessengerMode: string;
  zIndex: number;
  memberId?: number;
};

export type ChannelTalkUser = {
  id: string;
  memberId: string;
  name: string;
  avatarUrl: string;
  alert: number;
  profile: {
    name: string;
    mobileNumber: string;
    CUSTOM_VALUE_1: string;
    CUSTOM_VALUE_2: string;
  };
  unsubscribeEmail: boolean;
  unsubscribeTexting: boolean;
  tags: string[];
  language: string;
};

export type ChannelTalkUpdateUser = {
  language: string;
  profile: object;
  profileOnce: object;
};

export type FindLocation = {
  lng: string;
  lat: string;
};

export type ProductDealInfo = {
  userId: number;
  platform: { name: string; filename: string; weight: number };
  product: { name: string; state: string; price: number };
  time: number;
  timeUnit: string;
};
