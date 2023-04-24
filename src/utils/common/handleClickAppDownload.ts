import { has } from 'lodash-es';

import LocalStorage from '@library/localStorage';

import { PRODUCT_NAME } from '@constants/product';
import { UTM_PARAMS } from '@constants/localStorage';

import { UtmParams } from '@typings/common';

export function handleClickAppDownload({
  productId,
  name
}: // options
{
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

  // logEvent('CLICK_APPDOWNLOAD', options);

  if (name === PRODUCT_NAME.PRODUCT_DETAIL) {
    window.location.href = `https://camel.onelink.me/gPbg?pid=mrcamel&c=moweb&deep_link_value=${encodeURIComponent(
      `mrcamel://view?view=/products/${productId}&isCrm=true${deepLinkParams}`
    )}&af_dp=${encodeURIComponent(
      `mrcamel://view?view=/products/${productId}&isCrm=true${deepLinkParams}`
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
