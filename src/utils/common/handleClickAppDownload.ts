import { has } from 'lodash-es';

import LocalStorage from '@library/localStorage';

import { UTM_PARAMS } from '@constants/localStorage';

import { UtmParams } from '@typings/common';

export function handleClickAppDownload({
  productId,
  name = ''
}: {
  productId?: number;
  name?: string;
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

  if (name === 'PRODUCT_DETAIL') {
    window.location.href = `https://camel.onelink.me/gPbg?pid=mrcamel&c=moweb&deep_link_value=${encodeURIComponent(
      `mrcamel://view?view=/products/${productId}&isCrm=true${deepLinkParams}`
    )}&af_dp=${encodeURIComponent(
      `mrcamel://view?view=/products/${productId}&isCrm=true${deepLinkParams}`
    )}&af_adset=detail${oneLinkParams}&af_force_deeplink=true`;
    return;
  }

  if (name === 'MY_PORTFOLIO') {
    window.location.href = `https://camel.onelink.me/gPbg?pid=mrcamel&c=moweb&af_adset=portfolio${deepLinkParams}${oneLinkParams}&af_force_deeplink=true`;
    return;
  }

  if (
    ['PRODUCT_INQUIRY', 'PRODUCT_LIST', 'APP_FIRST_PAYMENT_EVENT', 'SEARCHMODAL'].includes(name)
  ) {
    const afAdSet = () => {
      let newAfAdSet = 'not_detail';
      if (name === 'PRODUCT_INQUIRY') {
        newAfAdSet = 'inquiry';
      } else if (name === 'PRODUCT_LIST') {
        newAfAdSet = 'products';
      } else if (name === 'APP_FIRST_PAYMENT_EVENT') {
        newAfAdSet = 'appFirstPaymentEvent';
      } else if (name === 'SEARCHMODAL') {
        newAfAdSet = 'search';
      }
      return newAfAdSet;
    };

    window.location.href = `https://camel.onelink.me/gPbg?pid=mrcamel&c=moweb&deep_link_value=${encodeURIComponent(
      `mrcamel://view?view=${window.location.pathname}${window.location.search}${deepLinkParams}`
    )}&af_dp=${encodeURIComponent(
      `mrcamel://view?view=${window.location.pathname}${window.location.search}${deepLinkParams}`
    )}&af_adset=${afAdSet()}${oneLinkParams}&af_force_deeplink=true`;
    return;
  }

  window.location.href = `https://camel.onelink.me/gPbg?pid=mrcamel&c=moweb&af_adset=not_detail${deepLinkParams}${oneLinkParams}&af_force_deeplink=true`;
}
