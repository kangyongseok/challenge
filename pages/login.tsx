import React, { useEffect, useCallback } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import styled from '@emotion/styled';

import { Flexbox, Typography, Icon } from 'mrcamel-ui';

import { SocialLoginButton } from '@components/pages/login';
import GeneralTemplate from '@components/templates/GeneralTemplate';

function Login() {
  const handleClick = useCallback(() => {
    window.Kakao.Auth.authorize({
      redirectUri: process.env.KAKAO_LOGIN_REDIRECT_URL
    });
  }, []);

  useEffect(() => {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.KAKAO_JS_KEY);
    }
  }, []);

  return (
    <>
      <Script src={process.env.KAKAO_SDK_URL} strategy="beforeInteractive" />
      <GeneralTemplate>
        <Flexbox
          direction="vertical"
          justifyContent="center"
          alignment="center"
          customStyle={{ flex: 1 }}
        >
          <Flexbox gap={10} alignment="center">
            <Icon name="Logo_45_45" width={47} height={47} />
            <Icon name="LogoText_96_20" width={150} height={35} />
          </Flexbox>
          <Flexbox
            gap={20}
            direction="vertical"
            alignment="center"
            customStyle={{ marginTop: 40, textAlign: 'center' }}
          >
            <Typography>
              <strong>꿀매물과 가격변동 알림</strong> 부터 내 주변,
              <br /> <strong>내 사이즈 매물만 보기까지!</strong>
            </Typography>
            <Typography variant="h4">로그인하고 득템하세요 🙌</Typography>
          </Flexbox>
        </Flexbox>
        <Flexbox direction="vertical" customStyle={{ textAlign: 'center' }}>
          <SocialLoginButton onClick={handleClick} />
          <LookAroundButton>
            <Link href="/">
              <a>로그인없이 검색하기</a>
            </Link>
          </LookAroundButton>
        </Flexbox>
        <AgreementHelp>
          가입/로그인은{' '}
          <Link href="/">
            <a>개인정보보호정책</a>
          </Link>{' '}
          및{' '}
          <Link href="/">
            <a>서비스약관</a>
          </Link>
          에 동의하는 것을 의미합니다.
        </AgreementHelp>
      </GeneralTemplate>
    </>
  );
}

const LookAroundButton = styled.button`
  margin: 29px 0 47px 0;
  font-size: 14px;
  font-weight: 700;
  color: #999999;
`;

const AgreementHelp = styled.p`
  margin: 0 24px 32px 24px;
  text-align: center;
  font-size: 10px;
  font-weight: 400;
  color: #999999;

  & > a {
    text-decoration: underline;
  }
`;

export default Login;
