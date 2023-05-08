import { useEffect, useState } from 'react';

import Script from 'next/script';
import { useRouter } from 'next/router';
import { ThemeProvider } from 'mrcamel-ui';
import { animated, useTransition } from '@react-spring/web';
import styled from '@emotion/styled';

import PuffLoader from '@components/UI/atoms/PuffLoader';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { LoginButtonList, LoginMainContent, LoginUserAgreement } from '@components/pages/login';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import useSignIn from '@hooks/useSignIn';

function Login() {
  const router = useRouter();

  const returnUrl = String(router.query.returnUrl || '/');

  const { code, loading, setLoading, authLogin, successLogin } = useSignIn({ returnUrl });

  const [show, setShow] = useState(true);

  const transitions = useTransition(show, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  });

  useEffect(() => {
    logEvent(attrKeys.login.VIEW_LOGIN);
    document.body.className = 'dark';

    return () => {
      document.body.removeAttribute('class');
    };
  }, []);

  return (
    <>
      <Script src="https://developers.kakao.com/sdk/js/kakao.min.js" />
      <ThemeProvider theme="dark">
        {(code || loading) && <PuffLoader />}
        {transitions(
          (styles, item) =>
            item && (
              <animated.div style={styles}>
                <Wrapper>
                  <GeneralTemplate>
                    <LoginMainContent />
                    <LoginButtonList
                      authLogin={authLogin}
                      successLogin={successLogin}
                      returnUrl={returnUrl}
                      setShow={setShow}
                      setLoading={setLoading}
                    />
                    <LoginUserAgreement />
                  </GeneralTemplate>
                </Wrapper>
              </animated.div>
            )
        )}
      </ThemeProvider>
    </>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

export default Login;
