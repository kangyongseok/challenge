import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { useRouter } from 'next/router';
import { Box, Flexbox, Typography, light, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import Image from '@components/UI/atoms/Image';

import type { FacebookAccount, FacebookLoginResponse } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { LAST_LOGIN_TYPE } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { ConvertUserSnsLoginInfoProps } from '@utils/login';
import { checkAgent } from '@utils/common';

import { LOGIN_TYPE } from 'pages/login';

interface LoginButtonListProps {
  authLogin: (provider: string, userSnsLoginInfo: ConvertUserSnsLoginInfoProps) => Promise<void>;
  returnUrl: string;
  setErrorPopup: Dispatch<SetStateAction<{ open: boolean; provider: string | null }>>;
  setShow: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  onClickNotLoginShow?: () => void;
  attName?: 'MODAL';
  disabledRecentLogin?: boolean;
}

function LoginButtonList({
  authLogin,
  returnUrl,
  setErrorPopup,
  setShow,
  setLoading,
  onClickNotLoginShow,
  attName,
  disabledRecentLogin
}: LoginButtonListProps) {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const [lastLoginType, setLastLoginType] = useState('');

  const kakaoLoginButtonRef = useRef<HTMLButtonElement | null>(null);

  const { openLogin } = router.query;

  const handleClickKakaoLogin = () => {
    logEvent(attrKeys.login.CLICK_LOGIN_SNS, {
      title: 'KAKAO',
      name: attName || attrProperty.name.GENERAL
    });

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
        setErrorPopup({
          open: true,
          provider: LOGIN_TYPE[provider as keyof typeof LOGIN_TYPE]
        });
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

  useEffect(() => {
    const savedLastLoginType = LocalStorage.get<string>(LAST_LOGIN_TYPE);

    if (savedLastLoginType) setLastLoginType(savedLastLoginType);
  }, []);

  useEffect(() => {
    if (openLogin === 'kakao' && window.Kakao?.isInitialized()) {
      kakaoLoginButtonRef.current?.click();
    }
  }, [openLogin]);

  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={8}
      customStyle={{ textAlign: 'center', paddingTop: disabledRecentLogin ? 32 : 0 }}
    >
      {!disabledRecentLogin && (
        <Typography variant="body2" weight="medium" customStyle={{ color: common.ui60 }}>
          {!disabledRecentLogin && lastLoginType.length > 0
            ? `( 최근 로그인 : ${LOGIN_TYPE[lastLoginType as keyof typeof LOGIN_TYPE]} )`
            : ''}
        </Typography>
      )}
      <KakaoLoginButton ref={kakaoLoginButtonRef} onClick={handleClickKakaoLogin}>
        <Image
          width={20}
          height={20}
          disableAspectRatio
          src={`https://${process.env.IMAGE_DOMAIN}/assets/img/login-kakao-icon.png`}
          alt="Kakao Logo Img"
        />
        <Typography variant="h4" weight="medium" customStyle={{ color: light.palette.common.ui20 }}>
          카카오톡으로 계속하기
        </Typography>
      </KakaoLoginButton>
      <FacebookLoginButton onClick={handleClickFacebookLogin}>
        <Image
          width={20}
          height={20}
          disableAspectRatio
          src={`https://${process.env.IMAGE_DOMAIN}/assets/img/login-facebook-icon.png`}
          alt="Kakao Logo Img"
        />
        <Typography variant="h4" weight="medium" customStyle={{ color: common.cmnW }}>
          페이스북으로 계속하기
        </Typography>
      </FacebookLoginButton>
      {checkAgent.isIOSApp() && (
        <AppleLoginButton onClick={handleClickAppleLogin}>
          <Image
            width={20}
            height={20}
            disableAspectRatio
            src={`https://${process.env.IMAGE_DOMAIN}/assets/img/login-apple-icon.png`}
            alt="Kakao Logo Img"
          />
          <Typography variant="h4" weight="medium">
            Apple로 계속하기
          </Typography>
        </AppleLoginButton>
      )}
      <Box
        customStyle={{ margin: disabledRecentLogin ? '12px 0 20px' : '12px 0 80px' }}
        onClick={() => {
          logEvent(attrKeys.login.CLICK_NONLOGIN);
          if (onClickNotLoginShow) {
            onClickNotLoginShow();
            return;
          }
          setShow(false);
          setTimeout(() => router.replace(returnUrl || '/'), 300);
        }}
      >
        <Typography variant="body1" weight="medium" customStyle={{ color: common.ui60 }}>
          로그인하지 않고 둘러보기
        </Typography>
      </Box>
    </Flexbox>
  );
}

const LoginButtonBase = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 54px;
  border-radius: 8px;
`;

const KakaoLoginButton = styled(LoginButtonBase)`
  background-color: #fee500;
`;

const FacebookLoginButton = styled(LoginButtonBase)`
  background-color: #5890ff;
`;

const AppleLoginButton = styled(LoginButtonBase)`
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.uiBlack};
`;

export default LoginButtonList;
