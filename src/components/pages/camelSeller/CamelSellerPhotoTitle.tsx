import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { CamelSellerLocalStorage } from '@typings/camelSeller';
import {
  camelSellerBooleanStateFamily,
  camelSellerEditState,
  setModifyProductTitleState
} from '@recoil/camelSeller';

function CamelSellerPhotoTitle() {
  const {
    theme: {
      palette: { primary, secondary, common }
    }
  } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState('');
  const [camelSeller, setCamelSeller] = useState<CamelSellerLocalStorage>();
  const setModifyProductTitle = useSetRecoilState(setModifyProductTitleState);
  const [editData, setEditData] = useRecoilState(camelSellerEditState);
  const editMode = useRecoilValue(camelSellerBooleanStateFamily('edit'));
  const [{ isState }, setIsModify] = useRecoilState(camelSellerBooleanStateFamily('modifyName'));

  useEffect(() => {
    setCamelSeller(editData || (LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage));
  }, [isState, editData]);

  const handleClickEdit = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_EDIT, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.TITLE
    });
    setTitle(camelSeller?.title || (camelSeller?.keyword as string));
    setIsModify(({ type }) => ({ type, isState: true }));
  };

  const handleClickClose = () => {
    setIsModify(({ type }) => ({ type, isState: false }));
  };

  const handleChangeTitle = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    if (editMode.isState) {
      setEditData({
        ...(editData as CamelSellerLocalStorage),
        title: value
      });
    }
    setTitle(value);
    setModifyProductTitle(value);
  };

  // const handleFocus = () => {
  //   window.scrollTo({
  //     top: window.visualViewport.height - 500,
  //     behavior: 'smooth'
  //   });
  // };

  return (
    <>
      <Flexbox alignment="center" justifyContent="space-between">
        {isState && (
          <ModofyArea isTitle={title} alignment="flex-start" justifyContent="space-between">
            <TextareaTitle
              ref={textareaRef}
              maxLength={40}
              placeholder="상품명 입력"
              onChange={handleChangeTitle}
              // onFocus={handleFocus}
              value={title}
              autoFocus
            />
            <CloseIconWrap alignment="center" justifyContent="center" onClick={handleClickClose}>
              <Icon name="CloseOutlined" />
            </CloseIconWrap>
          </ModofyArea>
        )}
        {!isState && (
          <>
            <Typography weight="medium" variant="h4" customStyle={{ wordBreak: 'break-word' }}>
              {camelSeller?.title || camelSeller?.keyword}
            </Typography>
            <Icon
              name="EditFilled"
              customStyle={{ color: common.ui80 }}
              onClick={handleClickEdit}
            />
          </>
        )}
      </Flexbox>
      <Flexbox justifyContent="space-between" alignment="center">
        <Typography brandColor="primary" variant="small1" customStyle={{ marginTop: 8 }}>
          {`${camelSeller?.brand?.name} > ${camelSeller?.category?.name}`}
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

const TextareaTitle = styled.textarea`
  width: 100%;
  height: 24px;
  outline: none;
  border: none;
  resize: none;
  font-weight: ${({ theme: { typography } }) => typography.h4.weight.medium};
  font-size: ${({ theme: { typography } }) => typography.h4.size};
`;

const ModofyArea = styled(Flexbox)<{ isTitle: string }>`
  width: 100%;
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
  svg {
    color: ${({
      theme: {
        palette: { common }
      }
    }) => common.uiWhite};
  }
`;

export default CamelSellerPhotoTitle;
