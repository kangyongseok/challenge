import { useCallback, useEffect, useState } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { BottomSheet, Flexbox, Icon, Typography } from 'mrcamel-ui';
import omitBy from 'lodash-es/omitBy';
import isUndefined from 'lodash-es/isUndefined';
import amplitude from 'amplitude-js';
import { animated, useTransition } from '@react-spring/web';

import { LoginErrorDialog } from '@components/UI/organisms';
import { PuffLoader } from '@components/UI/atoms';
import { LoginButtonList } from '@components/pages/login';

import type { AppleAccount, FacebookAccount, KakaoAppAccount } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';
import Initializer from '@library/initializer';
import Axios from '@library/axios';
import { logEvent } from '@library/amplitude';

import { fetchKakaoAccount, postKakaoAccessToken } from '@api/userAuth';
import { fetchArea, fetchUserInfo, postAlarm, postArea } from '@api/user';
import { postAuthLogin } from '@api/nextJs';

import {
  ACCESS_TOKEN,
  ACCESS_USER,
  IS_DONE_SIGN_IN_PERMISSION,
  LAST_LOGIN_TYPE,
  SHOW_PRODUCTS_KEYWORD_POPUP,
  SIGN_UP_STEP
} from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { ConvertUserSnsLoginInfoProps, convertUserSnsLoginInfo } from '@utils/login';
import { checkAgent } from '@utils/common';

import type { FindLocation } from '@typings/common';
import { searchParamsState } from '@recoil/searchHelper';
import { loginBottomSheetState, toastState } from '@recoil/common';

export const LOGIN_TYPE = {
  kakao: '카카오톡',
  facebook: '페이스북',
  apple: '애플'
  // google: '구글',
  // naver: '네이버'
};

function LoginBottomSheet() {
  const router = useRouter();
  const [open, setOpen] = useRecoilState(loginBottomSheetState);
  const resetSearchParams = useResetRecoilState(searchParamsState);
  const setToastState = useSetRecoilState(toastState);
  const { mutate: mutatePostAlarm } = useMutation(postAlarm);
  const { mutate: mutatePostArea } = useMutation(postArea);
  const [loading, setLoading] = useState(false);
  const [errorPopup, setErrorPopup] = useState<{ open: boolean; provider: string | null }>({
    open: false,
    provider: null
  });
  const [show, setShow] = useState(true);
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
  const { code = '', state = '' } = router.query || {};
  const returnUrl = router.asPath;

  useEffect(() => {
    const attName = () => {
      if (router.query.keyword) return attrProperty.name.productList;
      if (router.query.id) return attrProperty.name.PRODUCT_DETAIL;
      if (router.pathname === '/') return attrProperty.name.MAIN;
      return '';
    };
    if (open) {
      logEvent(attrKeys.login.VIEW_LOGIN_MODAL, {
        name: attName(),
        title: attrProperty.title.WISH
      });
    }
  }, [open, router]);

  const transitions = useTransition(show, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  });

  const handleCloseLoginErrorDialog = useCallback(() => {
    setErrorPopup((prevState) => ({ ...prevState, open: false }));
    setTimeout(() => setErrorPopup({ open: false, provider: null }), 500);
  }, []);

  const updateUserArea = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { longitude, latitude } = position.coords;

        if (longitude > 0 || latitude > 0) {
          const { name, x, y } = await fetchArea({ x: String(longitude), y: String(latitude) });

          mutatePostArea(
            { name, x, y },
            {
              onSuccess: () =>
                router.replace(
                  state.includes('returnUrl')
                    ? JSON.parse(state as string).returnUrl
                    : (returnUrl as string)
                ),
              onError: () =>
                router.replace(
                  state.includes('returnUrl')
                    ? JSON.parse(state as string).returnUrl
                    : (returnUrl as string)
                )
            }
          );
        } else {
          router.replace(
            state.includes('returnUrl')
              ? JSON.parse(state as string).returnUrl
              : (returnUrl as string)
          );
        }
      },
      () => {
        router.replace(
          state.includes('returnUrl')
            ? JSON.parse(state as string).returnUrl
            : (returnUrl as string)
        );
      }
    );
  }, [mutatePostArea, returnUrl, router, state]);

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
        LocalStorage.set(ACCESS_USER, userSnsLoginResult.accessUser);
        LocalStorage.set(ACCESS_TOKEN, userSnsLoginResult.jwtToken);
        LocalStorage.set(LAST_LOGIN_TYPE, userSnsLoginResult.accessUser.snsType);
        Axios.setAccessToken(userSnsLoginResult.jwtToken);
        amplitude.getInstance().setUserId(String(userSnsLoginResult.accessUser.userId));
        Initializer.initAccessUserInAmplitude(amplitude.getInstance());
        Initializer.initAccessUserInBraze();

        fetchUserInfo().then((userInfo) => {
          const { personalStyle: { styles = [] } = {} } = userInfo || {};

          // 온보딩을 진행하지 않은 유저인 경우 온보딩 페이지로 이동
          if (styles.length === 0) {
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

          router.replace(
            state.includes('returnUrl')
              ? JSON.parse(state as string).returnUrl
              : (returnUrl as string)
          );
        });
        setLoading(false);
        setOpen(false);
        setToastState({
          type: 'bottomSheetLogin',
          status: 'loginSuccess'
        });
      } catch (error) {
        setLoading(false);
        setErrorPopup({ open: true, provider: null });
        logEvent(attrKeys.login.LOAD_LOGIN_SNS, {
          title: provider.toUpperCase(),
          att: 'FAIL',
          value: String(error)
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() => {
    logEvent(attrKeys.login.VIEW_LOGIN);

    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.KAKAO_JS_KEY);
    }
  }, []);

  useEffect(() => {
    if (open) {
      const getkakaoAuth = async () => {
        const provider = 'kakao';
        const { access_token: accessToken = '' } = await postKakaoAccessToken(code as string);
        const kakaoAccount = await fetchKakaoAccount(accessToken);

        await authLogin(provider, {
          accessToken,
          loginData: kakaoAccount,
          provider
        });
      };

      if (code) getkakaoAuth();
    }
  }, [authLogin, code, open]);

  useEffect(() => {
    if (open) {
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
          setErrorPopup({
            open: true,
            provider: LOGIN_TYPE[provider as keyof typeof LOGIN_TYPE]
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
          setErrorPopup({
            open: true,
            provider: LOGIN_TYPE[provider as keyof typeof LOGIN_TYPE]
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
          setErrorPopup({
            open: true,
            provider: LOGIN_TYPE[provider as keyof typeof LOGIN_TYPE]
          });
        }
      };

      window.getAuthPush = (result: boolean) => {
        if (result) mutatePostAlarm(true);
      };

      window.getAuthLocation = async ({ lng, lat }: FindLocation) => {
        if (lng || lat) {
          const { name, x, y } = await fetchArea({ x: lng, y: lat });

          mutatePostArea(
            { name, x, y },
            {
              onSuccess: () =>
                router.replace(
                  state.includes('returnUrl')
                    ? JSON.parse(state as string).returnUrl
                    : (returnUrl as string)
                ),
              onError: () =>
                router.replace(
                  state.includes('returnUrl')
                    ? JSON.parse(state as string).returnUrl
                    : (returnUrl as string)
                )
            }
          );
        } else {
          router.replace(
            state.includes('returnUrl')
              ? JSON.parse(state as string).returnUrl
              : (returnUrl as string)
          );
        }
      };
    }
  }, [authLogin, mutatePostAlarm, mutatePostArea, returnUrl, router, state, open]);

  return (
    <BottomSheet
      open={open}
      onClose={() => setOpen(false)}
      disableSwipeable
      customStyle={{ padding: '52px 20px 32px 20px', textAlign: 'center' }}
    >
      <Script
        id="facebook"
        dangerouslySetInnerHTML={{
          __html: `window.fbAsyncInit = function() {FB.init({ appId: "${process.env.FACEBOOK_APP_ID}", autoLogAppEvents: true, xfbml: true, version: "v14.0" });};`
        }}
      />
      <Script async defer crossOrigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js" />
      {(code || loading) && <PuffLoader />}
      {transitions(
        (styles, item) =>
          item && (
            <animated.div style={styles}>
              <Flexbox gap={10} alignment="center" justifyContent="center">
                <Icon name="Logo_45_45" width={36} height={31} />
                <Icon name="LogoText_96_20" width={124} height={31} />
              </Flexbox>
              <Typography customStyle={{ margin: '20px 0 ' }}>
                꿀매물과 가격변동 알림부터
                <br />내 주변, 내 사이즈 매물만 보기까지!
              </Typography>
              <Typography>로그인하고 득템하세요 🙌</Typography>
              <LoginButtonList
                authLogin={authLogin}
                returnUrl={returnUrl as string}
                setErrorPopup={setErrorPopup}
                setShow={setShow}
                setLoading={setLoading}
                onClickNotLoginShow={() => setOpen(false)}
                attName="MODAL"
                disabledRecentLogin
              />
            </animated.div>
          )
      )}
      <LoginErrorDialog
        open={errorPopup.open}
        onClose={handleCloseLoginErrorDialog}
        provider={errorPopup.provider ?? undefined}
      />
    </BottomSheet>
  );
}

export default LoginBottomSheet;
