export const APP_DOWNLOAD_BANNER_HEIGHT = 48;
export const HEADER_HEIGHT = 56;
export const FACEBOOK_SHARE_URL = 'https://www.facebook.com/sharer/sharer.php';
export const TWITTER_SHARE_URL = 'https://twitter.com/share';
export const SEARCH_BAR_HEIGHT = 56;
export const BOTTOM_NAVIGATION_HEIGHT = 60;
export const GENERAL_FILTER_HEIGHT = 100;
export const CATEGORY_TAGS_HEIGHT = 39;
export const RELATED_KEYWORDS_HEIGHT = 52;
export const MOBILE_WEB_FOOTER_HEIGHT = 561;
export const APP_TOP_STATUS_HEIGHT = 44;
export const TAB_HEIGHT = 45;
export const PRODUCTS_LANDING_INFO_HEIGHT = 78;
export const PRODUCTS_KEYWORD_LANDING_INFO_HEIGHT = 102;
export const CMR_LANDING_INFO_HEIGHT = 72;
export const IMG_CAMEL_PLATFORM_NUMBER = 161;
export const PRODUCT_INFORMATION_HEIGHT = 65;
export const MESSAGE_INPUT_HEIGHT = 44;
export const MESSAGE_ACTION_BUTTONS_HEIGHT = 36;
export const MESSAGE_APPOINTMENT_BANNER_HEIGHT = 40;
export const MESSAGE_NEW_MESSAGE_NOTIFICATION_HEIGHT = 32;

export const locales = {
  ko: {
    lng: 'ko',
    name: '한국어'
  },
  en: {
    lng: 'en',
    name: 'English'
  }
};

export const purchaseType = [
  {
    icon: 'star_emoji',
    title: '상태',
    subTitle: '새것같은 중고를 원해요!',
    type: 'status',
    value: 10
  },
  {
    icon: 'money_emoji',
    title: '가격',
    subTitle: '최대한 싸게 사고싶어요!',
    type: 'price',
    value: 20
  },
  {
    icon: 'distance_emoji',
    title: '거리',
    subTitle: '중고는 무조건 직거래에요!',
    type: 'distance',
    value: 30
  }
];

export const globalSizeGroupId = [1, 3, 6, 8, 10];

export const CAMEL_SUBSET_FONTFAMILY =
  'Camel Product Sans Subset, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji';

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
export const SUPPORTED_MIMES = {
  IMAGE: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp' // not supported in IE
  ],
  VIDEO: ['video/mpeg', 'video/ogg', 'video/webm', 'video/mp4'],
  AUDIO: [
    'audio/aac',
    'audio/midi',
    'audio/x-midi',
    'audio/mpeg',
    'audio/ogg',
    'audio/opus',
    'audio/wav',
    'audio/webm',
    'audio/3gpp',
    'audio/3gpp2',
    'audio/mp3'
  ]
};
