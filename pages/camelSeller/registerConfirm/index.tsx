import { useCallback, useEffect, useState } from 'react';

import type { GetServerSidePropsContext } from 'next';
import { useQuery } from '@tanstack/react-query';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  CamelSellerAuthPushDialog,
  CamelSellerCTAButton,
  CamelSellerCategoryBrand,
  CamelSellerCondition,
  CamelSellerConditionBottomSheet,
  CamelSellerDescription,
  CamelSellerHeader,
  CamelSellerInfo,
  CamelSellerNotiChannelDialog,
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
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function RegisterConfirm() {
  const { data: accessUser } = useQueryAccessUser();

  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const { data: alarmsInfo, isLoading } = useQuery(queryKeys.users.alarms(), fetchAlarm, {
    refetchOnMount: true
  });

  const notiFalse = useCallback(() => {
    if (!alarmsInfo?.isNotiChannel) {
      logEvent(attrKeys.camelSeller.VIEW_ALARM_POPUP, {
        name: attrProperty.name.PRODUCT_MAIN,
        title: 'ALARM'
      });

      setOpen(true);
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

        setOpenDialog(true);
      }
    };
  }, [alarmsInfo]);

  useEffect(() => {
    if (!isLoading) {
      notiFalse();
    }
  }, [notiFalse, alarmsInfo?.isNotiChannel, isLoading]);

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
      <CamelSellerNotiChannelDialog open={open} />
      <CamelSellerAuthPushDialog open={openDialog} onClose={() => setOpenDialog(false)} />
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
