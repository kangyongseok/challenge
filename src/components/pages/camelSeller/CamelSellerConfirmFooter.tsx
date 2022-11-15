import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Toast, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { postProducts, putProductEdit } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { SubmitType } from '@typings/camelSeller';
import {
  camelSellerBooleanStateFamily,
  camelSellerSubmitState,
  camelSellerTempSaveDataState,
  setModifyProductTitleState,
  submitValidatorState
} from '@recoil/camelSeller';

function CamelSellerConfirmFooter() {
  const {
    theme: { typography }
  } = useTheme();
  const { query, replace } = useRouter();
  const productId = Number(query.id || 0);
  const validatorResult = useRecoilValue(submitValidatorState);
  const [modify, setIsModify] = useRecoilState(camelSellerBooleanStateFamily('modifyName'));
  const setSubmitClickState = useSetRecoilState(camelSellerBooleanStateFamily('submitClick'));
  const [openValidateToast, setOpenValidateToast] = useRecoilState(
    camelSellerBooleanStateFamily('validate')
  );
  const [openEmptyTitleToast, setOpenEmptyTitleToast] = useRecoilState(
    camelSellerBooleanStateFamily('title')
  );
  // const focusTitle = useRecoilValue(camelSellerBooleanStateFamily('focusTitle'));
  const customTitle = useRecoilValue(setModifyProductTitleState);
  const validatorPhoto = useRecoilValue(camelSellerBooleanStateFamily('requirePhotoValid'));
  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);
  const resetTempData = useResetRecoilState(camelSellerTempSaveDataState);
  const resetSubmitData = useResetRecoilState(camelSellerSubmitState);
  const resetValidatorPhoto = useResetRecoilState(
    camelSellerBooleanStateFamily('requirePhotoValid')
  );
  const { mutate: mutatePutEdit } = useMutation(putProductEdit);
  const { mutate: mutatePostRegister } = useMutation(postProducts);

  const handleClickEditTitle = () => {
    setIsModify(({ type }) => ({
      type,
      isState: false
    }));

    setTempData({
      ...tempData,
      title: customTitle
    });
  };

  const handleClickRegister = () => {
    if (!validatorResult || !validatorPhoto.isState) {
      setSubmitClickState(({ type }) => ({ type, isState: true }));
      setOpenValidateToast(({ type }) => ({
        type,
        isState: true
      }));
      SessionStorage.remove(sessionStorageKeys.hideCamelSellerRecentPriceTooltip);
      return;
    }
    if (query.id) {
      editSubmit();
    } else {
      submit();
    }
  };

  const editSubmit = () => {
    const editData = {
      title: tempData.title,
      price: tempData.price,
      brandIds: tempData.brandIds,
      categoryIds: [tempData.category.id],
      conditionId: tempData.condition.id,
      colorIds: [tempData.color.id],
      categorySizeIds: [tempData.size.id],
      photoGuideImages: tempData.photoGuideImages,
      description: tempData.description,
      quoteTitle: tempData.quoteTitle
    };

    mutatePutEdit(
      {
        productId,
        parameter: editData as SubmitType
      },
      {
        onSuccess() {
          resetTempData();
          resetSubmitData();
          resetValidatorPhoto();
          window.history.replaceState(null, '', '/user/shop');
          replace(`/products/${productId}?success=true`);
        }
      }
    );
  };

  const submit = () => {
    const data = {
      title: tempData.title || tempData.brand.name,
      price: tempData.price,
      brandIds:
        typeof query.brandIds === 'string'
          ? [Number(query.brandIds) || 0]
          : query?.brandIds?.map((id) => Number(id)),
      categoryIds: [Number(tempData.category.id) || Number(query.categoryIds) || 0],
      conditionId: Number(tempData.condition.id),
      colorIds: [Number(tempData.color.id)],
      categorySizeIds: [Number(tempData.size.id)],
      photoGuideImages: tempData.photoGuideImages,
      description: tempData.description,
      quoteTitle: tempData.quoteTitle
    };
    mutatePostRegister(data as SubmitType, {
      onSuccess(id) {
        logEvent(attrKeys.camelSeller.SUBMIT_PRODUCT, {
          name: attrProperty.name.NEWPRODUCT_MAIN,
          value: id
        });
        // alert(id);
        // alert(JSON.stringify(data))
        resetTempData();
        resetSubmitData();
        resetValidatorPhoto();
        window.history.replaceState(null, '', '/user/shop');
        replace(`/products/${id}?success=true`);
      }
    });
  };

  return (
    <>
      <RegisterButtonBox
        isEditTitle={modify.isState}
        registerActive={!!validatorResult && !!validatorPhoto.isState}
      >
        <Button
          fullWidth
          variant="contained"
          size="large"
          customStyle={{ height: 52 }}
          onClick={modify.isState ? handleClickEditTitle : handleClickRegister}
        >
          {modify.isState && '입력완료'}
          {!modify.isState && (query.id ? '수정하기' : '매물 등록하기')}
        </Button>
      </RegisterButtonBox>
      <Box customStyle={{ minHeight: 100 }} />
      <Toast
        open={openEmptyTitleToast.isState}
        onClose={() => setOpenEmptyTitleToast(({ type }) => ({ type, isState: false }))}
        customStyle={{ fontSize: typography.body1.size }}
      >
        상품명은 필수로 입력해주세요.
      </Toast>
      <Toast
        open={openValidateToast.isState}
        onClose={() => setOpenValidateToast(({ type }) => ({ type, isState: false }))}
        customStyle={{ textAlign: 'center' }}
      >
        사진, 상태, 사이즈 및 색상, 가격은
        <br />
        필수 입력사항이에요.
      </Toast>
    </>
  );
}

const RegisterButtonBox = styled.div<{
  isEditTitle: boolean;
  registerActive: boolean;
  // focusTitle: boolean;
}>`
  padding: 0 20px;
  height: 70px;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
  button {
    background: ${({ theme: { palette }, isEditTitle, registerActive }) =>
      isEditTitle || registerActive ? palette.primary.main : palette.common.ui80};
    color: ${({ theme: { palette }, isEditTitle, registerActive }) =>
      isEditTitle || registerActive ? palette.common.uiWhite : palette.common.ui60};
    font-weight: ${({ theme: { typography } }) => typography.h4.weight.medium};
  }
`;

export default CamelSellerConfirmFooter;
