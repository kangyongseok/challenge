/* eslint-disable @typescript-eslint/ban-ts-comment,no-useless-escape */
import qs from 'qs';
import has from 'lodash-es/has';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { PRODUCT_NAME } from '@constants/product';
import { UTM_PARAMS } from '@constants/localStorage';

import type { UtmParams } from '@typings/common';

const originalStyle = {
  html: typeof document !== 'undefined' ? { ...document.documentElement.style } : undefined,
  body: typeof document !== 'undefined' ? { ...document.body.style } : undefined,
  top: 0
};

let lockedNum = 0;

export function checkAgent() {
  return {
    isMobileApp: () =>
      typeof window !== 'undefined' && window.navigator.userAgent.includes('MrcamelApp'),
    isAndroidApp: () =>
      typeof window !== 'undefined' && window.navigator.userAgent.match(/MrcamelApp.+ ANDROID/),
    isIOSApp: () =>
      typeof window !== 'undefined' && window.navigator.userAgent.match(/MrcamelApp.+ iOS/),
    isMobileWeb: () =>
      typeof window !== 'undefined' &&
      (window.navigator.userAgent.indexOf('Android') >= 0 ||
        window.navigator.userAgent.indexOf('iPhone') >= 0 ||
        window.navigator.userAgent.indexOf('iPad') >= 0),
    isAllMobileWeb: (userAgent?: string) => {
      let check = false;

      if (!userAgent) return check;

      // ref: http://detectmobilebrowser.com/mobile
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        check = true;
      } else if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          userAgent
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          userAgent.substring(0, 4)
        )
      ) {
        check = true;
      }

      return check;
    },
    isIOS: () =>
      typeof window !== 'undefined' &&
      (window.navigator.userAgent.indexOf('iPhone') >= 0 ||
        window.navigator.userAgent.indexOf('iPad') >= 0),
    isAndroid: () =>
      typeof window !== 'undefined' && window.navigator.userAgent.indexOf('Android') >= 0
  };
}

// checkAgent 이관
export function isMobileBrowser(userAgent?: string) {
  let check = false;

  if (!userAgent) return check;

  // ref: http://detectmobilebrowser.com/mobile
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    check = true;
  } else if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
      userAgent
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      userAgent.substring(0, 4)
    )
  ) {
    check = true;
  }

  return check;
}

export function removeTagAndAddNewLine(text: string) {
  /**
   * <br/> 태그가 있다면 \n으로 변경
   * 그외 다른 html 태그는 제거
   */
  try {
    return text.replace(/<\/?br[^>]*>/g, '\n').replace(/<\/?[a-zA-Z][^>]*>/g, '');
  } catch (_e) {
    return text;
  }
}

/**
 * @name getRandomNumber
 * @returns number
 * @example 123456
 */
export function getRandomNumber(length = 6) {
  return Number(
    Array.from({ length })
      .map((_) => Math.floor(Math.random() * 10) + 1)
      .join('')
  );
}

export function copyToClipboard(text: string) {
  if (!text) return false;

  if (navigator.clipboard) {
    // eslint-disable-next-line func-names
    return navigator.clipboard.writeText(text).catch(function (err) {
      throw err !== undefined
        ? err
        : new DOMException('The request is not allowed', 'NotAllowedError');
    });
  }

  const textArea = document.createElement('textarea');
  const selection = window.getSelection();
  const range = window.document.createRange();
  textArea.value = text;
  textArea.contentEditable = 'true';
  textArea.readOnly = false;
  textArea.style.whiteSpace = 'pre';
  textArea.style.position = 'absolute';
  textArea.style.left = '-1000px';
  textArea.style.top = '-1000px';

  document.body.appendChild(textArea);

  selection?.removeAllRanges();
  range.selectNode(textArea);
  selection?.addRange(range);

  const success = window.document.execCommand('copy');

  selection?.removeAllRanges();
  window.document.body.removeChild(textArea);

  return success;
}

export function handleClickAppDownload({
  productId,
  name,
  options
}: {
  productId?: number;
  name?: string;
  options?: { name: string; att: string };
}) {
  const utmParams = LocalStorage.get<UtmParams>(UTM_PARAMS);
  let oneLinkParams = '';
  let deepLinkParams = '';

  if (utmParams && has(utmParams, 'utmSource')) {
    oneLinkParams += `&af_ad_id=${utmParams.utmSource}`;
    deepLinkParams += `&utm_source=${utmParams.utmSource}`;
  }
  if (utmParams && has(utmParams, 'utmMedium')) {
    oneLinkParams += `&af_channel=${utmParams.utmCampaign}`;
    deepLinkParams += `&utm_medium=${utmParams.utmMedium}`;
  }
  if (utmParams && has(utmParams, 'utmCampaign')) {
    oneLinkParams += `&af_adset_id=${utmParams.utmCampaign}`;
    deepLinkParams += `&utm_campaign=${utmParams.utmCampaign}`;
  }
  if (utmParams && has(utmParams, 'utmTerm')) {
    oneLinkParams += `&af_keywords=${utmParams.utmTerm}`;
    deepLinkParams += `&utm_term=${utmParams.utmTerm}`;
  }
  if (utmParams && has(utmParams, 'utmContent')) {
    oneLinkParams += `&af_ad=${utmParams.utmCampaign}`;
    deepLinkParams += `&utm_content=${utmParams.utmContent}`;
  }

  logEvent('CLICK_APPDOWNLOAD', options);

  if (name === PRODUCT_NAME.PRODUCT_DETAIL) {
    window.location.href = `https://camel.onelink.me/gPbg?pid=mrcamel&c=moweb&deep_link_value=${encodeURIComponent(
      `mrcamel://view?view=product/${productId}&isCrm=true${deepLinkParams}`
    )}&af_dp=${encodeURIComponent(
      `mrcamel://view?view=product/${productId}&isCrm=true${deepLinkParams}`
    )}&af_adset=detail${oneLinkParams}`;
    return;
  }

  if (window.location.pathname === '/productList') {
    window.location.href =
      'https://camel.onelink.me/gPbg?pid=mrcamel&c=moweb' +
      `&deep_link_value=${encodeURIComponent(
        `mrcamel://view${window.location.search}&view=productList${deepLinkParams}`
      )}&af_dp=${encodeURIComponent(
        `mrcamel://view${window.location.search}&view=productList${deepLinkParams}`
      )}&af_adset=productList${oneLinkParams}`;
    return;
  }
  if (window.location.pathname === '/myPortfolio') {
    window.location.href = `https://camel.onelink.me/gPbg?pid=mrcamel&c=moweb&af_adset=portfolio${deepLinkParams}${oneLinkParams}`;
  }

  window.location.href = `https://camel.onelink.me/gPbg?pid=mrcamel&c=moweb&af_adset=not_detail${deepLinkParams}${oneLinkParams}`;
}

export function calculateExpectCountPerHour(count: number) {
  try {
    const numberOfAlarmasPerHour = Math.ceil((count * 0.05) / 24);
    return numberOfAlarmasPerHour > 0 ? numberOfAlarmasPerHour : 2;
  } catch (e) {
    return 2;
  }
}

/**
 * @name convertQueryStringByObject
 * @returns string QueryString 반환
 * @example '?parentIds=1&subParentUds=2&gender=male'
 */
export function convertQueryStringByObject(object: object, forcedPrefixIgnore = false) {
  return Object.keys(object)
    .map((key) => {
      const k = key as keyof object;
      if (!object[k]) return '';
      if (typeof object[k] === 'object' && Object.keys(object[k]).length === 0) return '';

      return `${key}=${encodeURIComponent(object[k])}`;
    })
    .filter((item) => item)
    .map((item, index) => {
      if (index === 0 && !forcedPrefixIgnore) {
        return `?${item}`;
      }

      return item;
    })
    .join('&');
}

export function convertStringToArray(value: string, separator?: string) {
  if (!value) return [];

  return value.split(separator || ',').map((splitValue) => Number(splitValue));
}

export function findChannelTalkButtonElement(): Promise<HTMLDivElement> {
  return new Promise((resolve, reject) => {
    let findTryCount = 0;

    const find = () =>
      setTimeout(() => {
        findTryCount += 1;

        if (findTryCount >= 100) {
          clearTimeout(find());
          reject();
        }

        const core = document.getElementById('ch-plugin-core');

        if (core) {
          const buttonElement: HTMLDivElement | null = core.querySelector('div');

          if (buttonElement) {
            clearTimeout(find());
            resolve(buttonElement);
          } else {
            find();
          }
        } else {
          find();
        }
      }, 300);

    find();
  });
}

export default function getCenterScrollLeft({
  scrollWidth,
  clientWidth,
  targetOffsetLeft,
  targetClientWidth
}: {
  scrollWidth: number;
  clientWidth: number;
  targetOffsetLeft: number;
  targetClientWidth: number;
}) {
  const targetLeft = targetOffsetLeft + targetClientWidth / 2;
  let scrollLeft = 0;

  if (targetLeft <= clientWidth / 2) {
    scrollLeft = 0;
  } else if (scrollWidth - targetLeft <= clientWidth / 2) {
    scrollLeft = scrollWidth - clientWidth;
  } else {
    scrollLeft = targetLeft - clientWidth / 2;
  }

  return scrollLeft;
}

export function getMetaDescription(description: string) {
  let byte = 0;
  let result = '';
  let overflow = false;

  for (let i = 0; i < description.length; i += 1) {
    if (byte > 92) {
      overflow = true;
      break;
    }

    if (description.charCodeAt(i) > 127) {
      byte += 2;
    } else {
      byte += 1;
    }

    result += description[i];
  }

  if (!result) result = description;

  return result.replace(/[\n|\r]/g, ' ') + (overflow ? '...' : '');
}

/**
 * @name getPageNameByPathName
 * @returns string
 * @example MAIN, PRODUCT_LIST, SEARCH
 */
export function getPageNameByPathName(pathname: string) {
  let pageName = 'NONE';

  if (pathname === '/') {
    pageName = 'MAIN';
  } else if (pathname === '/search') {
    pageName = 'SEARCHMODAL';
  } else if (pathname === '/category') {
    pageName = 'CATEGORY';
  } else if (pathname === '/ranking') {
    pageName = 'HOT';
  } else if (pathname === '/productList') {
    pageName = 'PRODUCT_LIST';
  } else if (pathname.indexOf('/product/') >= 0) {
    pageName = 'PRODUCT_DETAIL';
  } else if (pathname === '/brands') {
    pageName = 'BRAND';
  }

  return pageName;
}

export function scrollDisable() {
  const $html = document.documentElement;
  const $body = document.body;

  if (lockedNum === 0) {
    const scrollTop = $html.scrollTop || $body.scrollTop;

    originalStyle.body = { ...$body.style };
    originalStyle.html = { ...$html.style };
    originalStyle.top = scrollTop;

    if (isMobileBrowser()) {
      $html.style.height = '100%';
      $html.style.overflow = 'hidden';
      $body.style.top = `-${scrollTop}px`;
      $body.style.width = '100vw';
      $body.style.height = 'auto';
      $body.style.position = 'fixed';
    } else {
      const scrollBarWidth = window.innerWidth - $body.clientWidth;

      $body.style.paddingRight = `${scrollBarWidth}px`;
    }

    $body.style.overflow = 'hidden';
    // @ts-ignore
    $body.style['-webkit-overflow-scrolling'] = 'none';
    $body.style.touchAction = 'none';

    lockedNum += 1;
  }
}

export function scrollEnable() {
  if (lockedNum !== 1) return;

  lockedNum -= 1;

  const $html = document.documentElement;
  const $body = document.body;

  if (isMobileBrowser()) {
    $html.style.height = originalStyle.html?.height || '';
    $html.style.overflow = originalStyle.html?.overflow || '';

    ['top', 'width', 'height', 'overflow', 'position'].forEach((x) => {
      // @ts-ignore
      $body.style[x] = originalStyle.body[x] || '';
    });
  } else {
    ['overflow', 'boxSizing', 'paddingRight'].forEach((x) => {
      // @ts-ignore
      $body.style[x] = originalStyle.body[x] || '';
    });
  }

  $body.style.removeProperty('-webkit-overflow-scrolling');
  $body.style.removeProperty('touch-action');

  window.scrollTo(0, originalStyle.top);
}

export function getUtmParams() {
  /* eslint-disable camelcase */
  const {
    utm_source,
    media_source,
    utm_medium,
    af_channel,
    utm_campaign,
    campaign,
    utm_term,
    af_keywords,
    utm_content,
    af_ad
  } = qs.parse(window.location.search, { ignoreQueryPrefix: true }) || {};
  let utmParams: UtmParams = {};

  if (utm_source) {
    utmParams = {
      utmSource: String(utm_source).split(',')[0]
    };
  } else if (media_source) {
    utmParams = {
      ...utmParams,
      utmSource: String(media_source)
    };
  }

  if (utm_medium) {
    utmParams = {
      ...utmParams,
      utmMedium: String(utm_medium).split(',')[0]
    };
  } else if (af_channel) {
    utmParams = {
      ...utmParams,
      utmMedium: String(af_channel)
    };
  }

  if (utm_campaign) {
    utmParams = {
      ...utmParams,
      utmCampaign: String(utm_campaign).split(',')[0]
    };
  } else if (campaign) {
    utmParams = {
      ...utmParams,
      utmCampaign: String(campaign)
    };
  }

  if (utm_term) {
    utmParams = {
      ...utmParams,
      utmTerm: String(utm_term).split(',')[0]
    };
  } else if (af_keywords) {
    utmParams = {
      ...utmParams,
      utmTerm: String(af_keywords)
    };
  }

  if (utm_content) {
    utmParams = {
      ...utmParams,
      utmContent: String(utm_content).split(',')[0]
    };
  } else if (af_ad) {
    utmParams = {
      ...utmParams,
      utmContent: String(af_ad)
    };
  }

  return utmParams;
}

export const commaNumber = (value: number | string) => Number(value).toLocaleString();

/**
 * @name setCookie
 * @example setCookie('cookie-name', 'cookie-value', 1)
 */
export const setCookie = (name: string, value: string, day: number) => {
  const expire = new Date();
  expire.setDate(expire.getDate() + day);
  let cookies = `${name}=${escape(value)}; path=/ `; // 한글 깨짐을 막기위해
  if (typeof day !== 'undefined') cookies += `;expires=${expire.toUTCString()};`;
  document.cookie = cookies;
};

/**
 * @name getCookie
 * @return cookie-value: string
 * @example getCookie('cookie-name')
 */
export const getCookie = (name: string) => {
  let x;
  let y;
  const val = document.cookie.split(';');
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < val.length; i++) {
    x = val[i].substr(0, val[i].indexOf('='));
    y = val[i].substr(val[i].indexOf('=') + 1);
    x = x.replace(/^\s+|\s+$/g, ''); // 앞과 뒤의 공백 제거하기
    if (x === name) {
      return unescape(y);
      // unescape로 디코딩 후 값 리턴
    }
  }
  return '';
};
