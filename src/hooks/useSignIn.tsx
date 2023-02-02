import { useCallback, useEffect, useMemo, useState } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { Typography, useTheme } from 'mrcamel-ui';
import omitBy from 'lodash-es/omitBy';
import isUndefined from 'lodash-es/isUndefined';
import amplitude from 'amplitude-js';

import type {
  AccessUser,
  AppleAccount,
  FacebookAccount,
  KakaoAppAccount,
  UserSnsLoginResult
} from '@dto/userAuth';

import LocalStorage from '@library/localStorage';
import Initializer from '@library/initializer';
import ChannelTalk from '@library/channelTalk';
import Axios from '@library/axios';
import { logEvent } from '@library/amplitude';

import { fetchKakaoAccount, postKakaoAccessToken } from '@api/userAuth';
import { fetchArea, fetchUserInfo, postArea } from '@api/user';
import { postAuthLogin } from '@api/nextJs';

import {
  ACCESS_TOKEN,
  ACCESS_USER,
  IS_DONE_SIGN_IN_PERMISSION,
  LAST_LOGIN_TYPE,
  ONBOARDING_SKIP_USERIDS,
  SHOW_PRODUCTS_KEYWORD_POPUP,
  SIGN_UP_STEP
} from '@constants/localStorage';
import attrKeys from '@constants/attrKeys';

import { ConvertUserSnsLoginInfoProps, convertUserSnsLoginInfo } from '@utils/login';
import { checkAgent } from '@utils/common';

import { FindLocation } from '@typings/common';
import { searchParamsState } from '@recoil/searchHelper';
import { dialogState } from '@recoil/common';
import useMutationPostAlarm from '@hooks/useMutationPostAlarm';

export const LOGIN_TYPE = {
  kakao: '카카오톡',
  facebook: '페이스북',
  apple: '애플'
  // google: '구글',
  // naver: '네이버'
};

interface useSignInProps {
  returnUrl: string;
  authLoginCallback?: () => void;
}

function useSignIn({ returnUrl, authLoginCallback }: useSignInProps) {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const {
    keyword,
    brandIds,
    parentIds,
    subParentIds,
    categorySizeIds,
    lineIds,
    minPrice,
    maxPrice,
    idFilterIds,
    siteUrlIds,
    colorIds,
    seasonIds,
    materialIds
  } = useRecoilValue(searchParamsState);
  const resetSearchParams = useResetRecoilState(searchParamsState);
  const setDialogState = useSetRecoilState(dialogState);

  const { mutate: mutatePostAlarm } = useMutationPostAlarm();
  const { mutate: mutatePostArea } = useMutation(postArea);

  const [loading, setLoading] = useState(false);

  const { code, state } = useMemo(
    () => ({
      code: String(router.query.code || ''),
      state: String(router.query.state || '')
    }),
    [router.query.code, router.query.state]
  );

  const updateUserArea = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { longitude, latitude } = position.coords;

        if (longitude > 0 || latitude > 0) {
          const { name, x, y } = await fetchArea({ x: String(longitude), y: String(latitude) });

          mutatePostArea(
            { name, x, y },
            {
              onSettled: () =>
                router.replace(
                  state.includes('returnUrl') ? JSON.parse(state).returnUrl : returnUrl
                )
            }
          );
        } else {
          router.replace(state.includes('returnUrl') ? JSON.parse(state).returnUrl : returnUrl);
        }
      },
      () => {
        router.replace(state.includes('returnUrl') ? JSON.parse(state).returnUrl : returnUrl);
      }
    );
  }, [mutatePostArea, returnUrl, router, state]);

  const successLogin = useCallback(
    (userSnsLoginResult: UserSnsLoginResult) => {
      LocalStorage.set(ACCESS_USER, userSnsLoginResult.accessUser);
      LocalStorage.set(ACCESS_TOKEN, userSnsLoginResult.jwtToken);
      LocalStorage.set(LAST_LOGIN_TYPE, userSnsLoginResult.accessUser.snsType);
      Axios.setAccessToken(userSnsLoginResult.jwtToken);
      amplitude.getInstance().setUserId(String(userSnsLoginResult.accessUser.userId));
      Initializer.initAccessUserInAmplitude(amplitude.getInstance());
      Initializer.initAccessUserInBraze();

      fetchUserInfo().then((userInfo) => {
        const userId = LocalStorage.get<AccessUser>(ACCESS_USER)?.userId;
        const skipUserIds = (LocalStorage.get(ONBOARDING_SKIP_USERIDS) as number[]) || [];

        if (!skipUserIds.includes(Number(userId)) && !userInfo.area.values.length) {
          LocalStorage.set(SIGN_UP_STEP, 0);
          router.replace('/onboarding?step=0');
          return;
        }
        // 앱설치 후 권한 요청을 받지 않은 유저의 경우 권한 요청
        if (!LocalStorage.get(IS_DONE_SIGN_IN_PERMISSION)) {
          LocalStorage.set(IS_DONE_SIGN_IN_PERMISSION, true);

          if (checkAgent.isAndroidApp()) {
            // window.webview.callAuthPush();
            // window.webview.callAuthLocation();
            // return;
          } else if (
            checkAgent.isIOSApp() &&
            window.webkit &&
            window.webkit.messageHandlers &&
            window.webkit.messageHandlers.callAuthPush &&
            window.webkit.messageHandlers.callAuthLocation
          ) {
            window.webkit.messageHandlers.callAuthPush.postMessage(0);
            window.webkit.messageHandlers.callAuthLocation.postMessage(0);
            return;
          } else {
            updateUserArea();
          }
        }

        // 검색집사 완료 후 매물목록 저장 유도 팝업을 통해 로그인 한 경우
        if (LocalStorage.get(SHOW_PRODUCTS_KEYWORD_POPUP)) {
          LocalStorage.remove(SHOW_PRODUCTS_KEYWORD_POPUP);
          router.replace({
            pathname: `/products/search/${keyword}`,
            query: omitBy(
              {
                brandIds,
                parentIds,
                subParentIds,
                categorySizeIds,
                lineIds,
                minPrice,
                maxPrice,
                idFilterIds,
                siteUrlIds,
                colorIds,
                seasonIds,
                materialIds
              },
              isUndefined
            )
          });
          resetSearchParams();
          return;
        }

        router.replace(state.includes('returnUrl') ? JSON.parse(state).returnUrl : returnUrl);
      });
      setLoading(false);
    },
    [
      brandIds,
      categorySizeIds,
      colorIds,
      idFilterIds,
      keyword,
      lineIds,
      materialIds,
      maxPrice,
      minPrice,
      parentIds,
      resetSearchParams,
      returnUrl,
      router,
      seasonIds,
      siteUrlIds,
      state,
      subParentIds,
      updateUserArea
    ]
  );

  const authLogin = useCallback(
    async (provider: string, userSnsLoginInfo: ConvertUserSnsLoginInfoProps) => {
      try {
        Axios.clearAccessToken();

        const userSnsLoginResult = await postAuthLogin({
          deviceId: amplitude.getInstance().getDeviceId(),
          userSnsLoginInfo: convertUserSnsLoginInfo(userSnsLoginInfo)
        });

        logEvent(attrKeys.login.LOAD_LOGIN_SNS, {
          title: provider.toUpperCase(),
          att: 'SUCCESS',
          successData: userSnsLoginInfo
        });

        successLogin(userSnsLoginResult);

        if (authLoginCallback) authLoginCallback();
      } catch (error) {
        setLoading(false);
        setDialogState({
          type: 'loginError',
          theme: 'dark',
          customStyle: { h4: { minWidth: 270 } },
          secondButtonAction() {
            ChannelTalk.showMessenger();
          }
        });
        logEvent(attrKeys.login.LOAD_LOGIN_SNS, {
          title: provider.toUpperCase(),
          att: 'FAIL',
          value: String(error)
        });
      }
    },
    [authLoginCallback, setDialogState, successLogin]
  );

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(process.env.KAKAO_JS_KEY);

    const facebookInitScript = document.createElement('script');
    facebookInitScript.id = 'facebook';
    facebookInitScript.innerHTML = `window.fbAsyncInit = function() {FB.init({ appId: "${process.env.FACEBOOK_APP_ID}", autoLogAppEvents: true, xfbml: true, version: "v14.0" });};`;

    const facebookConnectScript = document.createElement('script');
    facebookConnectScript.async = true;
    facebookConnectScript.defer = true;
    facebookConnectScript.crossOrigin = 'anonymous';
    facebookConnectScript.src = 'https://connect.facebook.net/en_US/sdk.js';

    document.head.appendChild(facebookInitScript);
    document.head.appendChild(facebookConnectScript);
  }, []);

  useEffect(() => {
    const getkakaoAuth = async () => {
      const provider = 'kakao';
      const { access_token: accessToken = '' } = await postKakaoAccessToken(code);
      const kakaoAccount = await fetchKakaoAccount(accessToken);

      await authLogin(provider, {
        accessToken,
        loginData: kakaoAccount,
        provider
      });
    };

    if (code) getkakaoAuth();
  }, [authLogin, code]);

  useEffect(() => {
    window.getKakaoToken = async (result: KakaoAppAccount) => {
      const provider = 'kakao';

      logEvent(attrKeys.login.SUBMIT_LOGIN_SNS, {
        title: provider.toUpperCase(),
        value: result
      });
      setLoading(true);

      if (result) {
        await authLogin(provider, {
          accessToken: result.access_token,
          loginData: result,
          provider: `${provider}App`
        });
      } else {
        logEvent(attrKeys.login.LOAD_LOGIN_SNS, {
          title: provider.toUpperCase(),
          att: 'FAIL'
        });
        setLoading(false);
        setDialogState({
          type: 'loginProviderError',
          theme: 'dark',
          content: (
            <Typography
              variant="body1"
              weight="medium"
              customStyle={{ minWidth: 270, textAlign: 'center' }}
            >
              {`${LOGIN_TYPE[provider as keyof typeof LOGIN_TYPE]} 로그인 오류가 발생했어요😰`}
              <br />
              다른 방법을 시도해 보세요.
            </Typography>
          ),
          customStyle: { button: { backgroundColor: common.cmn80 } }
        });
      }
    };

    window.getFacebookToken = async (result: FacebookAccount) => {
      const provider = 'facebook';

      logEvent(attrKeys.login.SUBMIT_LOGIN_SNS, {
        title: provider.toUpperCase(),
        value: result
      });
      setLoading(true);

      if (result) {
        await authLogin(provider, {
          accessToken: result.accessToken,
          loginData: result,
          provider
        });
      } else {
        logEvent(attrKeys.login.LOAD_LOGIN_SNS, {
          title: provider.toUpperCase(),
          att: 'FAIL'
        });
        setLoading(false);
        setDialogState({
          type: 'loginProviderError',
          theme: 'dark',
          content: (
            <Typography
              variant="body1"
              weight="medium"
              customStyle={{ minWidth: 270, textAlign: 'center' }}
            >
              {`${LOGIN_TYPE[provider as keyof typeof LOGIN_TYPE]} 로그인 오류가 발생했어요😰`}
              <br />
              다른 방법을 시도해 보세요.
            </Typography>
          ),
          customStyle: { button: { backgroundColor: common.cmn80 } }
        });
      }
    };

    window.getAppleToken = async (result: AppleAccount) => {
      const provider = 'apple';

      logEvent(attrKeys.login.SUBMIT_LOGIN_SNS, {
        title: provider.toUpperCase(),
        value: result
      });
      setLoading(true);

      if (result) {
        await authLogin(provider, {
          accessToken: result.access_token,
          loginData: result,
          provider
        });
      } else {
        logEvent(attrKeys.login.LOAD_LOGIN_SNS, {
          title: provider.toUpperCase(),
          att: 'FAIL'
        });
        setLoading(false);
        setDialogState({
          type: 'loginProviderError',
          theme: 'dark',
          content: (
            <Typography
              variant="body1"
              weight="medium"
              customStyle={{ minWidth: 270, textAlign: 'center' }}
            >
              {`${LOGIN_TYPE[provider as keyof typeof LOGIN_TYPE]} 로그인 오류가 발생했어요😰`}
              <br />
              다른 방법을 시도해 보세요.
            </Typography>
          ),
          customStyle: { button: { backgroundColor: common.cmn80 } }
        });
      }
    };

    window.getAuthPush = (result: boolean) => {
      if (result) {
        mutatePostAlarm({
          isNotiEvent: true,
          isNotiChannel: true
        });
      }
    };

    window.getAuthLocation = async ({ lng, lat }: FindLocation) => {
      if (lng || lat) {
        const { name, x, y } = await fetchArea({ x: lng, y: lat });

        mutatePostArea(
          { name, x, y },
          {
            onSuccess: () =>
              router.replace(state.includes('returnUrl') ? JSON.parse(state).returnUrl : returnUrl),
            onError: () =>
              router.replace(state.includes('returnUrl') ? JSON.parse(state).returnUrl : returnUrl)
          }
        );
      } else {
        router.replace(state.includes('returnUrl') ? JSON.parse(state).returnUrl : returnUrl);
      }
    };
  }, [
    authLogin,
    common.cmn80,
    mutatePostAlarm,
    mutatePostArea,
    returnUrl,
    router,
    setDialogState,
    state
  ]);

  return {
    code,
    loading,
    setLoading,
    authLogin,
    successLogin
  };
}

export default useSignIn;
