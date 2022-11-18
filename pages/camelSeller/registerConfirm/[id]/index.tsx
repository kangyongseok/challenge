import { useEffect, useRef } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box } from 'mrcamel-ui';
import { find } from 'lodash-es';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  CamelSellerBottomSheetCondition,
  CamelSellerConfirmFooter,
  CamelSellerHeader,
  CamelSellerPhotoGuideEdit,
  CamelSellerPrice,
  CamelSellerProductTitle,
  CamelSellerRecentBottomSheet,
  CamelSellerRegisterCondition,
  CamelSellerRegisterState,
  CamelSellerRegisterTextForm
} from '@components/pages/camelSeller';

import { logEvent } from '@library/amplitude';

import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { CamelSellerTempData } from '@typings/camelSeller';
import { deviceIdState } from '@recoil/common';
import { camelSellerBooleanStateFamily, camelSellerTempSaveDataState } from '@recoil/camelSeller';

function RegisterConfirmEdit() {
  const { query } = useRouter();
  const deviceId = useRecoilValue(deviceIdState);
  const resetPhotoState = useResetRecoilState(camelSellerBooleanStateFamily('requirePhotoValid'));
  const productId = Number(query.id || 0);
  const setTempData = useSetRecoilState(camelSellerTempSaveDataState);
  const footerRef = useRef<HTMLDivElement>(null);

  const { data: editData } = useQuery(
    queryKeys.products.sellerEditProducs({ productId, deviceId }),
    () => fetchProduct({ productId, deviceId }),
    {
      enabled: !!productId,
      refetchOnMount: 'always'
    }
  );

  useEffect(() => {
    logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MAIN, {
      title: attrProperty.title.EDIT
    });

    return () => resetPhotoState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editData) {
      const result = editData.product.photoGuideImages.map((images) => ({
        ...images,
        photoGuideId: images.commonPhotoGuideDetail.id
      }));

      setTempData({
        title: editData.product.title,
        price: editData.product.price,
        brand: editData.product.brand,
        brandIds: [editData.product.brand.id].concat(
          editData.product?.productBrands?.map(({ brand }) => brand.id) || []
        ),
        category: { id: editData.product.category.id || 0, name: editData.product.category.name },
        condition: find(editData?.product.labels, {
          codeId: 14
        }) as CamelSellerTempData['condition'],
        color: editData.product.colors[0],
        size: editData.product.categorySizes[0]
          ? editData.product.categorySizes[0]
          : { id: 0, name: 'ONE SIZE' },
        photoGuideImages: result,
        description: editData.product.description || '',
        quoteTitle: editData.product.quoteTitle || ''
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);

  return (
    <GeneralTemplate
      header={<CamelSellerHeader />}
      footer={<CamelSellerConfirmFooter footerRef={footerRef} />}
      hideAppDownloadBanner
      subset
    >
      <CamelSellerPhotoGuideEdit />
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

export default RegisterConfirmEdit;
