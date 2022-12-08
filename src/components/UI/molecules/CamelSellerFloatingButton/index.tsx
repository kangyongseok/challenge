import { useEffect, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Icon } from 'mrcamel-ui';

import LocalStorage from '@library/localStorage';
import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { CAMEL_SELLER } from '@constants/localStorage';
import { PRODUCT_CREATE } from '@constants/camelSeller';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent, getAppVersion, isProduction } from '@utils/common';

import type { CamelSellerLocalStorage } from '@typings/camelSeller';
import { dialogState } from '@recoil/common';
import { camelSellerDialogStateFamily } from '@recoil/camelSeller';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import { FloatingButton } from './CamelSellerFloatingButton.style';

function CamelSellerFloatingButton() {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();
  const setOpenAppDown = useSetRecoilState(camelSellerDialogStateFamily('nonMemberAppdown'));
  const setDialogState = useSetRecoilState(dialogState);
  const setContinueDialog = useSetRecoilState(camelSellerDialogStateFamily('continue'));
  const { data: { roles = [], notProcessedLegitCount = 0 } = {} } = useQuery(
    queryKeys.users.userInfo(),
    fetchUserInfo
  );

  const [authProductSeller, setAuthProductSeller] = useState(false);

  useEffect(() => {
    // 운영이 아닐땐 일땐 모든 판매하기 접근경로 오픈
    // 운영에서 노출 조건
    // IOS + 로그인 + PRODUCT_CREATE 권한 보유자
    // 운영에서 안드로이드는 비노출
    if (isProduction) {
      if (accessUser && roles.includes(PRODUCT_CREATE as never) && checkAgent.isIOSApp()) {
        setAuthProductSeller(true);
      } else {
        setAuthProductSeller(false);
      }
    } else {
      setAuthProductSeller(true);
    }
  }, [accessUser, roles]);

  const getAttName = () => {
    if (router.pathname === '/') return attrProperty.name.MAIN;
    if (router.pathname === 'mypage') return attrProperty.name.MY_STORE;
    return '';
  };

  const handleClickMoveToCamelSeller = () => {
    const prevStep = LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage;
    logEvent(attrKeys.camelSeller.CLICK_NEWPRODUCT, {
      name: getAttName()
    });

    if (process.env.NODE_ENV !== 'development') {
      if (!(checkAgent.isIOSApp() || checkAgent.isAndroidApp())) {
        setOpenAppDown(({ type }) => ({
          type,
          open: true
        }));
        return;
      }

      if (checkAgent.isIOSApp() && getAppVersion() < 1144) {
        setDialogState({
          type: 'appUpdateNotice',
          customStyleTitle: { minWidth: 269 },
          secondButtonAction: () => {
            if (
              window.webkit &&
              window.webkit.messageHandlers &&
              window.webkit.messageHandlers.callExecuteApp
            )
              window.webkit.messageHandlers.callExecuteApp.postMessage(
                'itms-apps://itunes.apple.com/app/id1541101835'
              );
          }
        });

        return;
      }

      if (checkAgent.isAndroidApp() && getAppVersion() < 1140) {
        setDialogState({
          type: 'appUpdateNotice',
          customStyleTitle: { minWidth: 269 },
          secondButtonAction: () => {
            if (window.webview && window.webview.callExecuteApp)
              window.webview.callExecuteApp('market://details?id=kr.co.mrcamel.android');
          }
        });
        return;
      }

      if (checkAgent.isAndroidApp() || checkAgent.isIOSApp()) {
        window.getAuthCamera = (result: boolean) => {
          if (!result) {
            setDialogState({
              type: 'appAuthCheck',
              customStyleTitle: { minWidth: 269, marginTop: 12 },
              firstButtonAction: () => {
                if (
                  checkAgent.isIOSApp() &&
                  window.webkit &&
                  window.webkit.messageHandlers &&
                  window.webkit.messageHandlers.callMoveToSetting &&
                  window.webkit.messageHandlers.callMoveToSetting.postMessage
                ) {
                  window.webkit.messageHandlers.callMoveToSetting.postMessage(0);
                }
                if (checkAgent.isAndroidApp() && window.webview && window.webview.moveToSetting) {
                  window.webview.moveToSetting();
                }
              }
            });
          }
        };
      }
    }

    if (accessUser && prevStep) {
      // accessUser && prevStep
      setContinueDialog(({ type }) => ({ type, open: true }));
      return;
    }

    router.push('/camelSeller');
  };

  useEffect(() => {
    if (authProductSeller) ChannelTalk.moveChannelButtonPosition(-40);

    return () => {
      ChannelTalk.moveChannelButtonPosition(0);
    };
  }, [authProductSeller]);

  // eslint-disable-next-line no-constant-condition
  if (authProductSeller) {
    // authProductSeller
    return (
      <FloatingButton
        variant="contained"
        brandColor="primary"
        size="large"
        onClick={handleClickMoveToCamelSeller}
        isLegitTooltip={!!notProcessedLegitCount && router.pathname === '/'}
        isUserShop={router.pathname === '/user/shop'}
      >
        <Icon name="PlusOutlined" />
        판매하기
      </FloatingButton>
    );
  }
  return <Box />;
}

export default CamelSellerFloatingButton;
