import React, { useEffect, useCallback } from 'react';
import Script from 'next/script';
import Image from 'next/image';
import Link from 'next/link';
import styled from '@emotion/styled';

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
        <Logo>
          <Image
            src="https://mrcamel.s3.ap-northeast-2.amazonaws.com/assets/img/login-logo.png"
            width={207}
            height={48}
            alt="Camel Logo Img"
          />
        </Logo>
        <Buttons>
          <KakaoLogin onClick={handleClick}>
            <Image
              width={20}
              height={20}
              src="https://mrcamel.s3.ap-northeast-2.amazonaws.com/assets/img/login-kakao-icon.png"
              alt="Kakao Logo Img"
            />
            카카오톡으로 계속하기
          </KakaoLogin>
          <LookAroundButton>
            <Link href="/">
              <a>로그인없이 검색하기</a>
            </Link>
          </LookAroundButton>
        </Buttons>
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

const Logo = styled.section`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 24px;
`;

const Buttons = styled.section`
  margin: 0 24px;
  text-align: center;
`;

const KakaoLogin = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 54px;
  background-color: #fee500;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: -0.2px;
  color: #000000;
`;

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
