import { useEffect } from 'react';

import { useRouter } from 'next/router';

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

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import {
  CHECKED_PRODUCT_PHOTO_UPLOAD_GUIDE,
  SAVED_CAMEL_SELLER_PRODUCT_DATA,
  SOURCE
} from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { SaveCamelSellerProductData } from '@typings/camelSeller';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function RegisterConfirm() {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();

  useEffect(() => {
    const getLocalstorage = LocalStorage.get(SOURCE);
    const data = LocalStorage.get<SaveCamelSellerProductData>(SAVED_CAMEL_SELLER_PRODUCT_DATA);

    if (accessUser && data && data[accessUser.snsType]) {
      logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MAIN, {
        title: attrProperty.title.LEAVE,
        source: getLocalstorage,
        data: data[accessUser.snsType]
      });
    } else {
      logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MAIN, {
        title: attrProperty.title.NEW,
        source: getLocalstorage
      });
    }

    return () => {
      LocalStorage.remove(SOURCE);
    };
  }, [accessUser]);

  useEffect(() => {
    if (!LocalStorage.get(CHECKED_PRODUCT_PHOTO_UPLOAD_GUIDE)) {
      router.push('/camelSeller/guide');
    }
  }, [router]);

  return (
    <GeneralTemplate header={<CamelSellerHeader />} subset hideAppDownloadBanner>
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

export default RegisterConfirm;
