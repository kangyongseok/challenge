import type { QueryClient } from 'react-query';
import qs from 'qs';
import type { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { AmplitudeClient } from 'amplitude-js';

import type { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';
import Axios from '@library/axios';

import queryKeys from '@constants/queryKeys';
import { ACCESS_USER, UTM_PARAMS } from '@constants/localStorage';

import checkAgent from '@utils/checkAgent';

import type { UtmParams } from '@typings/common';

const Initializer = {
  initAccessTokenByCookies({ accessToken }: NextApiRequestCookies) {
    if (accessToken) Axios.setAccessToken(accessToken);
  },
  initAccessUserInQueryClientByCookies(
    { accessUser }: NextApiRequestCookies,
    queryClient: QueryClient
  ) {
    if (accessUser) {
      queryClient.setQueryData(
        queryKeys.userAuth.accessUser(),
        JSON.parse(decodeURIComponent(accessUser))
      );
    }
  },
  initAccessUserInQueryClient(queryClient: QueryClient) {
    const accessUser = LocalStorage.get<AccessUser>(ACCESS_USER);

    if (accessUser) {
      queryClient.setQueryData(queryKeys.userAuth.accessUser(), accessUser);
    }
  },
  initAccessUserInAmplitude(amplitudeClient: AmplitudeClient) {
    const accessUser = LocalStorage.get<AccessUser>(ACCESS_USER);

    if (!accessUser) return;

    const { userId, email, userName, snsType, area, gender, birthday, alarmAgree, adAgree } =
      accessUser;
    const properties = {
      userId,
      email,
      username: userName,
      sns_type: snsType,
      area,
      gender,
      birthday,
      alarm_agree: alarmAgree,
      ad_agree: adAgree
    };

    amplitudeClient.setUserProperties(properties);
  },
  initAccessUserInBraze() {
    const accessUser = LocalStorage.get<AccessUser>(ACCESS_USER);

    if (!accessUser) return;

    if (checkAgent.isAndroidApp() && window.webview && window.webview.callSetLoginUser) {
      window.webview.callSetLoginUser(JSON.stringify(accessUser));
    } else if (
      checkAgent.isIOSApp() &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callSetLoginUser
    ) {
      window.webkit.messageHandlers.callSetLoginUser.postMessage(JSON.stringify(accessUser));
    }
  },
  initUtmParams() {
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

    if (Object.keys(utmParams).length) LocalStorage.set(UTM_PARAMS, utmParams);
  }
};

export default Initializer;
