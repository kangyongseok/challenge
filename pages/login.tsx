import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { animated, useTransition } from '@react-spring/web';
import { ThemeProvider } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { LoginErrorDialog } from '@components/UI/organisms';
import PuffLoader from '@components/UI/atoms/PuffLoader';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { LoginButtonList, LoginMainContent, LoginUserAgreement } from '@components/pages/login';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import useSignIn from '@hooks/useSignIn';

function Login() {
  const router = useRouter();

  const returnUrl = String(router.query.returnUrl || '/');

  const {
    code,
    loading,
    setLoading,
    authLogin,
    successLogin,
    hasError,
    setHasError,
    errorProvider
  } = useSignIn({
    returnUrl
  });

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
                  <LoginErrorDialog
                    variant={errorProvider ? 'provider' : 'common'}
                    provider={errorProvider}
                    open={hasError}
                    onClose={() => setHasError(false)}
                  />
                </GeneralTemplate>
              </Wrapper>
            </animated.div>
          )
      )}
    </ThemeProvider>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

export default Login;
