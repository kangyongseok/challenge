import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Flexbox,
  Icon,
  Image,
  Input,
  Tooltip,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { LoginErrorDialog } from '@components/UI/organisms';

import type { FacebookAccount, FacebookLoginResponse, UserSnsLoginResult } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';
import Axios from '@library/axios';
import { logEvent } from '@library/amplitude';

import { postDevLogin } from '@api/nextJs';

import { LAST_LOGIN_TYPE } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { ConvertUserSnsLoginInfoProps } from '@utils/login';
import { checkAgent, isProduction } from '@utils/common';

import type { LoginMode } from '@typings/common';
import { productOpenNonMemberPaymentBottomSheetState } from '@recoil/product';
import {
  nonMemberCertificationFormState,
  nonMemberCertificationReSendState
} from '@recoil/nonMemberCertification/atom';
import useSession from '@hooks/useSession';

interface LoginButtonListProps {
  authLogin: (provider: string, userSnsLoginInfo: ConvertUserSnsLoginInfoProps) => Promise<void>;
  successLogin: (userSnsLoginResult: UserSnsLoginResult) => void;
  returnUrl?: string;
  setShow?: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  onClickNotLoginShow?: () => void;
  attName?: 'MODAL';
  mode?: LoginMode;
  disabledRecentLogin?: boolean;
}

function LoginButtonList({
  authLogin,
  successLogin,
  returnUrl = '',
  setShow,
  setLoading,
  onClickNotLoginShow,
  attName,
  mode = 'normal',
  disabledRecentLogin
}: LoginButtonListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    theme: {
      zIndex: { button },
      palette: { common }
    }
  } = useTheme();

  const { isLoggedInWithSMS } = useSession();

  const setOpenNonMemberPaymentBottomSheetState = useSetRecoilState(
    productOpenNonMemberPaymentBottomSheetState
  );
  const resetNonMemberCertificationFormState = useResetRecoilState(nonMemberCertificationFormState);
  const resetNonMemberCertificationReSendState = useResetRecoilState(
    nonMemberCertificationReSendState
  );

  const [lastLoginType, setLastLoginType] = useState('');
  const [error, setError] = useState(false);
  const [errorProvider, setErrorProvider] = useState('');

  const kakaoLoginButtonRef = useRef<HTMLButtonElement>(null);
  const nonMemberPaymentBottomSheetOpenTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const { openLogin, isRequiredLogin } = router.query;

  const handleCLickTestUserLogin = async () => {
    const testUserId = (document.getElementById('signIn') as HTMLInputElement).value || '';
    if (testUserId) {
      try {
        Axios.clearAccessToken();

        const userSnsLoginResult = await postDevLogin({ testUserId });
        successLogin(userSnsLoginResult);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('테스트 환경 로그인 실패', e);
      }
    }
  };

  const handleClickKakaoLogin = () => {
    logEvent(attrKeys.login.CLICK_LOGIN_SNS, {
      title: 'KAKAO',
      name: attName || attrProperty.name.GENERAL
    });

    queryClient.clear();

    if (checkAgent.isAndroidApp() && window.webview && window.webview.callLoginKakao) {
      window.webview.callLoginKakao();
      return;
    }

    if (
      checkAgent.isIOSApp() &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callLoginKakao
    ) {
      window.webkit.messageHandlers.callLoginKakao.postMessage(0);
      return;
    }

    setLoading(true);
    window.Kakao.Auth.authorize({
      redirectUri: process.env.KAKAO_LOGIN_REDIRECT_URL,
      state: `{"returnUrl": "${returnUrl}"}`
    });
  };

  const handleClickFacebookLogin = () => {
    logEvent(attrKeys.login.CLICK_LOGIN_SNS, {
      title: 'FACEBOOK',
      name: attName || attrProperty.name.GENERAL
    });

    queryClient.clear();

    const checkFacebookLoginState = (response: FacebookLoginResponse) => {
      const provider = 'facebook';

      if (response.authResponse) {
        window.FB.api(
          '/me',
          { fields: 'about,id,name,email,picture' },
          async (me: FacebookAccount) => {
            await authLogin(provider, {
              accessToken: response.authResponse.accessToken,
              loginData: me,
              provider
            });
          }
        );
      } else {
        logEvent(attrKeys.login.LOAD_LOGIN_SNS, { title: provider.toUpperCase(), att: 'FAIL' });
        setLoading(false);
        setError(true);
        setErrorProvider('facebook');
      }
    };

    if (checkAgent.isAndroidApp() && window.webview && window.webview.callLoginFacebook) {
      window.webview.callLoginFacebook();
    } else if (
      checkAgent.isIOSApp() &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callLoginFacebook
    ) {
      window.webkit.messageHandlers.callLoginFacebook.postMessage(0);
    } else if (window.FB.getLoginStatus) {
      window.FB.getLoginStatus((response: FacebookLoginResponse) => {
        setLoading(true);
        if (response.status === 'connected') {
          checkFacebookLoginState(response);
        } else {
          window.FB.login(checkFacebookLoginState, {
            scope: 'public_profile,email',
            return_scopes: false
          });
        }
      });
    }
  };

  const handleClickAppleLogin = () => {
    logEvent(attrKeys.login.CLICK_LOGIN_SNS, {
      title: 'APPLE',
      name: attName || attrProperty.name.GENERAL
    });

    queryClient.clear();

    if (checkAgent.isAndroidApp() && window.webview && window.webview.callLoginApple) {
      window.webview.callLoginApple();
    } else if (
      checkAgent.isIOSApp() &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callLoginApple
    ) {
      window.webkit.messageHandlers.callLoginApple.postMessage(0);
    }
  };

  const handleClickCancel = () => {
    logEvent(attrKeys.login.CLICK_NONLOGIN);

    if (onClickNotLoginShow) {
      onClickNotLoginShow();
      return;
    }

    if (setShow) {
      setShow(false);
      setTimeout(() => router.replace(isRequiredLogin ? '/' : returnUrl), 300);
    }
  };

  const handleClickNonMemberOrderCheck = () => {
    logEvent(attrKeys.login.CLICK_NOLOGIN, {
      title: attrProperty.title.ORDER
    });

    resetNonMemberCertificationFormState();
    resetNonMemberCertificationReSendState();

    if (isLoggedInWithSMS) {
      router.push('/mypage/nonMember/orders');
    } else {
      router.push('/mypage/nonMember/certification');
    }
  };

  const handleClickNonMemberPayment = () => {
    logEvent(attrKeys.login.CLICK_NOLOGIN, {
      title: attrProperty.title.PAYMENT
    });

    if (typeof onClickNotLoginShow === 'function') {
      onClickNotLoginShow();
    }

    if (nonMemberPaymentBottomSheetOpenTimerRef.current) {
      clearTimeout(nonMemberPaymentBottomSheetOpenTimerRef.current);
    }

    nonMemberPaymentBottomSheetOpenTimerRef.current = setTimeout(() => {
      setOpenNonMemberPaymentBottomSheetState(true);
    }, 500);
  };

  useEffect(() => {
    const savedLastLoginType = LocalStorage.get<string>(LAST_LOGIN_TYPE);

    if (savedLastLoginType) setLastLoginType(savedLastLoginType);
  }, []);

  useEffect(() => {
    if (openLogin === 'kakao' && window.Kakao?.isInitialized()) {
      kakaoLoginButtonRef.current?.click();
    }
  }, [openLogin]);

  useEffect(() => {
    if (nonMemberPaymentBottomSheetOpenTimerRef.current) {
      clearTimeout(nonMemberPaymentBottomSheetOpenTimerRef.current);
    }
  }, [router.pathname]);

  return (
    <>
      <Flexbox
        component="section"
        direction="vertical"
        gap={8}
        customStyle={{ textAlign: 'center' }}
      >
        {!isProduction && (
          <>
            <Button
              variant="solid"
              brandColor="black"
              size={mode === 'nonMember' ? 'large' : 'xlarge'}
              fullWidth
              onClick={() => LocalStorage.clear()}
            >
              로컬스토리지 All Clear
            </Button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCLickTestUserLogin();
              }}
            >
              <Input
                id="signIn"
                variant="solid"
                size={mode === 'nonMember' ? 'large' : 'xlarge'}
                placeholder="테스트 아이디를 입력해 주세요"
                endAdornment={
                  <Icon
                    name="DownloadFilled"
                    customStyle={{ cursor: 'pointer', transform: 'rotate(-90deg)' }}
                    onClick={handleCLickTestUserLogin}
                  />
                }
                fullWidth
              />
            </form>
          </>
        )}
        <TooltipWrapper>
          {lastLoginType === 'kakao' ? (
            <Tooltip
              open
              message="최근 로그인"
              customStyle={{ top: 'auto', bottom: mode === 'normal' ? -2 : -8, zIndex: button }}
            >
              <Button
                ref={kakaoLoginButtonRef}
                fullWidth
                startIcon={<Icon name="BrandKakaoFilled" color="cmnB" />}
                size={mode === 'nonMember' ? 'large' : 'xlarge'}
                onClick={handleClickKakaoLogin}
                customStyle={{
                  backgroundColor: '#fee500',
                  borderColor: 'transparent',
                  color: common.cmnB
                }}
              >
                카카오톡으로 계속하기
              </Button>
            </Tooltip>
          ) : (
            // <QuickLoginTooltip open message="⚡가장빨리 카멜을 만나는 법!">
            <Button
              ref={kakaoLoginButtonRef}
              fullWidth
              startIcon={<Icon name="BrandKakaoFilled" color="cmnB" />}
              size={mode === 'nonMember' ? 'large' : 'xlarge'}
              onClick={handleClickKakaoLogin}
              customStyle={{
                backgroundColor: '#fee500',
                borderColor: 'transparent',
                color: common.cmnB
              }}
            >
              카카오톡으로 계속하기
            </Button>
            // </QuickLoginTooltip>
          )}
        </TooltipWrapper>
        <TooltipWrapper>
          <Tooltip
            open={lastLoginType === 'facebook'}
            message="최근 로그인"
            customStyle={{ top: 'auto', bottom: mode === 'normal' ? -2 : -8, zIndex: button }}
          >
            <Button
              fullWidth
              startIcon={
                <Image
                  width={24}
                  height={24}
                  disableAspectRatio
                  src={`https://${process.env.IMAGE_DOMAIN}/assets/img/login-facebook-icon.png`}
                  alt="Facebook Logo Img"
                />
              }
              size={mode === 'nonMember' ? 'large' : 'xlarge'}
              onClick={handleClickFacebookLogin}
              customStyle={{
                backgroundColor: '#5890ff',
                borderColor: 'transparent',
                color: common.cmnW
              }}
            >
              페이스북으로 계속하기
            </Button>
          </Tooltip>
        </TooltipWrapper>
        {checkAgent.isIOSApp() && (
          <TooltipWrapper>
            <Tooltip
              open={lastLoginType === 'apple'}
              message="최근 로그인"
              customStyle={{ top: 'auto', bottom: mode === 'normal' ? -2 : -8, zIndex: button }}
            >
              <Button
                fullWidth
                variant="solid"
                size={mode === 'nonMember' ? 'large' : 'xlarge'}
                startIcon={<Icon name="BrandAppleFilled" color="uiWhite" />}
                onClick={handleClickAppleLogin}
                customStyle={{
                  backgroundColor: common.uiBlack,
                  borderColor: 'transparent',
                  color: common.uiWhite
                }}
              >
                Apple로 계속하기
              </Button>
            </Tooltip>
          </TooltipWrapper>
        )}
        {mode === 'normal' && (
          <Box
            customStyle={{ margin: disabledRecentLogin ? '12px 0 20px' : '12px 0 80px' }}
            onClick={handleClickCancel}
          >
            <Typography weight="medium" color="ui80">
              로그인하지 않고 둘러보기
            </Typography>
          </Box>
        )}
        {mode === 'nonMember' && (
          <TooltipWrapper
            css={{
              marginTop: 24
            }}
          >
            <Tooltip
              open
              message="로그인 없이 구매할 수 있어요!"
              customStyle={{ top: 'auto', bottom: -8, zIndex: button }}
            >
              <Button
                fullWidth
                variant="ghost"
                brandColor="black"
                size="large"
                onClick={handleClickNonMemberPayment}
              >
                비회원으로 결제하기
              </Button>
            </Tooltip>
          </TooltipWrapper>
        )}
        {mode === 'nonMemberInMyPage' && (
          <Button
            variant="ghost"
            brandColor="gray"
            size="large"
            fullWidth
            onClick={handleClickNonMemberOrderCheck}
            customStyle={{
              margin: '32px 0 120px',
              backgroundColor: common.bg01,
              textDecoration: 'underline'
            }}
          >
            비회원 주문조회
          </Button>
        )}
      </Flexbox>
      <LoginErrorDialog provider={errorProvider} open={error} onClose={() => setError(false)} />
    </>
  );
}

const TooltipWrapper = styled.div`
  & > div {
    width: 100%;
  }
`;

export default LoginButtonList;
