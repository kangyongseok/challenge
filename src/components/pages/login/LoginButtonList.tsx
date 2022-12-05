import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Tooltip, Typography, light, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import Image from '@components/UI/atoms/Image';

import type { FacebookAccount, FacebookLoginResponse } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import queryKeys from '@constants/queryKeys';
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
  const queryClient = useQueryClient();
  const {
    theme: {
      zIndex: { button },
      palette: { common }
    }
  } = useTheme();
  const [lastLoginType, setLastLoginType] = useState('');

  const kakaoLoginButtonRef = useRef<HTMLButtonElement>(null);

  const { openLogin } = router.query;

  const handleClickKakaoLogin = () => {
    logEvent(attrKeys.login.CLICK_LOGIN_SNS, {
      title: 'KAKAO',
      name: attName || attrProperty.name.GENERAL
    });
    queryClient.invalidateQueries(queryKeys.personals.guideAllProducts(), {
      refetchInactive: true
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
    queryClient.invalidateQueries(queryKeys.personals.guideAllProducts(), {
      refetchInactive: true
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
    queryClient.invalidateQueries(queryKeys.personals.guideAllProducts(), {
      refetchInactive: true
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
      gap={12}
      customStyle={{ textAlign: 'center', paddingTop: disabledRecentLogin ? 32 : 0 }}
    >
      <TooltipWrapper>
        {lastLoginType === 'kakao' ? (
          <Tooltip
            open
            message="최근 로그인"
            customStyle={{ top: 'auto', bottom: -2, zIndex: button }}
          >
            <Button
              ref={kakaoLoginButtonRef}
              fullWidth
              startIcon={<Icon name="BrandKakaoFilled" color={common.cmnB} />}
              size="xlarge"
              onClick={handleClickKakaoLogin}
              customStyle={{ backgroundColor: '#fee500', color: common.cmnB }}
            >
              카카오톡으로 계속하기
            </Button>
          </Tooltip>
        ) : (
          <QuickLoginTooltip open message="⚡가장빨리 카멜을 만나는 법!">
            <Button
              ref={kakaoLoginButtonRef}
              fullWidth
              startIcon={<Icon name="BrandKakaoFilled" color={common.cmnB} />}
              size="xlarge"
              onClick={handleClickKakaoLogin}
              customStyle={{ backgroundColor: '#fee500', color: common.cmnB }}
            >
              카카오톡으로 계속하기
            </Button>
          </QuickLoginTooltip>
        )}
      </TooltipWrapper>
      <TooltipWrapper>
        <Tooltip
          open={lastLoginType === 'facebook'}
          message="최근 로그인"
          customStyle={{ top: 'auto', bottom: -2, zIndex: button }}
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
            size="xlarge"
            onClick={handleClickFacebookLogin}
            customStyle={{ backgroundColor: '#5890ff', color: common.cmnW }}
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
            customStyle={{ top: 'auto', bottom: -2, zIndex: button }}
          >
            <Button
              fullWidth
              variant="contained"
              size="xlarge"
              startIcon={<Icon name="BrandAppleFilled" color={common.cmnW} />}
              onClick={handleClickAppleLogin}
              customStyle={{
                backgroundColor: light.palette.common.ui20,
                color: common.cmnW
              }}
            >
              Apple로 계속하기
            </Button>
          </Tooltip>
        </TooltipWrapper>
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
        <Typography weight="medium" customStyle={{ color: common.ui80 }}>
          로그인하지 않고 둘러보기
        </Typography>
      </Box>
    </Flexbox>
  );
}

const TooltipWrapper = styled.div`
  & > div {
    width: 100%;
  }
`;

const QuickLoginTooltip = styled(Tooltip)`
  & > div {
    top: auto;
    bottom: -2px;
    background-color: ${light.palette.common.ui20};
    color: ${({
      theme: {
        palette: { common }
      }
    }) => common.cmnW};
    z-index: ${({ theme: { zIndex } }) => zIndex.button};
    & > svg {
      color: ${light.palette.common.ui20};
    }
  }
`;

export default LoginButtonList;
