import { useEffect, useState } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { find } from 'lodash-es';
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
import { logEvent } from '@library/amplitude';

import { fetchProduct } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { CamelSellerTempData } from '@typings/camelSeller';
import { deviceIdState } from '@recoil/common';
import {
  camelSellerBooleanStateFamily,
  camelSellerHasOpenedSurveyBottomSheetState,
  camelSellerSurveyState,
  camelSellerTempSaveDataState
} from '@recoil/camelSeller';
import useRedirectVC from '@hooks/useRedirectVC';

function RegisterConfirmEdit() {
  const { query } = useRouter();
  const deviceId = useRecoilValue(deviceIdState);
  const productId = Number(query.id || 0);

  useRedirectVC(`/camelSeller/registerConfirm/${query.id}`);

  const resetPhotoState = useResetRecoilState(camelSellerBooleanStateFamily('requirePhotoValid'));
  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);
  const setSurveyState = useSetRecoilState(camelSellerSurveyState);
  const setHasOpenedSurveyBottomSheetState = useSetRecoilState(
    camelSellerHasOpenedSurveyBottomSheetState
  );

  const { data: editData, isFetching } = useQuery(
    queryKeys.products.sellerEditProduct({ productId, deviceId }),
    () => fetchProduct({ productId, deviceId }),
    {
      enabled: !!productId,
      refetchOnMount: 'always'
    }
  );

  const [hasTempData, setHasTempData] = useState(true);

  useEffect(() => {
    const { title, images, category, sizes, brand, brands, categorySizeIds, condition, price } =
      tempData;
    setHasTempData(
      !!images.length ||
        !!title ||
        !!category.id ||
        !!brand.id ||
        !!brands ||
        !!categorySizeIds.length ||
        !!sizes ||
        !!condition.id ||
        !!price
    );
  }, [tempData]);

  useEffect(() => {
    const isFirstVisit = SessionStorage.get(
      sessionStorageKeys.isFirstVisitCamelSellerRegisterConfirm
    );

    if (!isFetching && !isFirstVisit) {
      logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MAIN, {
        title: attrProperty.title.EDIT,
        data: editData
      });
    }
  }, [isFetching, editData]);

  useEffect(() => {
    SessionStorage.set(sessionStorageKeys.isFirstVisitCamelSellerRegisterConfirm, true);
  }, []);

  useEffect(() => {
    return () => resetPhotoState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editData && !isFetching && !hasTempData) {
      const categorySizes = editData.product.categorySizes || [];
      const directInputSize = categorySizes.find(({ id }) => id === -1);
      const getSize = () => {
        if (!directInputSize && categorySizes && categorySizes.length) {
          return categorySizes[0];
        }
        return { id: 0, name: '', categorySizeId: 0 };
      };

      setHasOpenedSurveyBottomSheetState(true);
      setTempData({
        title: editData.product.title,
        price: editData.product.price,
        brand: editData.product.brand,
        brands: '',
        brandIds: [editData.product.brand.id].concat(
          editData.product?.productBrands?.map(({ brand: productBrand }) => productBrand.id) || []
        ),
        category: {
          id: editData.product.category.id || 0,
          parentId: editData.product.category.parentId || 0,
          parentCategoryName: '',
          subParentId: editData.product.category.subParentId || 0,
          name: editData.product.category.name
        },
        size: getSize(),
        sizes: directInputSize ? directInputSize.name : '',
        sizeOptionIds: editData.sizeOptions.map(({ name }) => Number(name)),
        condition: find(editData?.product.labels, {
          codeId: 14
        }) as CamelSellerTempData['condition'],
        categorySizeIds: editData.product.categorySizes
          ?.filter(({ id }) => id !== -1) // 직접 입력 제외
          .map(({ categorySizeId, id }) => {
            if (id === 0) return 0;
            return categorySizeId;
          }),
        images: [
          editData.product.imageMain || editData.product.imageMain,
          ...(editData.product.imageDetails || '').split('|')
        ].filter((image) => image),
        description: editData.product.description || '',
        quoteTitle: editData.product.quoteTitle || '',
        useDeliveryPrice: editData.product.labels.some(({ name }) => Number(name) === 33)
      });
      setSurveyState(({ units, stores, distances }) => ({
        units: units.map((unit) => ({
          ...unit,
          selected: editData.units.some(({ name }) => unit.id === Number(name))
        })),
        stores: stores.map((store) => ({
          ...store,
          selected: editData.stores.some(({ name }) => store.id === Number(name))
        })),
        distances: distances.map((distance) => ({
          ...distance,
          selected: editData.distances.some(({ name }) => distance.id === Number(name))
        })),
        colors: editData.product.colors || []
      }));
    }
  }, [
    setHasOpenedSurveyBottomSheetState,
    setSurveyState,
    setTempData,
    editData,
    isFetching,
    hasTempData
  ]);

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

export default RegisterConfirmEdit;
