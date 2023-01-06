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
    getChannelMessage: (message: string) => void; // Chat View Controller 내의 Message Bottom Fixed Input return value
    getPhotoAttach: (fileUrls: string[]) => void; // Chat View Controller 내 native camera/photoAlbum에서 선택한 파일을 S3에 저장후 fileUrl 리턴
    getRedirect: (parsedUrl: { pathname: string; redirectChannelUrl: string }) => void; // Chat View Controller 에서 전달한 url을 MainVC로 전달
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
      DATADOG_RUM_SERVICE: string;
      DATADOG_ALLOWED_TRACING_ORIGIN: string;
      SENDBIRD_APP_ID: string;
      SOCKET_SERVER_URL: string;
    }
  }
}
