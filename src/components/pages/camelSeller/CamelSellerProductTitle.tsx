import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { deviceIdState } from '@recoil/common';
import {
  camelSellerBooleanStateFamily,
  camelSellerTempSaveDataState,
  setModifyProductTitleState
} from '@recoil/camelSeller';

function CamelSellerProductTitle() {
  const {
    theme: {
      palette: { primary, secondary, common }
    }
  } = useTheme();
  const { query } = useRouter();
  const deviceId = useRecoilValue(deviceIdState);
  const productId = Number(query.id || 0);
  const textareaRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const setModifyProductTitle = useSetRecoilState(setModifyProductTitleState);
  const [{ isState }, setIsModify] = useRecoilState(camelSellerBooleanStateFamily('modifyName'));
  const setFocusTitle = useSetRecoilState(camelSellerBooleanStateFamily('focusTitle'));
  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);

  const { data: editData } = useQuery(
    queryKeys.products.sellerEditProducs({ productId, deviceId }),
    () => fetchProduct({ productId, deviceId }),
    {
      enabled: !!productId
    }
  );

  useEffect(() => {
    if (editData) {
      setTitle(tempData?.title || editData.product.quoteTitle || editData.product.title);
    } else {
      setTitle(tempData?.title || (query.title as string));
    }
  }, [editData, query, tempData]);

  const handleClickEdit = () => {
    if (!isState) {
      logEvent(attrKeys.camelSeller.CLICK_PRODUCT_EDIT, {
        name: attrProperty.name.PRODUCT_MAIN,
        title: attrProperty.title.TITLE
      });
      setIsModify(({ type }) => ({ type, isState: true }));
    }
  };

  const handleClickClose = () => {
    // setIsModify(({ type }) => ({ type, isState: false }));
    setTitle('');
    textareaRef.current?.focus();
  };

  const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTitle(value);
    setModifyProductTitle(value);
  };

  const handleFocus = () => {
    setFocusTitle(({ type }) => ({ type, isState: true }));
  };

  const handleBlur = (e: FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    setModifyProductTitle(title);
    setTempData({
      ...tempData,
      title
    });
    setIsModify(({ type }) => ({ type, isState: false }));
  };

  const handleBlurBlock = (e: FormEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClickSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFocusTitle(({ type }) => ({ type, isState: false }));
    setModifyProductTitle(title);
    setTempData({
      ...tempData,
      title
    });
    setIsModify(({ type }) => ({ type, isState: false }));
  };

  return (
    <>
      <Flexbox alignment="center" justifyContent="space-between" onClick={handleClickEdit}>
        {isState && (
          <ModifyArea isTitle={title} alignment="center" justifyContent="space-between">
            <FormWrap onSubmit={handleClickSubmit}>
              <TextareaTitle
                ref={textareaRef}
                maxLength={40}
                placeholder="상품명 입력"
                onChange={handleChangeTitle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                value={title}
                autoFocus
              />
            </FormWrap>
            <Box
              customStyle={{
                padding: 10,
                position: 'absolute',
                top: -6,
                right: 0
              }}
              onClick={handleClickClose}
              onMouseDown={handleBlurBlock}
            >
              <CloseIconWrap alignment="center" justifyContent="center">
                <Icon name="CloseOutlined" />
              </CloseIconWrap>
            </Box>
          </ModifyArea>
        )}
        {!isState && (
          <>
            <Typography weight="medium" variant="h4" customStyle={{ wordBreak: 'break-word' }}>
              {title}
            </Typography>
            <Icon name="EditFilled" customStyle={{ color: common.ui80 }} />
          </>
        )}
      </Flexbox>
      <Flexbox justifyContent="space-between" alignment="center">
        <Typography brandColor="primary" variant="small1" customStyle={{ marginTop: 8 }}>
          {editData
            ? `${editData.product.brand.name} > ${editData.product.category.name}`
            : `${query.brandName} > ${query.subParentCategoryName || query.categoryName}`}
        </Typography>
        {isState && title && (
          <Flexbox alignment="center" gap={3}>
            <Typography
              variant="small1"
              weight="bold"
              customStyle={{
                color: title.length < 40 ? primary.main : secondary.red.main
              }}
            >
              {title.length}
            </Typography>
            <Typography variant="small1">/</Typography>
            <Typography variant="small1" customStyle={{ color: common.ui60 }}>
              40
            </Typography>
          </Flexbox>
        )}
      </Flexbox>
    </>
  );
}

const TextareaTitle = styled.input`
  width: 85%;
  height: 24px;
  outline: none;
  border: none;
  resize: none;
  font-weight: ${({ theme: { typography } }) => typography.h4.weight.medium};
  font-size: ${({ theme: { typography } }) => typography.h4.size};
`;

const FormWrap = styled.form`
  width: 100%;
`;

const ModifyArea = styled(Flexbox)<{ isTitle: string }>`
  width: 100%;
  position: relative;
  /* border-bottom: ${({ isTitle, theme }) =>
    isTitle ? `2px solid ${theme.palette.primary.main}` : 'none'}; */
`;

const CloseIconWrap = styled(Flexbox)`
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui80};
  width: 18px;
  height: 18px;
  border-radius: 50%;
  padding: 2px;
  /* position: absolute;
  top: 4px;
  right: 0; */
  svg {
    color: ${({
      theme: {
        palette: { common }
      }
    }) => common.uiWhite};
  }
`;

export default CamelSellerProductTitle;
