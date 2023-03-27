import { useEffect } from 'react';

import { GetServerSidePropsContext } from 'next';

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

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { SAVED_CAMEL_SELLER_PRODUCT_DATA, SOURCE } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';

import type { SaveCamelSellerProductData } from '@typings/camelSeller';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function RegisterConfirm() {
  const { data: accessUser } = useQueryAccessUser();

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
