import { useCallback, useEffect } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import { useQuery } from '@tanstack/react-query';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  CamelSellerCTAButton,
  CamelSellerCategoryBrand,
  CamelSellerCondition,
  CamelSellerConditionBottomSheet,
  CamelSellerDescription,
  CamelSellerHeader,
  CamelSellerInfo,
  CamelSellerPrice,
  CamelSellerProductImage,
  CamelSellerRecentBottomSheet,
  CamelSellerSize,
  CamelSellerSizeBottomSheet,
  CamelSellerSurveyBottomSheet,
  CamelSellerSurveyForm,
  CamelSellerTitle
} from '@components/pages/camelSeller';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchAlarm } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { SAVED_CAMEL_SELLER_PRODUCT_DATA, SOURCE } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import { checkAgent } from '@utils/common';

import type { SaveCamelSellerProductData } from '@typings/camelSeller';
import { dialogState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function RegisterConfirm() {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();
  const setDialogState = useSetRecoilState(dialogState);
  const { data: alarmsInfo } = useQuery(queryKeys.users.alarms(), fetchAlarm, {
    refetchOnMount: true
  });

  const notiFalse = useCallback(() => {
    if (!alarmsInfo?.isNotiChannel) {
      logEvent(attrKeys.camelSeller.VIEW_ALARM_POPUP, {
        name: attrProperty.name.PRODUCT_MAIN,
        title: 'ALARM'
      });

      setDialogState({
        type: 'notiChannelFalse',
        disabledOnClose: true,
        secondButtonAction: () => {
          logEvent(attrKeys.camelSeller.CLICK_ALARM, {
            name: attrProperty.name.ALARM_POPUP,
            title: 'ALARM'
          });

          router.push('/mypage/settings/alarm?setting=true');
        }
      });
      return;
    }

    if (checkAgent.isAndroidApp() && window.webview && window.webview.callAuthPush) {
      window.webview.callAuthPush();
    }

    if (
      checkAgent.isIOSApp() &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callAuthPush &&
      window.webkit.messageHandlers.callAuthPush.postMessage
    ) {
      window.webkit.messageHandlers.callAuthPush.postMessage(0);
    }

    window.getAuthPush = (result: string) => {
      if (!result) {
        logEvent(attrKeys.camelSeller.VIEW_ALARM_POPUP, {
          name: attrProperty.name.PRODUCT_MAIN,
          title: 'DEVICE_ALARM'
        });

        setDialogState({
          type: 'notiDeviceFalse',
          disabledOnClose: true,
          secondButtonAction: () => {
            logEvent(attrKeys.camelSeller.CLICK_ALARM, {
              name: attrProperty.name.ALARM_POPUP,
              title: 'DEVICE_ALARM'
            });

            if (checkAgent.isAndroidApp() && window.webview && window.webview.moveToSetting) {
              window.webview.moveToSetting();
            }

            if (
              checkAgent.isIOSApp() &&
              window.webkit &&
              window.webkit.messageHandlers &&
              window.webkit.messageHandlers.callMoveToSetting &&
              window.webkit.messageHandlers.callMoveToSetting.postMessage
            ) {
              window.webkit.messageHandlers.callMoveToSetting.postMessage(0);
            }
          }
        });
      }
    };
  }, [alarmsInfo, router, setDialogState]);

  useEffect(() => {
    notiFalse();
  }, [notiFalse, alarmsInfo?.isNotiChannel]);

  useEffect(() => {
    const source = LocalStorage.get(SOURCE);
    const data = LocalStorage.get<SaveCamelSellerProductData>(SAVED_CAMEL_SELLER_PRODUCT_DATA);
    const isFirstVisit = SessionStorage.get(
      sessionStorageKeys.isFirstVisitCamelSellerRegisterConfirm
    );

    if (accessUser && data && data[accessUser.snsType] && !isFirstVisit) {
      logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MAIN, {
        title: attrProperty.title.LEAVE,
        source,
        data: data[accessUser.snsType]
      });
    } else if (!isFirstVisit) {
      logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MAIN, {
        title: attrProperty.title.NEW,
        source
      });
    }

    return () => {
      LocalStorage.remove(SOURCE);
    };
  }, [accessUser]);

  useEffect(() => {
    SessionStorage.set(sessionStorageKeys.isFirstVisitCamelSellerRegisterConfirm, true);
  }, []);

  return (
    <GeneralTemplate header={<CamelSellerHeader />} hideAppDownloadBanner>
      <CamelSellerInfo />
      <CamelSellerProductImage />
      <CamelSellerTitle />
      <CamelSellerCategoryBrand />
      <CamelSellerCondition />
      <CamelSellerSize />
      <CamelSellerPrice />
      <CamelSellerSurveyForm />
      <CamelSellerDescription />
      <CamelSellerCTAButton />
      <CamelSellerConditionBottomSheet />
      <CamelSellerSizeBottomSheet />
      <CamelSellerRecentBottomSheet />
      <CamelSellerSurveyBottomSheet />
    </GeneralTemplate>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  return {
    props: {}
  };
}

export default RegisterConfirm;
