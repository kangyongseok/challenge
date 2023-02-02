import { useEffect, useState } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { BottomSheet, Flexbox, Icon, Typography } from 'mrcamel-ui';
import { animated, useTransition } from '@react-spring/web';

import { PuffLoader } from '@components/UI/atoms';
import { LoginButtonList } from '@components/pages/login';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { loginBottomSheetState, toastState } from '@recoil/common';
import useSignIn from '@hooks/useSignIn';

function LoginBottomSheet() {
  const router = useRouter();

  const [open, setOpen] = useRecoilState(loginBottomSheetState);
  const setToastState = useSetRecoilState(toastState);

  const returnUrl = router.asPath;

  const { code, loading, setLoading, authLogin, successLogin } = useSignIn({
    returnUrl,
    authLoginCallback() {
      setOpen(false);
      setToastState({
        type: 'bottomSheetLogin',
        status: 'loginSuccess'
      });
    }
  });

  const [show, setShow] = useState(true);

  const transitions = useTransition(show, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  });

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

  return (
    <BottomSheet
      open={open}
      onClose={() => setOpen(false)}
      disableSwipeable
      customStyle={{ padding: '52px 20px 32px 20px', textAlign: 'center' }}
    >
      {(code || loading) && <PuffLoader />}
      {transitions(
        (styles, item) =>
          item && (
            <animated.div style={styles}>
              <Flexbox gap={10} alignment="center" justifyContent="center">
                <Icon name="Logo_45_45" width={36} height={31} />
                <Icon name="LogoText_96_20" width={124} height={31} />
              </Flexbox>
              <Typography customStyle={{ margin: '20px 0' }}>
                꿀매물과 가격변동 알림부터
                <br />내 주변, 내 사이즈 매물만 보기까지!
              </Typography>
              <Typography
                customStyle={{
                  marginBottom: 32
                }}
              >
                로그인하고 득템하세요 🙌
              </Typography>
              <LoginButtonList
                authLogin={authLogin}
                successLogin={successLogin}
                returnUrl={returnUrl as string}
                setShow={setShow}
                setLoading={setLoading}
                onClickNotLoginShow={() => setOpen(false)}
                attName="MODAL"
                disabledRecentLogin
              />
            </animated.div>
          )
      )}
    </BottomSheet>
  );
}

export default LoginBottomSheet;
