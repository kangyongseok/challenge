import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { animated, useTransition } from '@react-spring/web';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { BottomSheet, Box, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';

import { PuffLoader } from '@components/UI/atoms';
import { LoginButtonList } from '@components/pages/login';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { loginBottomSheetState } from '@recoil/common';
import useSignIn from '@hooks/useSignIn';

import LoginErrorDialog from '../LoginErrorDialog';

function LoginBottomSheet() {
  const router = useRouter();

  const toastStack = useToastStack();

  // mode 는 현재 매물 상세 페이지 비회원 결제하기 한정으로 사용되고 있으며 이에 따라 구현 됨, 추후 필요에 따라 확장
  // mode === 'nonMemberPayment', ProductNonMemberPaymentBottomSheet 컴포넌트가 import 되어있어야 사용 가능
  const [{ open, returnUrl, mode }, setLoginBottomSheetState] =
    useRecoilState(loginBottomSheetState);

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
    returnUrl: returnUrl || router.asPath,
    bottomSheet: true,
    authLoginCallback() {
      setLoginBottomSheetState({
        open: false,
        returnUrl: ''
      });
      toastStack({
        children: '로그인 되었습니다.'
      });
    }
  });

  const [show, setShow] = useState(true);

  const transitions = useTransition(show, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  });

  const handleClose = () => setLoginBottomSheetState({ open: false, returnUrl: '' });

  useEffect(() => {
    const getName = () => {
      if (router.query.keyword) return attrProperty.name.PRODUCT_LIST;
      if (router.query.id) return attrProperty.name.PRODUCT_DETAIL;
      if (router.pathname === '/') return attrProperty.name.MAIN;
      if (router.pathname === '/mypage') return attrProperty.name.MY;
      return '';
    };
    const getTitle = () => {
      if (returnUrl === '/camelSeller/registerConfirm') {
        return attrProperty.title.PRODUCT_MAIN;
      }
      if (mode?.indexOf('nonMember') !== -1) {
        return attrProperty.title.PAYMENT_WAIT;
      }
      return attrProperty.title.WISH;
    };

    if (open) {
      logEvent(attrKeys.login.VIEW_LOGIN_MODAL, {
        name: getName(),
        title: getTitle()
      });
    }
  }, [open, returnUrl, router, mode]);

  return (
    <>
      <BottomSheet
        open={open}
        onClose={handleClose}
        disableSwipeable
        customStyle={{ padding: '52px 20px 32px 20px', textAlign: 'center' }}
      >
        {(code || loading) && <PuffLoader />}
        {transitions(
          (styles, item) =>
            item && (
              <animated.div style={styles}>
                <Flexbox gap={6} alignment="center" justifyContent="center">
                  <Icon name="Logo_45_45" width={36} height={31} color="uiBlack" />
                  <Icon name="LogoText_96_20" width={96.8} height={20} color="uiBlack" />
                </Flexbox>
                {router.pathname === '/order/single/[id]' && (
                  <Typography variant="h4" customStyle={{ margin: '20px 0 0' }}>
                    카멜 안전결제를 처음 이용하면
                    <br />
                    <span style={{ fontWeight: 'bold', color: '#425BFF' }}>5,000</span>원을 드려요!
                  </Typography>
                )}
                <Box
                  customStyle={{
                    width: '100%',
                    minHeight: 52
                  }}
                />
                <LoginButtonList
                  authLogin={authLogin}
                  successLogin={successLogin}
                  returnUrl={(returnUrl as string) || router.asPath}
                  setShow={setShow}
                  setLoading={setLoading}
                  onClickNotLoginShow={() =>
                    setLoginBottomSheetState({
                      open: false,
                      returnUrl: ''
                    })
                  }
                  attName="MODAL"
                  mode={mode}
                  disabledRecentLogin
                />
              </animated.div>
            )
        )}
      </BottomSheet>
      <LoginErrorDialog
        variant={errorProvider ? 'provider' : 'common'}
        provider={errorProvider}
        open={hasError}
        onClose={() => setHasError(false)}
      />
    </>
  );
}

export default LoginBottomSheet;
