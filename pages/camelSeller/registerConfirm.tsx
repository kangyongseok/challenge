import { useEffect, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Toast, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  CamelSellerBottomSheetCondition,
  CamelSellerHeader,
  CamelSellerPhotoGuide,
  CamelSellerPhotoTitle,
  CamelSellerPrice,
  CamelSellerRecentBottomSheet,
  CamelSellerRegisterCondition,
  CamelSellerRegisterState,
  CamelSellerRegisterTextForm
} from '@components/pages/camelSeller';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import { fetchProduct, postProducts, putProductEdit } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { CamelSellerLocalStorage, SubmitType } from '@typings/camelSeller';
import { userShopSelectedProductState } from '@recoil/userShop';
import { deviceIdState } from '@recoil/common';
import {
  camelSellerBooleanStateFamily,
  camelSellerEditState,
  camelSellerSubmitState,
  setModifyProductTitleState,
  submitValidatorState
} from '@recoil/camelSeller';

const sampleData = [
  {
    photoGuideId: 1,
    imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/mrcamel/product/20210723_12842408_0.jpg'
  },
  {
    photoGuideId: 2,
    imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/mrcamel/product/20210723_12842408_0.jpg'
  }
];

function RegisterConfirm() {
  const {
    theme: { typography }
  } = useTheme();
  const { query, replace, push, asPath } = useRouter();
  const productId = Number(query.id);
  const deviceId = useRecoilValue(deviceIdState);
  const [modify, setIsModify] = useRecoilState(camelSellerBooleanStateFamily('modifyName'));
  const [editMode, setEditMode] = useRecoilState(camelSellerBooleanStateFamily('edit'));
  const setSubmitClickState = useSetRecoilState(camelSellerBooleanStateFamily('submitClick'));
  const [validatorPhoto, setRequirePhotoValid] = useRecoilState(
    camelSellerBooleanStateFamily('requirePhotoValid')
  );
  const setUserShopSelectedProductState = useSetRecoilState(userShopSelectedProductState);
  const [openEmptyTitleToast, setOpenEmptyTitleToast] = useRecoilState(
    camelSellerBooleanStateFamily('title')
  );
  const [openValidateToast, setOpenValidateToast] = useRecoilState(
    camelSellerBooleanStateFamily('validate')
  );
  const [submitData, setSubmitData] = useRecoilState(camelSellerSubmitState);
  const [camelSeller, setCamelSeller] = useState<CamelSellerLocalStorage>();
  const customTitle = useRecoilValue(setModifyProductTitleState);
  const [editData, setEditData] = useRecoilState(camelSellerEditState);
  const validatorResult = useRecoilValue(submitValidatorState);
  const { mutate: mutatePutEdit } = useMutation(putProductEdit);
  const { mutate: mutatePostRegister } = useMutation(postProducts);
  const { data } = useQuery(
    queryKeys.products.sellerModifyProducs({ productId, deviceId }),
    () => fetchProduct({ productId, deviceId }),
    {
      enabled: !!productId
    }
  );

  useEffect(() => {
    const getData = LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage;
    LocalStorage.set(CAMEL_SELLER, {
      ...getData,
      step: asPath
    });
    if (!editMode.isState) {
      setCamelSeller(getData);
    }
    setRequirePhotoValid(({ type }) => ({
      type,
      isState: false
    }));
    ChannelTalk.hideChannelButton();
    return () => {
      setSubmitClickState(({ type }) => ({ type, isState: false }));
      setIsModify(({ type }) => ({
        type,
        isState: false
      }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setEditMode(({ type }) => ({
      type,
      isState: !!query.id
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (!editData && data?.product && editMode.isState) {
      const {
        title,
        price,
        brand,
        category,
        categorySizes,
        labels,
        colors,
        quoteTitle,
        description,
        photoGuideImages
      } = data.product;
      const setEditLocalStorageData = {
        title,
        keyword: quoteTitle,
        price,
        category: { id: category.id || 0, name: category.name },
        brand: { id: brand.id || 0, name: brand.name },
        color: colors[0],
        size: categorySizes[0],
        description: description || '',
        condition: labels[0],
        photoGuideImages:
          process.env.NODE_ENV === 'development' && !data.product.photoGuideImages
            ? sampleData
            : data.product.photoGuideImages
      };
      setEditData(setEditLocalStorageData);
      setSubmitData({
        title,
        price,
        brandIds: [Number(brand.id)],
        categoryIds: [Number(category.id)],
        conditionId: labels[0].id,
        colorIds: [Number(colors[0].id)],
        categorySizeIds: [Number(categorySizes[0].id)],
        photoGuideImages,
        description,
        quoteTitle
      });
    } else {
      setSubmitData({
        title: camelSeller?.title || editData?.title || '',
        price: camelSeller?.price || editData?.price || 0,
        brandIds: [camelSeller?.brand?.id || editData?.brand?.id || 0],
        categoryIds: [camelSeller?.category.id || editData?.category.id || 0],
        conditionId: camelSeller?.condition?.id || editData?.condition?.id || 0,
        colorIds: [camelSeller?.color?.id || editData?.color?.id || 0],
        categorySizeIds: [camelSeller?.size?.id || editData?.size?.id || 0],
        photoGuideImages: camelSeller?.photoGuideImages || editData?.photoGuideImages || [],
        description: camelSeller?.description || editData?.description,
        quoteTitle: camelSeller?.keyword || editData?.keyword
      });
    }
  }, [
    camelSeller?.brand?.id,
    camelSeller?.category.id,
    camelSeller?.color?.id,
    camelSeller?.condition?.id,
    camelSeller?.description,
    camelSeller?.keyword,
    camelSeller?.photoGuideImages,
    camelSeller?.price,
    camelSeller?.size?.id,
    camelSeller?.title,
    data?.product,
    editData,
    editMode.isState,
    setEditData,
    setSubmitData
  ]);
  const handleClickEditTitle = () => {
    setIsModify(({ type }) => ({
      type,
      isState: false
    }));
    if (!editMode.isState) {
      LocalStorage.set(CAMEL_SELLER, {
        ...camelSeller,
        title: customTitle
      });
    }
    setSubmitData({
      ...(submitData as SubmitType),
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
    setUserShopSelectedProductState({
      id: productId
    });

    if (editMode.isState) {
      mutatePutEdit(
        {
          productId,
          parameter: submitData as SubmitType
        },
        {
          onSuccess() {
            push(`/products/${productId}?success=true`);
          }
        }
      );
    } else {
      mutatePostRegister(submitData as SubmitType, {
        onSuccess(id) {
          logEvent(attrKeys.camelSeller.SUBMIT_PRODUCT, {
            name: attrProperty.name.NEWPRODUCT_MAIN,
            value: id
          });
          LocalStorage.remove(CAMEL_SELLER);
          replace(`/products/${id}?success=true`);
        }
      });
    }
  };

  return (
    <GeneralTemplate
      header={<CamelSellerHeader />}
      footer={
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
              {!modify.isState && (editMode.isState ? '수정하기' : '매물 등록하기')}
            </Button>
          </RegisterButtonBox>
          <Box customStyle={{ minHeight: 100 }} />
        </>
      }
    >
      <CamelSellerPhotoGuide />
      <Box customStyle={{ marginTop: 160 }}>
        <Content>
          <CamelSellerPhotoTitle />
        </Content>
        <Content>
          <CamelSellerRegisterCondition />
        </Content>
        <Content>
          <CamelSellerRegisterState />
        </Content>
        <Content>
          <CamelSellerPrice />
        </Content>
        <CamelSellerRegisterTextForm />
      </Box>
      <CamelSellerBottomSheetCondition />
      <CamelSellerRecentBottomSheet />
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
    </GeneralTemplate>
  );
}

const RegisterButtonBox = styled.div<{ isEditTitle: boolean; registerActive: boolean }>`
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

const Content = styled.div`
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
`;

export default RegisterConfirm;
