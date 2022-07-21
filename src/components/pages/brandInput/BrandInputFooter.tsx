import { useEffect, useRef, useState } from 'react';

import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { Chip, CtaButton, Flexbox, Icon, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { postBrands } from '@api/brand';

import attrKeys from '@constants/attrKeys';

import type { SelectedHotBrand } from '@typings/brands';

interface BrandInputFooterProps {
  searchValue: string;
  selectBrands: SelectedHotBrand[];
  checkList: SelectedHotBrand[];
  onClickLabel: (parameter: SelectedHotBrand) => void;
  setCheckList: (parameter: SelectedHotBrand[]) => void;
  setSearchValue: (parameter: string) => void;
  clearValue: () => void;
  setSelectBrands: (parameter: []) => void;
  setToast: (parameter: boolean) => void;
}

const FOOTER_SELECT_LIST_BASIC_HEIGHT = 147;

function BrandInputFooter({
  checkList,
  onClickLabel,
  setCheckList,
  setSearchValue,
  clearValue,
  setSelectBrands,
  setToast,
  searchValue,
  selectBrands
}: BrandInputFooterProps) {
  const {
    theme: { palette }
  } = useTheme();
  const autoHeight = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { mutate } = useMutation(postBrands);

  const [moreToggle, setMoreToggle] = useState(false);
  const [clientHeight, setClientHeight] = useState(95);

  useEffect(() => {
    if (autoHeight.current) {
      if (autoHeight.current.clientHeight !== clientHeight) {
        setClientHeight(autoHeight.current.clientHeight);
      }
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [checkList, moreToggle]);

  const handleSave = () => {
    logEvent(attrKeys.userInput.SUBMIT_PERSONAL_INPUT, {
      name: 'BRAND',
      title: 'SAVE',
      att: checkList.map((list) => String(list.name)).join(',')
    });

    const result = checkList.map((list) => String(list.id));
    mutate(result, {
      onSuccess: () => {
        router.back();
      }
    });
  };

  const handleSelectSuccess = async () => {
    logEvent(attrKeys.userInput.SUBMIT_PERSONAL_INPUT, {
      name: 'BRAND',
      title: 'INPUT'
    });
    if (checkList.length >= 20) {
      setToast(true);
    }
    if (checkList.length < 20) {
      setCheckList(selectBrands);
    }
    setSearchValue('');
    clearValue();
    setSelectBrands([]);
  };

  const handleClickViewAll = () => {
    if (clientHeight > FOOTER_SELECT_LIST_BASIC_HEIGHT) {
      setMoreToggle((props) => !props);
      logEvent(attrKeys.userInput.CLICK_VIEW_ALL, {
        name: 'BRAND_INPUT',
        status: !moreToggle ? 'SHOW' : 'HIDE'
      });
    }
  };

  const handleSelectedBrandDelete = (list: SelectedHotBrand) => {
    logEvent(attrKeys.userInput.CLICK_BRAND_DELETE, {
      att: list.name
    });

    onClickLabel({ id: list.id, name: list.name });
  };

  return (
    <StyledFooter clientHeight={clientHeight}>
      <FooterFixed
        isChecked={checkList.length > 0}
        isSearchValue={!!searchValue}
        justifyContent="center"
        alignment="center"
        direction="vertical"
        ref={autoHeight}
      >
        <Icon
          name={
            moreToggle && clientHeight > FOOTER_SELECT_LIST_BASIC_HEIGHT
              ? 'LongCaretDownSpecify_66_11'
              : 'LongCaretUpSpecify_66_11'
          }
          width={70}
          height={8}
          customStyle={{
            display: searchValue || checkList.length === 0 ? 'none' : 'block'
          }}
          color={
            clientHeight > FOOTER_SELECT_LIST_BASIC_HEIGHT
              ? palette.common.black
              : palette.common.grey['90']
          }
          onClick={handleClickViewAll}
        />
        <SelectList
          isChecked={checkList.length > 0}
          moreToggle={moreToggle}
          isDisplay={!!searchValue}
        >
          {checkList.map((list) => (
            <Chip
              key={`brand-input-${list.id}`}
              variant="ghost"
              brandColor="primary"
              endIcon={<Icon name="CloseOutlined" size="small" />}
              onClick={() => handleSelectedBrandDelete(list)}
            >
              {list.name}
            </Chip>
          ))}
        </SelectList>
        <TransParentGradian moreToggle={moreToggle} />
        <CtaButton
          fullWidth
          customStyle={{ position: 'relative', zIndex: 10 }}
          variant="contained"
          brandColor="primary"
          size="large"
          disabled={searchValue ? selectBrands?.length === 0 : checkList.length === 0}
          onClick={searchValue ? handleSelectSuccess : handleSave}
        >
          {searchValue ? '선택완료' : '저장'}
        </CtaButton>
      </FooterFixed>
    </StyledFooter>
  );
}

const StyledFooter = styled.div<{ clientHeight: number }>`
  min-height: ${({ clientHeight }) => clientHeight + 15}px;
`;

const SelectList = styled(Flexbox)<{ isChecked: boolean; moreToggle: boolean; isDisplay: boolean }>`
  width: 100%;
  max-height: ${({ moreToggle }) => (moreToggle ? 'auto' : '60px')};
  overflow: hidden;
  margin: 16px 0 0 0;
  flex-wrap: wrap;
  display: ${({ isChecked, isDisplay }) => (!isDisplay && isChecked ? 'flex' : 'none')};
  padding-bottom: 10px;
  gap: 8px 6px;
`;

const TransParentGradian = styled.div<{ moreToggle: boolean }>`
  position: absolute;
  left: 0;
  bottom: 50px;
  width: 100%;
  height: 32px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, #ffffff 100%, #ffffff 100%);
  -webkit-filter: blur(20px);
  filter: blur(20px);
  pointer-events: none;
  display: ${({ moreToggle }) => (moreToggle ? 'none' : 'block')};
`;

const FooterFixed = styled(Flexbox)<{ isChecked: boolean; isSearchValue: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  background: ${({ theme: { palette } }) => palette.common.white};
  box-shadow: ${({ isSearchValue, isChecked }) =>
    isSearchValue || !isChecked ? '0' : '0px -4px 16px rgba(0, 0, 0, 0.1)'};
  border-top-right-radius: 16px;
  border-top-left-radius: 16px;
  padding: 10px 20px 20px;
`;

export default BrandInputFooter;
