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

export type ABTestTask = {
  name: string;
  slot: 'test_type_01' | 'test_type_02';
  postfix: Record<Exclude<ABTestBelong, null>, string | number | null>;
  ratio: Record<Exclude<ABTestBelong, null>, number>;
  running: boolean;
  defaultBelong: Exclude<ABTestBelong, null>;
};

export type ABTestBelong = 'A' | 'B' | null;

export type ToastType = 'productsKeyword' | 'mapFilter' | 'product';

export type ToastStatus =
  | 'saved'
  | 'deleted'
  | 'restored'
  | 'limited'
  | 'autoSaved'
  | 'locationInfo'
  | 'signIn'
  | 'successCopy'
  | 'successReport'
  | 'successRemoveWish'
  | 'successAddWish';

export type DialogType =
  | 'SNSShare'
  | 'readyNextCrazyCuration'
  | 'closedCrazyCuration'
  | 'endCrazyCuration';

export type ShareData = {
  title: string;
  description: string;
  image?: string;
  url: string;
};
