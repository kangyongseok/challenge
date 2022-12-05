/* eslint-disable @typescript-eslint/no-explicit-any,import/prefer-default-export */
export declare global {
  interface Window {
    Kakao: any;
    fbAsyncInit: any;
    FB: any;
    webview: any;
    webkit: any;
    ChannelIO: any;
    AndroidShareHandler: any;
    getPushState: any;
    getKakaoToken: any;
    getFacebookToken: any;
    getAppleToken: any;
    getAuthLocation: any;
    getAuthPush: any;
    getExecuteApp: any;
    fbq: any;
    gtag: any;
    callSetLoginUser: any;
    getPhotoGuide: any;
    getPhotoGuideDone: any;
    getLogEvent: any;
    getCameraAuth: any;
    chrome: any;
    getAuthPhotoLibrary: any;
    getAuthCamera: any;
    opera: any;
  }

  namespace NodeJS {
    interface ProcessEnv {
      API_BASE_URL: string;
      NEXT_JS_API_BASE_URL: string;
      AMPLITUDE_API_KEY: string;
      KAKAO_JS_KEY: string;
      KAKAO_REST_API_KEY: string;
      KAKAO_LOGIN_REDIRECT_URL: string;
      IMAGE_DOMAIN: string;
      CHANNEL_TALK_PLUGIN_KEY: string;
      CHANNEL_TALK_LOGGING: string;
      FACEBOOK_APP_ID: string;
      GOOGLE_JS_KEY: string;
      FACEBOOK_PIXEL_ID: string;
      GOOGLE_ANALYTICS_TRACKING_ID: string;
      DATADOG_RUM_APP_ID: string;
      DATADOG_RUM_CLIENT_TOKEN: string;
      DATADOG_RUM_ENV: string;
    }
  }
}
