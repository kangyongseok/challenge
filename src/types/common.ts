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
  hideChannelButtonOnBoot: boolean;
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
  postfix: Record<Exclude<ABTestBelong, null>, string | number | null> &
    Partial<Record<'C', string | number | null>>;
  ratio: Record<Exclude<ABTestBelong, null>, number> & Partial<Record<'C', number>>;
  running: boolean;
  defaultBelong: Exclude<ABTestBelong, null>;
};

export type ABTestBelong = 'A' | 'B' | null;

export type ToastType =
  | 'common'
  | 'productsKeyword'
  | 'mapFilter'
  | 'product'
  | 'legitAdminOpinion'
  | 'legit'
  | 'legitProfile'
  | 'legitStatus'
  | 'bottomSheetLogin'
  | 'sellerProductState'
  | 'mypage'
  | 'home'
  | 'user'
  | 'channel'
  | 'event'
  | 'sendbird';

export type ToastStatus =
  | 'saved'
  | 'deleted'
  | 'restored'
  | 'limited'
  | 'autoSaved'
  | 'preConfirmEdited'
  | 'locationInfo'
  | 'signIn'
  | 'successCopy'
  | 'successReport'
  | 'successRemoveWish'
  | 'successAddWish'
  | 'disableUpload'
  | 'successAdminPreConfirmEdited'
  | 'hoisting'
  | 'reserve'
  | 'sell'
  | 'soldout'
  | 'hide'
  | 'successRequest'
  | 'loginSuccess'
  | 'overFiveStyle'
  | 'successEdit'
  | 'isAgree'
  | 'disAgree'
  | 'saleSuccess'
  | 'selfCamelProduct'
  | 'reviewReport'
  | 'reviewBlock'
  | 'channelNotiOn'
  | 'channelNotiOff'
  | 'agreeAlarm'
  | 'disAgreeAlarm'
  | 'agreeNight'
  | 'disAgreeNight'
  | 'notiOn'
  | 'notiOff'
  | 'settingError'
  | 'unBlock'
  | 'unBlockWithRole'
  | 'block'
  | 'report'
  | 'createFail'
  | 'successSendReview'
  | 'disabledMakeAppointment'
  | 'overLimitText'
  | 'undeLimitText'
  | 'duplicatedNickName'
  | 'invalidBanWord'
  | 'invalidAdminWord'
  | 'disableImageUpload'
  | 'savedProfileImage'
  | 'savedBackgroundImage'
  | 'onready'
  | 'savedChannelMessage';

export type DialogType =
  | 'SNSShare'
  | 'readyNextCrazyCuration'
  | 'closedCrazyCuration'
  | 'endCrazyCuration'
  | 'deleteLegitAdminOpinion'
  | 'deleteLegitResultComment'
  | 'deleteLegitResultReply'
  | 'legitRequestOnlyInApp'
  | 'legitRequestOnlyInIOS'
  | 'legitServiceNotice'
  | 'appUpdateNotice'
  | 'appAuthCheck'
  | 'legitPhotoGuide'
  | 'unblockBlockedUser'
  | 'leaveChannel'
  | 'blockUser'
  | 'confirmDeal'
  | 'successMakeAppointment'
  | 'cancelAppointment'
  | 'requiredAppUpdateForChat'
  | 'loginError'
  | 'loginProviderError'
  | 'deleteAccount'
  | 'featureIsMobileAppDown'
  | 'leaveEditProfile'
  | 'legitSampleGuid'
  | 'legitPermissionCheck'
  | 'leaveLegitRequest'
  | 'productSoldout'
  | 'productDelete'
  | 'productHidden'
  | 'productReservation'
  | 'locationInfo'
  | 'endEvent'
  | 'notiChannelFalse'
  | 'notiDeviceFalse'
  | 'requiredAppUpdateForSafePayment'
  | 'osAlarm';

export type ShareData = {
  title: string;
  description: string;
  image?: string;
  url: string;
};

export type ThemeMode = 'light' | 'dark' | 'system';

export type LegitOpinionType = 'authentic' | 'fake' | 'impossible' | 'legitIng';

export type AccessUserSettingValue = {
  userId: number;
  personalGuideBannerClose: boolean;
};

export interface LikeStyleSelectedModelDetail {
  name: string;
  id: number;
  styleId?: number;
  categoryId?: number;
}

export interface HomeSeasonBannerData {
  src: string;
  pathname: string;
  backgroundColor: string;
}

export type ProductGridCardVariant = 'gridA' | 'gridB' | 'gridC' | 'swipeX';
export type ProductListCardVariant = 'listA' | 'listB';

export interface UserTraceRecord {
  firstVisitDate: string;
  lastVisitDate: string;
  lastVisitDateDiffDay: number;
  pageViewCounts: {
    [page in UserTracePages]: number;
  };
  exitWishChannelType: 'exitProduct' | 'exitSearch';
}

export type UserTracePages = 'product' | 'exitProduct' | 'exitSearch';
