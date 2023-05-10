import { useEffect, useRef, useState } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import { Box, Icon, Toast, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { postProducts, putProductEdit } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { SAVED_CAMEL_SELLER_PRODUCT_DATA } from '@constants/localStorage';
import { HEADER_HEIGHT } from '@constants/common';
import { MIN_PRICE } from '@constants/camelSeller';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { SaveCamelSellerProductData, SubmitType } from '@typings/camelSeller';
import { exitUserNextStepState, exitUserViewBottomSheetState, toastState } from '@recoil/common';
import {
  camelSellerBooleanStateFamily,
  camelSellerChangeDetectSelector,
  camelSellerDialogStateFamily,
  camelSellerHasOpenedSurveyBottomSheetState,
  camelSellerIsImageLoadingState,
  camelSellerSubmitValidatorState,
  camelSellerSurveyState,
  camelSellerTempSaveDataState
} from '@recoil/camelSeller';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useExitSurveyBottomSheet from '@hooks/useExitSurveyBottomSheet';

function CamelSellerHeader() {
  const { query, back, replace, beforePopState, pathname } = useRouter();

  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  const productId = Number(query.id || 0);
  const [open, setOpen] = useState(false);
  const isValid = useRecoilValue(camelSellerSubmitValidatorState);
  const isChange = useRecoilValue(camelSellerChangeDetectSelector);
  const viewRecentPriceList = useRecoilValue(camelSellerDialogStateFamily('recentPrice'));
  const tempData = useRecoilValue(camelSellerTempSaveDataState);
  const { units, stores, distances, colors } = useRecoilValue(camelSellerSurveyState);
  const hasOpenedSurveyBottomSheet = useRecoilValue(camelSellerHasOpenedSurveyBottomSheetState);
  const [openToast, setOpenToast] = useState(false);
  const [message, setMessage] = useState('');
  const resetSurveyState = useResetRecoilState(camelSellerSurveyState);
  const resetTempData = useResetRecoilState(camelSellerTempSaveDataState);
  const resetValidatorPhoto = useResetRecoilState(
    camelSellerBooleanStateFamily('requirePhotoValid')
  );
  const setExitBottomSheet = useSetRecoilState(exitUserViewBottomSheetState);
  const { isUserViewPerDay } = useExitSurveyBottomSheet();
  const resetHasOpenedSurveyBottomSheetState = useResetRecoilState(
    camelSellerHasOpenedSurveyBottomSheetState
  );
  const setToastState = useSetRecoilState(toastState);
  const setSubmitClickState = useSetRecoilState(camelSellerBooleanStateFamily('submitClick'));
  const isImageLoading = useRecoilValue(camelSellerIsImageLoadingState);

  const clickBackRef = useRef(false);

  const { data: accessUser } = useQueryAccessUser();
  const { mutate: mutatePostRegister, isLoading } = useMutation(postProducts);
  const { mutate: mutatePutEdit, isLoading: isLoadingEditMutate } = useMutation(putProductEdit);
  const setExitUserNextStep = useSetRecoilState(exitUserNextStepState);

  const handleClickClose = () => {
    clickBackRef.current = true;
    SessionStorage.remove(sessionStorageKeys.isFirstVisitCamelSellerRegisterConfirm);

    if (
      isUserViewPerDay() &&
      (!tempData.images.length ||
        !tempData.title ||
        !tempData.category.id ||
        !tempData.condition.id ||
        (!tempData.categorySizeIds.length && !tempData.sizes))
    ) {
      setExitUserNextStep((prev) => ({ ...prev, currentView: '매물등록' }));
      setTimeout(() => {
        setExitBottomSheet(true);
      }, 2000);
    }

    if (
      !query.id &&
      !viewRecentPriceList.open &&
      pathname.split('/').includes('registerConfirm') &&
      isChange
    ) {
      const data =
        LocalStorage.get<SaveCamelSellerProductData>(SAVED_CAMEL_SELLER_PRODUCT_DATA) || {};
      const saveData = {
        ...tempData,
        unitIds: units.filter(({ selected }) => selected).map(({ id }) => id),
        storeIds: stores.filter(({ selected }) => selected).map(({ id }) => id),
        distanceIds: distances.filter(({ selected }) => selected).map(({ id }) => id),
        colors,
        hasOpenedSurveyBottomSheet
      };

      if (accessUser) {
        LocalStorage.set(SAVED_CAMEL_SELLER_PRODUCT_DATA, {
          ...data,
          [accessUser.snsType]: saveData
        });

        logEvent(attrKeys.camelSeller.SUBMIT_PRODUCT, {
          name: attrProperty.name.PRODUCT_MAIN,
          title: attrProperty.title.LEAVE,
          data: {
            ...tempData,
            unitIds: units.filter(({ selected }) => selected).map(({ id }) => id),
            storeIds: stores.filter(({ selected }) => selected).map(({ id }) => id),
            distanceIds: distances.filter(({ selected }) => selected).map(({ id }) => id),
            colorIds: colors.map(({ id }) => id)
          }
        });
      }
    } else {
      logEvent(attrKeys.camelSeller.SUBMIT_PRODUCT, {
        name: attrProperty.name.PRODUCT_MAIN,
        title: attrProperty.title.CLOSE
      });
    }
    back();
  };

  const editSubmit = () => {
    const submitPutData = {
      title: tempData.title,
      quoteTitle: tempData.quoteTitle,
      price: tempData.price,
      brandIds: tempData.brandIds,
      brands: tempData.brands,
      categoryIds: [tempData.category.id],
      conditionId: tempData.condition.id,
      categorySizeIds: tempData.categorySizeIds,
      sizes: tempData.sizes,
      sizeOptionIds: tempData.sizeOptionIds,
      images: tempData.images,
      description: tempData.description,
      useDeliveryPrice: tempData.useDeliveryPrice,
      unitIds: units.filter(({ selected }) => selected).map(({ id }) => id),
      storeIds: stores.filter(({ selected }) => selected).map(({ id }) => id),
      distanceIds: distances.filter(({ selected }) => selected).map(({ id }) => id),
      colorIds: colors.map(({ id }) => id)
    };

    logEvent(attrKeys.camelSeller.SUBMIT_PRODUCT, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.EDIT,
      data: {
        ...tempData,
        unitIds: units.filter(({ selected }) => selected).map(({ id }) => id),
        storeIds: stores.filter(({ selected }) => selected).map(({ id }) => id),
        distanceIds: distances.filter(({ selected }) => selected).map(({ id }) => id),
        colorIds: colors.map(({ id }) => id)
      }
    });

    mutatePutEdit(
      {
        productId,
        parameter: submitPutData as SubmitType
      },
      {
        onSuccess() {
          SessionStorage.remove(sessionStorageKeys.isFirstVisitCamelSellerRegisterConfirm);
          window.history.replaceState(null, '', '/user/shop');
          replace(`/products/${productId}?success=true`).then(() => {
            resetTempData();
            resetSurveyState();
            resetHasOpenedSurveyBottomSheetState();
            resetValidatorPhoto();
          });
        }
      }
    );
  };

  const submit = () => {
    const data = {
      title: tempData.title,
      price: tempData.price,
      brandIds: tempData.brandIds,
      brands: tempData.brands,
      categoryIds: [tempData.category.id],
      conditionId: tempData.condition.id,
      categorySizeIds: tempData.categorySizeIds,
      sizes: tempData.sizes,
      sizeOptionIds: tempData.sizeOptionIds,
      images: tempData.images,
      description: tempData.description,
      quoteTitle: tempData.quoteTitle,
      useDeliveryPrice: tempData.useDeliveryPrice,
      unitIds: units.filter(({ selected }) => selected).map(({ id }) => id),
      storeIds: stores.filter(({ selected }) => selected).map(({ id }) => id),
      distanceIds: distances.filter(({ selected }) => selected).map(({ id }) => id),
      colorIds: colors.map(({ id }) => id)
    };

    logEvent(attrKeys.camelSeller.SUBMIT_PRODUCT, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.NEW,
      data: {
        ...tempData,
        unitIds: units.filter(({ selected }) => selected).map(({ id }) => id),
        storeIds: stores.filter(({ selected }) => selected).map(({ id }) => id),
        distanceIds: distances.filter(({ selected }) => selected).map(({ id }) => id),
        colorIds: colors.map(({ id }) => id)
      }
    });

    mutatePostRegister(data as SubmitType, {
      onSuccess({ id, isProductLegit }) {
        LocalStorage.remove(SAVED_CAMEL_SELLER_PRODUCT_DATA);
        SessionStorage.remove(sessionStorageKeys.isFirstVisitCamelSellerRegisterConfirm);
        window.history.replaceState(null, '', '/user/shop');
        if (isProductLegit) {
          SessionStorage.set(sessionStorageKeys.submitLegitProcessName, 'LEGIT_PROCESS');
          SessionStorage.set(sessionStorageKeys.legitIntroSource, 'PRODUCT_MAIN');
          replace(`/legit/intro?productId=${id}&register=true`).then(() => {
            resetTempData();
            resetSurveyState();
            resetHasOpenedSurveyBottomSheetState();
            resetValidatorPhoto();
          });
        } else {
          replace(`/products/${id}?success=true`).then(() => {
            setToastState({
              type: 'product',
              status: 'saleSuccess',
              hideDuration: 3000
            });
            resetTempData();
            resetSurveyState();
            resetHasOpenedSurveyBottomSheetState();
            resetValidatorPhoto();
          });
        }
      }
    });
  };

  const handleClickSubmit = () => {
    if (isImageLoading) {
      setOpen(true);
      return;
    }

    if (isLoading || isLoadingEditMutate) return;

    const messages = [];
    if (!tempData.images.length) messages.push('사진');
    if (!tempData.title) messages.push('제목');
    if (!tempData.category.id) messages.push('카테고리');
    if (!tempData.condition.id) messages.push('상태');
    if (!tempData.categorySizeIds.length && !tempData.sizes) messages.push('사이즈');

    if (messages.length) {
      setMessage(`${messages.join(', ')}은(는) 필수 입력사항이에요.`);
      setOpenToast(true);
      return;
    }

    if (tempData.price < MIN_PRICE) {
      setMessage('30,000원 이상의 매물만 등록할 수 있어요!');
      setOpenToast(true);
      return;
    }

    if (!isValid) {
      setSubmitClickState(({ type }) => ({ type, isState: true }));
      return;
    }

    if (query.id) {
      editSubmit();
    } else {
      submit();
    }
  };

  useEffect(() => {
    beforePopState(() => {
      SessionStorage.remove(sessionStorageKeys.isFirstVisitCamelSellerRegisterConfirm);

      if (
        isUserViewPerDay() &&
        (!tempData.images.length ||
          !tempData.title ||
          !tempData.category.id ||
          !tempData.condition.id ||
          (!tempData.categorySizeIds.length && !tempData.sizes))
      ) {
        setExitUserNextStep((prev) => ({ ...prev, currentView: '매물등록' }));
        setExitBottomSheet(true);
      }

      if (
        !clickBackRef.current &&
        !query.id &&
        !viewRecentPriceList.open &&
        pathname.split('/').includes('registerConfirm') &&
        isChange
      ) {
        const data =
          LocalStorage.get<SaveCamelSellerProductData>(SAVED_CAMEL_SELLER_PRODUCT_DATA) || {};

        const saveData = {
          ...tempData,
          unitIds: units.filter(({ selected }) => selected).map(({ id }) => id),
          storeIds: stores.filter(({ selected }) => selected).map(({ id }) => id),
          distanceIds: distances.filter(({ selected }) => selected).map(({ id }) => id),
          colors,
          hasOpenedSurveyBottomSheet
        };

        if (accessUser) {
          LocalStorage.set(SAVED_CAMEL_SELLER_PRODUCT_DATA, {
            ...data,
            [accessUser.snsType]: saveData
          });

          logEvent(attrKeys.camelSeller.SUBMIT_PRODUCT, {
            name: attrProperty.name.PRODUCT_MAIN,
            title: attrProperty.title.LEAVE,
            data: {
              ...tempData,
              unitIds: units.filter(({ selected }) => selected).map(({ id }) => id),
              storeIds: stores.filter(({ selected }) => selected).map(({ id }) => id),
              distanceIds: distances.filter(({ selected }) => selected).map(({ id }) => id),
              colorIds: colors.map(({ id }) => id)
            }
          });
        }
      } else if (!clickBackRef.current) {
        logEvent(attrKeys.camelSeller.SUBMIT_PRODUCT, {
          name: attrProperty.name.PRODUCT_MAIN,
          title: attrProperty.title.CLOSE
        });
      }
      return true;
    });
  }, [
    accessUser,
    beforePopState,
    colors,
    distances,
    hasOpenedSurveyBottomSheet,
    isChange,
    isUserViewPerDay,
    pathname,
    query.id,
    setExitBottomSheet,
    setExitUserNextStep,
    stores,
    tempData,
    units,
    viewRecentPriceList.open
  ]);

  return (
    <>
      <Header
        leftIcon={
          <Box onClick={handleClickClose} customStyle={{ padding: 16, maxHeight: HEADER_HEIGHT }}>
            <Icon name="CloseOutlined" />
          </Box>
        }
        rightIcon={
          <Typography
            weight="medium"
            variant="h3"
            onClick={handleClickSubmit}
            customStyle={{
              color:
                isValid && !isImageLoading && !isLoading && !isLoadingEditMutate
                  ? primary.main
                  : common.ui80,
              paddingRight: 12
            }}
          >
            {query.id ? '수정하기' : '등록하기'}
          </Typography>
        }
        hideTitle
        showRight={false}
      />
      <Toast open={open} onClose={() => setOpen(false)}>
        이미지를 저장하고 있어요!
        <br />
        잠시만 기다려 주세요.
      </Toast>
      <Toast open={openToast} onClose={() => setOpenToast(false)}>
        {message}
      </Toast>
    </>
  );
}

export default CamelSellerHeader;
