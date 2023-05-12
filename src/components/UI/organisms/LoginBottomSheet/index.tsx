import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { animated, useTransition } from '@react-spring/web';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { BottomSheet, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';

import { PuffLoader } from '@components/UI/atoms';
import { LoginButtonList } from '@components/pages/login';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { loginBottomSheetState } from '@recoil/common';
import useSignIn from '@hooks/useSignIn';

function LoginBottomSheet() {
  const router = useRouter();

  const toastStack = useToastStack();

  const [{ open, returnUrl }, setLoginBottomSheetState] = useRecoilState(loginBottomSheetState);

  const { code, loading, setLoading, authLogin, successLogin } = useSignIn({
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

  useEffect(() => {
    const attName = () => {
      if (router.query.keyword) return attrProperty.name.PRODUCT_LIST;
      if (router.query.id) return attrProperty.name.PRODUCT_DETAIL;
      if (router.pathname === '/') return attrProperty.name.MAIN;
      if (router.pathname === '/mypage') return attrProperty.name.MY;
      return '';
    };

    if (open) {
      logEvent(attrKeys.login.VIEW_LOGIN_MODAL, {
        name: attName(),
        title:
          returnUrl === '/camelSeller/registerConfirm'
            ? attrProperty.title.PRODUCT_MAIN
            : attrProperty.title.WISH
      });
    }
  }, [open, returnUrl, router]);

  return (
    <BottomSheet
      open={open}
      onClose={() => setLoginBottomSheetState({ open: false, returnUrl: '' })}
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
                disabledRecentLogin
              />
            </animated.div>
          )
      )}
    </BottomSheet>
  );
}

export default LoginBottomSheet;
