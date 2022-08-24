import qs from 'qs';
import amplitude from 'amplitude-js';

import type { AccessUser } from '@dto/userAuth';

import Initializer from '@library/initializer';

import { postLog } from '@api/log';

import { ACCESS_USER, DEVICE_ID } from '@constants/localStorage';
import attrKeys from '@constants/attrKeys';

import checkAgent from '@utils/checkAgent';

import LocalStorage from './localStorage';

const isProduction = process.env.NODE_ENV === 'production';
const channelTalkLogging = process.env.CHANNEL_TALK_LOGGING;

interface SendApiEventParams {
  conversionId: number;
  id: string;
  source: string;
  getDeviceId: number;
}

interface AppsFlyerEventParams {
  id: number;
  price: number;
  parentCategory: string;
  parentId: number;
  keyword: string;
}

type FirstCategorys = {
  [x: number]: string;
};

const FIRST_CATEGORIES: FirstCategorys = {
  14: '신발',
  45: '가방',
  96: '악세서리',
  97: '상의',
  98: '지갑',
  104: '하의',
  119: '아우터',
  186: '기타',
  282: '원피스',
  283: '기타의류',
  284: '잡화'
};

const channelID = (eventName: string, eventParams: object) => {
  if (isProduction && channelTalkLogging && window.ChannelIO) {
    window.ChannelIO('track', eventName, eventParams);
  }
};

const MobileApp = {
  isAndroidApp: () => global.navigator.userAgent.match(/MrcamelApp.+ ANDROID/),
  isIOSApp: () => global.navigator.userAgent.match(/MrcamelApp.+ iOS/)
};

const getAppsflyerEventObjectByEventName = (
  eventName: string,
  eventParams: AppsFlyerEventParams
) => {
  let appsflyerEventObject = {
    name: '',
    parameter: {}
  };
  const {
    LOAD_LOGIN_SNS,
    SUBMIT_SEARCH,
    VIEW_PRODUCT_LIST,
    CLICK_PRODUCT_DETAIL,
    CLICK_PURCHASE,
    CLICK_WISH
  } = attrKeys.appsFlyerEvent;
  const { id, price, parentCategory, parentId, keyword } = eventParams;

  switch (eventName) {
    case LOAD_LOGIN_SNS:
      appsflyerEventObject = {
        name: 'af_login',
        parameter: {}
      };
      window.fbq('track', 'CompleteRegistration', {});
      break;
    case SUBMIT_SEARCH:
      appsflyerEventObject = {
        name: 'af_search',
        parameter: {
          af_search_string: keyword
        }
      };
      window.fbq('track', 'Search', {
        search_string: keyword
      });
      break;
    case VIEW_PRODUCT_LIST:
      appsflyerEventObject = {
        name: 'af_list_view',
        parameter: {}
      };
      break;
    case CLICK_PRODUCT_DETAIL:
      appsflyerEventObject = {
        name: 'af_content_view',
        parameter: {
          af_content_id: id,
          af_price: price,
          af_content_type: parentCategory,
          af_currency: 'KRW'
        }
      };
      window.fbq('track', 'ViewContent', {
        content_ids: id,
        content_category: parentCategory,
        currency: 'KRW',
        value: price
      });
      break;
    case CLICK_PURCHASE:
      appsflyerEventObject = {
        name: 'af_purchase',
        parameter: {
          af_content_id: id,
          af_price: price,
          af_revenue: price,
          af_content_type: FIRST_CATEGORIES[parentId],
          af_currency: 'KRW'
        }
      };
      window.fbq('track', 'Purchase', {
        content_ids: id,
        content_type: FIRST_CATEGORIES[parentId],
        currency: 'KRW',
        value: price
      });
      break;
    case CLICK_WISH:
      appsflyerEventObject = {
        name: 'af_add_to_wishlist',
        parameter: {
          af_content_id: id,
          af_price: price,
          af_content_type: FIRST_CATEGORIES[parentId],
          af_currency: 'KRW'
        }
      };
      window.fbq('track', 'AddToWishlist', {
        content_ids: id,
        content_category: FIRST_CATEGORIES[parentId],
        currency: 'KRW',
        value: price
      });
      break;
    default:
      break;
  }
  return appsflyerEventObject;
};

const sendLogApi = async (
  eventName: 'CLICK_SEND_MESSAGE' | 'CLICK_PURCHASE' | string,
  eventParams?: SendApiEventParams
) => {
  if (attrKeys.sendLogApiEvent.includes(eventName) && eventParams) {
    await postLog({
      type: eventName === attrKeys.sendLogApiEvent[0] ? 'SEND_MESSAGE' : 'PURCHASE',
      conversionId: eventParams.conversionId,
      target: eventParams.id,
      source: eventParams.source,
      deviceId: eventParams.getDeviceId
    });
  }
};

const commonEventBraze = (eventName: string, eventParams: object) => {
  if (Object.keys(attrKeys.commonEvent).includes(eventName)) {
    try {
      if (MobileApp.isAndroidApp()) {
        if (window.webview.callLoggingBraze) {
          window.webview.callLoggingBraze(eventName, `${JSON.stringify(eventParams)}`);
        }
      }
      if (MobileApp.isIOSApp()) {
        const isPostMessage =
          window.webkit.messageHandlers &&
          window.webkit.messageHandlers.callLoggingBraze &&
          window.webkit.messageHandlers.callLoggingBraze.postMessage;
        if (isPostMessage) {
          window.webkit.messageHandlers.callLoggingBraze.postMessage(
            `${JSON.stringify({
              ...eventParams,
              event: eventName
            })}`
          );
        }
      }
    } catch {
      //
    }
  }
};

const appsFlyerEvent = (eventName: string, eventParams: object) => {
  if (Object.keys(attrKeys.appsFlyerEvent).includes(eventName)) {
    const appsflyerEventObject = getAppsflyerEventObjectByEventName(
      eventName,
      eventParams as AppsFlyerEventParams
    );

    if (MobileApp.isAndroidApp() && window.webview.callLoggingAppsflyer) {
      window.webview.callLoggingAppsflyer(
        appsflyerEventObject.name,
        `${JSON.stringify(appsflyerEventObject.parameter)}`
      );
    }
    if (MobileApp.isIOSApp()) {
      const isPostMessage =
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.callLoggingAppsflyer &&
        window.webkit.messageHandlers.callLoggingAppsflyer.postMessage;

      if (isPostMessage) {
        window.webkit.messageHandlers.callLoggingAppsflyer.postMessage(
          `${JSON.stringify({
            ...appsflyerEventObject.parameter,
            event: appsflyerEventObject.name
          })}`
        );
      }
    }
  }
};

const returnPlatform = () => {
  const { userAgent } = qs.parse(window.location.search, { ignoreQueryPrefix: true }) || {};

  if (Number(userAgent) === 1) {
    return 'iOS';
  }
  if (Number(userAgent) === 2) {
    return 'Android';
  }

  if (checkAgent.isIOSApp()) return 'iOS';
  if (checkAgent.isAndroidApp()) return 'Android';
  return 'Web';
};

const initAmplitude = () => {
  const accessUser = LocalStorage.get<AccessUser>(ACCESS_USER);
  const userId = accessUser?.mrcamelId || accessUser?.userId;

  if (userId) {
    amplitude.getInstance().setUserId(String(userId));
  }

  amplitude.getInstance().setUserProperties({
    platform_agent: returnPlatform()
  });
  Initializer.initAccessUserInAmplitude(amplitude.getInstance());
};

export const logEvent = (eventName: string, eventParams?: object) => {
  try {
    amplitude.getInstance().logEvent(eventName, eventParams);
    channelID(eventName, eventParams as object);
    sendLogApi(eventName, eventParams as SendApiEventParams);
    commonEventBraze(eventName, eventParams as object);
    appsFlyerEvent(eventName, eventParams as object);
  } catch (error) {
    amplitude.getInstance().logEvent('AMPLITUDE_LOGGING_FAIL', {
      eventName,
      eventParams,
      message: String(error)
    });

    if (isProduction && window.ChannelIO) {
      window.ChannelIO('track', 'AMPLITUDE_LOGGING_FAIL', {
        eventName,
        eventParams,
        message: String(error)
      });
    }
  }
};

const Amplitude = {
  init() {
    amplitude.getInstance().init(
      process.env.AMPLITUDE_API_KEY,
      undefined,
      {
        includeReferrer: true,
        includeUtm: true,
        includeGclid: true
      },
      (client) => {
        LocalStorage.set(DEVICE_ID, client.getDeviceId());
        logEvent('LOAD_AMPLITUDE');
        try {
          logEvent('INIT_CONFIG');
          initAmplitude();
          logEvent('INIT_CONFIG_SUCCESS', {
            userAgent: window.navigator.userAgent
          });
        } catch (error) {
          logEvent('INIT_CONFIG_FAIL', {
            message: String(error)
          });
        }
      }
    );
  }
};

export default Amplitude;
