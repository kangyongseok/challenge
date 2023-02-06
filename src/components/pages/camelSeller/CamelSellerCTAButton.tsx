import { useState } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { Button, Toast } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { postProducts, putProductEdit } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { SAVED_CAMEL_SELLER_PRODUCT_DATA } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { toastState } from '@recoil/common';
import {
  camelSellerBooleanStateFamily,
  camelSellerHasOpenedSurveyBottomSheetState,
  camelSellerIsImageLoadingState,
  camelSellerSubmitValidatorState,
  camelSellerSurveyState,
  camelSellerTempSaveDataState
} from '@recoil/camelSeller';

function CamelSellerCTAButton() {
  const router = useRouter();
  const { id: productId } = router.query;

  const {
    images,
    title,
    quoteTitle,
    description,
    price,
    brandIds,
    brands,
    category,
    condition,
    categorySizeIds,
    sizes,
    sizeOptionIds,
    useDeliveryPrice,
    ...other
  } = useRecoilValue(camelSellerTempSaveDataState);
  const { units, stores, distances, colors } = useRecoilValue(camelSellerSurveyState);
  const isValid = useRecoilValue(camelSellerSubmitValidatorState);
  const isImageLoading = useRecoilValue(camelSellerIsImageLoadingState);
  const setToastState = useSetRecoilState(toastState);
  const resetTempData = useResetRecoilState(camelSellerTempSaveDataState);
  const resetSurveyState = useResetRecoilState(camelSellerSurveyState);
  const resetValidatorPhoto = useResetRecoilState(
    camelSellerBooleanStateFamily('requirePhotoValid')
  );
  const resetHasOpenedSurveyBottomSheetState = useResetRecoilState(
    camelSellerHasOpenedSurveyBottomSheetState
  );

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const { mutate, isLoading } = useMutation(postProducts);
  const { mutate: mutateEdit, isLoading: isLoadingEditMutate } = useMutation(putProductEdit);

  const handleClick = () => {
    if (isLoading || isLoadingEditMutate) return;

    const messages = [];
    if (!images.length) messages.push('사진');
    if (!title) messages.push('제목');
    if (!category.id) messages.push('카테고리');
    if (!condition.id) messages.push('상태');
    if (!categorySizeIds.length && !sizes) messages.push('사이즈');

    if (messages.length) {
      setMessage(`${messages.join(', ')}은(는) 필수 입력사항이에요.`);
      setOpen(true);
      return;
    }

    const data = {
      images,
      title,
      quoteTitle,
      description,
      price,
      brandIds,
      brands,
      categoryIds: [category.id],
      conditionId: condition.id,
      categorySizeIds,
      sizes,
      sizeOptionIds,
      useDeliveryPrice,
      unitIds: units.filter(({ selected }) => selected).map(({ id }) => id),
      storeIds: stores.filter(({ selected }) => selected).map(({ id }) => id),
      distanceIds: distances.filter(({ selected }) => selected).map(({ id }) => id),
      colorIds: colors.map(({ id }) => id)
    };

    if (productId) {
      logEvent(attrKeys.camelSeller.SUBMIT_PRODUCT, {
        name: attrProperty.name.PRODUCT_MAIN,
        title: attrProperty.title.EDIT,
        data: {
          images,
          title,
          quoteTitle,
          description,
          price,
          brandIds,
          brands,
          category,
          condition,
          categorySizeIds,
          sizes,
          sizeOptionIds,
          useDeliveryPrice,
          ...other,
          unitIds: units.filter(({ selected }) => selected).map(({ id }) => id),
          storeIds: stores.filter(({ selected }) => selected).map(({ id }) => id),
          distanceIds: distances.filter(({ selected }) => selected).map(({ id }) => id),
          colorIds: colors.map(({ id }) => id)
        }
      });

      mutateEdit(
        {
          productId: Number(productId),
          parameter: data
        },
        {
          onSuccess() {
            SessionStorage.remove(sessionStorageKeys.isFirstVisitCamelSellerRegisterConfirm);
            window.history.replaceState(null, '', '/user/shop');
            router.replace(`/products/${productId}?success=true`).then(() => {
              resetSurveyState();
              resetTempData();
              resetHasOpenedSurveyBottomSheetState();
              resetValidatorPhoto();
            });
          }
        }
      );
    } else {
      logEvent(attrKeys.camelSeller.SUBMIT_PRODUCT, {
        name: attrProperty.name.PRODUCT_MAIN,
        title: attrProperty.title.NEW,
        data: {
          images,
          title,
          quoteTitle,
          description,
          price,
          brandIds,
          brands,
          category,
          condition,
          categorySizeIds,
          sizes,
          sizeOptionIds,
          useDeliveryPrice,
          ...other,
          unitIds: units.filter(({ selected }) => selected).map(({ id }) => id),
          storeIds: stores.filter(({ selected }) => selected).map(({ id }) => id),
          distanceIds: distances.filter(({ selected }) => selected).map(({ id }) => id),
          colorIds: colors.map(({ id }) => id)
        }
      });

      mutate(data, {
        onSuccess({ id, isProductLegit }) {
          LocalStorage.remove(SAVED_CAMEL_SELLER_PRODUCT_DATA);
          SessionStorage.remove(sessionStorageKeys.isFirstVisitCamelSellerRegisterConfirm);
          window.history.replaceState(null, '', '/user/shop');
          if (isProductLegit) {
            SessionStorage.set(sessionStorageKeys.submitLegitProcessName, 'LEGIT_PROCESS');
            SessionStorage.set(sessionStorageKeys.legitIntroSource, 'PRODUCT_MAIN');
            router.replace(`/legit/intro?productId=${id}&register=true`).then(() => {
              resetTempData();
              resetSurveyState();
              resetHasOpenedSurveyBottomSheetState();
              resetValidatorPhoto();
            });
          } else {
            router.replace(`/products/${id}?success=true`).then(() => {
              setToastState({
                type: 'product',
                status: 'saleSuccess',
                hideDuration: 3000
              });
              resetSurveyState();
              resetTempData();
              resetHasOpenedSurveyBottomSheetState();
              resetValidatorPhoto();
            });
          }
        }
      });
    }
  };

  return (
    <>
      <CustomButton
        variant="solid"
        size="xlarge"
        brandColor="primary"
        fullWidth
        customDisabled={!isValid || isImageLoading || isLoading || isLoadingEditMutate}
        onClick={handleClick}
        customStyle={{
          margin: '32px 0 20px',
          pointerEvents: 'auto'
        }}
      >
        {productId ? '수정하기' : '등록하기'}
      </CustomButton>
      <Toast open={open} onClose={() => setOpen(false)}>
        {message}
      </Toast>
    </>
  );
}

const CustomButton = styled(Button)<{ customDisabled: boolean }>`
  ${({
    customDisabled,
    theme: {
      palette: { common }
    }
  }): CSSObject =>
    customDisabled
      ? {
          borderColor: 'transparent',
          backgroundColor: common.ui90,
          color: common.ui80,
          '& svg': {
            color: common.ui80
          }
        }
      : {}}
`;

export default CamelSellerCTAButton;