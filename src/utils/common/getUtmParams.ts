import qs from 'qs';

import type { UtmParams } from '@typings/common';

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
