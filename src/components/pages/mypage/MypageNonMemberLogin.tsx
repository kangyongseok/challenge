import { ThemeProvider } from '@mrcamelhub/camel-ui';

import { LoginErrorDialog } from '@components/UI/organisms';
import { LoginButtonList, LoginMainContent } from '@components/pages/login';

import useSignIn from '@hooks/useSignIn';

function MypageNonMemberLogin() {
  const { setLoading, authLogin, successLogin, hasError, setHasError, errorProvider } = useSignIn({
    returnUrl: '/mypage'
  });

  return (
    <ThemeProvider theme="dark">
      <LoginMainContent mode="nonMemberInMyPage" />
      <LoginButtonList
        mode="nonMemberInMyPage"
        authLogin={authLogin}
        returnUrl="/mypage"
        successLogin={successLogin}
        setLoading={setLoading}
        disabledRecentLogin
      />
      <LoginErrorDialog
        variant={errorProvider ? 'provider' : 'common'}
        provider={errorProvider}
        open={hasError}
        onClose={() => setHasError(false)}
      />
    </ThemeProvider>
  );
}

export default MypageNonMemberLogin;
