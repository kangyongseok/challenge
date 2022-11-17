import { useEffect, useRef } from 'react';

import { useRecoilState, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box } from 'mrcamel-ui';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  CamelSellerBottomSheetCondition,
  CamelSellerConfirmFooter,
  CamelSellerHeader,
  CamelSellerPhotoGuide,
  CamelSellerPrice,
  CamelSellerProductTitle,
  CamelSellerRecentBottomSheet,
  CamelSellerRegisterCondition,
  CamelSellerRegisterState,
  CamelSellerRegisterTextForm
} from '@components/pages/camelSeller';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { camelSellerBooleanStateFamily, camelSellerTempSaveDataState } from '@recoil/camelSeller';

function RegisterConfirm() {
  const { query } = useRouter();
  const resetSubmitState = useResetRecoilState(camelSellerBooleanStateFamily('submitClick'));
  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MAIN, {
      title: attrProperty.title.NEW
    });
  }, []);

  useEffect(() => {
    setTempData({
      ...tempData,
      title: (tempData.title || query.brandName) as string,
      quoteTitle: (tempData.quoteTitle || query.title || query.brandName) as string
    });
    LocalStorage.remove(CAMEL_SELLER);
    return () => resetSubmitState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GeneralTemplate
      header={<CamelSellerHeader />}
      footer={<CamelSellerConfirmFooter footerRef={footerRef} />}
      hideAppDownloadBanner
    >
      <CamelSellerPhotoGuide />
      <Box customStyle={{ marginTop: 160 }}>
        <Content>
          <CamelSellerProductTitle />
        </Content>
        <Content>
          <CamelSellerRegisterCondition />
        </Content>
        <Content>
          <CamelSellerRegisterState />
        </Content>
        <Content>
          <CamelSellerPrice footerRef={footerRef} />
        </Content>
        <CamelSellerRegisterTextForm />
      </Box>
      <CamelSellerBottomSheetCondition />
      <CamelSellerRecentBottomSheet />
    </GeneralTemplate>
  );
}

const Content = styled.div`
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
`;

export default RegisterConfirm;
