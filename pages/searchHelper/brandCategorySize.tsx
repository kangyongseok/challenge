import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Tooltip, Typography, useTheme } from 'mrcamel-ui';
import omitBy from 'lodash-es/omitBy';
import isEmpty from 'lodash-es/isEmpty';
import debounce from 'lodash-es/debounce';
import styled from '@emotion/styled';

import { Divider } from '@components/UI/molecules';
import {
  SearchHelperCategoryBottomSheet,
  SearchHelperFixedBottomCTAButton,
  SearchHelperInput,
  SearchHelperLinearProgress,
  SearchHelperMultiOptionBottomSheet
} from '@components/pages/searchHelper';

import { logEvent } from '@library/amplitude';

import { fetchSizeMapping } from '@api/user';
import { fetchSearch } from '@api/product';
import { fetchBrandsSuggest } from '@api/brand';

import queryKeys from '@constants/queryKeys';
import { PARENT_CATEGORY_NEED_SIZE } from '@constants/category';
import attrKeys from '@constants/attrKeys';

import commaNumber from '@utils/commaNumber';
import checkAgent from '@utils/checkAgent';

import {
  allSelectedSearchOptionsSelector,
  searchParamsState,
  selectedSearchOptionsState
} from '@recoil/searchHelper';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function BrandCategorySize() {
  const router = useRouter();
  const {
    theme: { palette }
  } = useTheme();
  const [searchParams, setSearchParams] = useRecoilState(searchParamsState);
  const [selectedSearchOptions, setSelectedSearchOptions] = useRecoilState(
    selectedSearchOptionsState
  );
  const { brandLabel, categoryLabel } = useRecoilValue(allSelectedSearchOptionsSelector);

  const { data: accessUser } = useQueryAccessUser();
  const { data: userInfo } = useQueryUserInfo();
  const [brandsSuggestParams, setBrandsSuggestParams] = useState({ keyword: '' });
  const { data: keywordsSuggest, isFetching: isFetchingKeywordsSuggest } = useQuery(
    queryKeys.brands.suggest(brandsSuggestParams),
    () => fetchBrandsSuggest(brandsSuggestParams),
    { enabled: brandsSuggestParams.keyword.length > 0 }
  );
  const { data, isLoading } = useQuery(
    queryKeys.products.search(searchParams),
    () => fetchSearch(searchParams),
    { enabled: !!searchParams.brandIds?.length || !!searchParams.parentIds?.length }
  );
  const { data: sizeMapping } = useQuery(queryKeys.users.sizeMapping(), fetchSizeMapping);

  const [brandValue, setBrandValue] = useState('');
  const [focusedBrand, setFocusedBrand] = useState(false);
  const [showNoBrandErrorLabel, setShowNoBrandErrorLabel] = useState(false);
  const [isRequireSize, setIsRequireSize] = useState(false);
  const [showGetUserSizeTooltip, setShowGetUserSizeTooltip] = useState(false);
  const [openBottomSheet, setOpenBottomSheet] = useState<'category' | 'size' | null>(null);
  const debounceBrandsSuggestParams = useRef(
    debounce((keyword: string) => setBrandsSuggestParams({ keyword }), 500)
  ).current;

  const sizeData = useMemo(
    () =>
      data?.searchOptions.categorySizes
        .filter(({ count }) => count > 0)
        .map(({ categorySizeId, viewSize, count }) => ({
          id: categorySizeId,
          name: viewSize,
          count
        })),
    [data?.searchOptions.categorySizes]
  );

  const isShowKeywordsSuggest =
    focusedBrand && brandValue.length > 0 && !!keywordsSuggest && !isFetchingKeywordsSuggest;
  const hasNoBrand = !isLoading && selectedSearchOptions.brand.id === 0;
  const hasNoGender =
    !isLoading &&
    selectedSearchOptions.brand.id > 0 &&
    selectedSearchOptions.parentCategory.id > 0 &&
    selectedSearchOptions.gender.id === 0;
  const hasNoSize = !isLoading && !!searchParams.categorySizeIds?.length && !data?.productTotal;

  const handleChangeBrand = (e: ChangeEvent<HTMLInputElement>) => {
    const newKeyword = e.target.value;

    if (selectedSearchOptions.brand.id > 0) {
      setSelectedSearchOptions(({ pathname, gender, parentCategory, subParentCategory }) => ({
        pathname,
        gender,
        parentCategory,
        subParentCategory,
        brand: { id: 0, name: '' },
        sizes: []
      }));

      if (isRequireSize) setIsRequireSize(false);
    }

    setBrandValue(newKeyword);
    debounceBrandsSuggestParams(newKeyword);
  };

  const handleFocusBrand = useCallback(() => {
    setFocusedBrand(true);

    if (showNoBrandErrorLabel) setShowNoBrandErrorLabel(false);
  }, [showNoBrandErrorLabel]);

  const handleClearBrand = useCallback(() => {
    setBrandValue('');
    setBrandsSuggestParams({ keyword: '' });
    setSearchParams(({ brandIds, ...currVal }) => currVal);
    setSelectedSearchOptions((currVal) => ({ ...currVal, brand: { id: 0, name: '' } }));
  }, [setSearchParams, setSelectedSearchOptions]);

  const handleClickBrand =
    ({ id, name }: { id: number; name: string }) =>
    () => {
      logEvent(attrKeys.searchHelper.SELECT_ITEM, {
        name: 'SEARCHHELPER',
        title: 'BRAND',
        att: name
      });

      setBrandValue(name);
      setBrandsSuggestParams({ keyword: name });
      setSearchParams((currVal) => ({ ...currVal, brandIds: [id] }));
      setSelectedSearchOptions((currVal) => ({ ...currVal, brand: { id, name } }));

      if (selectedSearchOptions.parentCategory.id > 0 && selectedSearchOptions.gender.id > 0)
        getUserSize(selectedSearchOptions.parentCategory.id, selectedSearchOptions.gender.name);
    };

  const handleOpenCategoryBottomSheet = useCallback(() => {
    if (hasNoBrand) {
      setShowNoBrandErrorLabel(true);
      return;
    }

    if (searchParams.genderIds?.length) {
      if (searchParams.subParentIds?.length) {
        setSearchParams(({ subParentIds, categorySizeIds, ...currVal }) => currVal);
      } else {
        setSearchParams(({ categorySizeIds, ...currVal }) => currVal);
      }
    }

    setOpenBottomSheet('category');
  }, [
    hasNoBrand,
    searchParams.genderIds?.length,
    searchParams.subParentIds?.length,
    setSearchParams
  ]);

  const handleOpenSizeBottomSheet = useCallback(() => {
    if (hasNoBrand || hasNoGender) return;

    if (hasNoSize) {
      setSelectedSearchOptions((currVal) => ({
        ...currVal,
        sizes: []
      }));
    }

    if (searchParams.categorySizeIds?.length) {
      setSearchParams(({ categorySizeIds, ...currVal }) => currVal);
    }

    setOpenBottomSheet('size');
  }, [
    hasNoBrand,
    hasNoGender,
    hasNoSize,
    searchParams.categorySizeIds?.length,
    setSearchParams,
    setSelectedSearchOptions
  ]);

  const handleClickNext = useCallback(() => {
    logEvent(attrKeys.searchHelper.SELECT_SEARCHHELPER, {
      name: 'STEP1',
      att: [
        brandLabel,
        categoryLabel,
        selectedSearchOptions.sizes
          .map(({ name }) => name)
          .filter((size) => size.length > 0)
          .join(', ')
      ]
        .filter((label) => label.length > 0)
        .join(', ')
    });
    router.replace('/searchHelper/lineBudgetMore');
  }, []);

  const handleCloseSize = useCallback(() => {
    setOpenBottomSheet(null);
    setSearchParams(({ categorySizeIds, ...currVal }) => ({
      ...currVal,
      ...omitBy({ categorySizeIds: selectedSearchOptions.sizes.map(({ id }) => id) }, isEmpty)
    }));
  }, [selectedSearchOptions.sizes, setSearchParams]);

  const handleSelectSize = useCallback(
    (selectedOptions: { id: number; name: string }[]) => {
      if (selectedOptions.length > 0) {
        logEvent(attrKeys.searchHelper.SELECT_ITEM, {
          name: 'SEARCHHELPER',
          title: 'SIZE',
          att: selectedOptions.map(({ name }) => name).join(', ')
        });
      }

      setOpenBottomSheet(null);
      setSelectedSearchOptions(
        ({ pathname, brand, gender, parentCategory, subParentCategory }) => ({
          pathname,
          brand,
          gender,
          parentCategory,
          subParentCategory,
          sizes: selectedOptions
        })
      );
      setSearchParams(({ deviceId, brandIds, genderIds, parentIds, subParentIds }) => ({
        deviceId,
        brandIds,
        genderIds,
        parentIds,
        subParentIds,
        ...omitBy({ categorySizeIds: selectedOptions.map(({ id }) => id) }, isEmpty)
      }));
    },
    [setSearchParams, setSelectedSearchOptions]
  );

  const getUserSize = (parentCategoryId: number, selectedGenderName: string) => {
    const isRequiredSizeCategory = Object.keys(
      PARENT_CATEGORY_NEED_SIZE[selectedGenderName as keyof typeof PARENT_CATEGORY_NEED_SIZE]
    ).some((key) => +key === parentCategoryId);

    if (!isRequiredSizeCategory) {
      if (isRequireSize) setIsRequireSize(false);

      setSelectedSearchOptions(({ sizes, ...currVal }) => ({ ...currVal, sizes: [] }));
      return;
    }

    const {
      info: { value: { gender = '' } = {} } = {},
      size: { value: { tops = [], bottoms = [], shoes = [] } = {} } = {}
    } = userInfo || {};
    const genderParentCategories = PARENT_CATEGORY_NEED_SIZE[gender === 'F' ? 'female' : 'male'];
    const parentCategoryName = Object.keys(genderParentCategories).some(
      (key) => +key === parentCategoryId
    )
      ? genderParentCategories[parentCategoryId as keyof typeof genderParentCategories]
      : '';
    let userSizes: { id: number; name: string }[] = [];

    if (parentCategoryName === '아우터' && tops.length > 0 && sizeMapping) {
      const { outer } = sizeMapping[gender === 'F' ? 'female' : 'male'];
      userSizes = outer
        .filter(({ size }) => tops.some(({ viewSize }) => viewSize === size.viewSize))
        .map(({ size }) => ({ id: size.categorySizeId, name: size.viewSize }));
    }

    if (parentCategoryName === '상의' && tops.length > 0) {
      userSizes = tops.map((top) => ({
        id: top.categorySizeId,
        name: top.viewSize
      }));
    }

    if (parentCategoryName === '하의' && bottoms.length > 0) {
      userSizes = bottoms.map((bottom) => ({
        id: bottom.categorySizeId,
        name: bottom.viewSize
      }));
    }

    if (parentCategoryName === '신발' && shoes.length > 0) {
      userSizes = shoes.map((shoe) => ({
        id: shoe.categorySizeId,
        name: shoe.viewSize
      }));
    }

    if (userSizes.length > 0) {
      logEvent(attrKeys.searchHelper.SELECT_ITEM, {
        name: 'SEARCHHELPER',
        title: 'SIZEAUTO',
        att: userSizes
          .map(({ name }) => name)
          .filter((size) => size.length > 0)
          .join(', ')
      });
      setSelectedSearchOptions(({ sizes, ...currVal }) => ({ ...currVal, sizes: userSizes }));
      setSearchParams(({ categorySizeIds, ...currVal }) => ({
        ...currVal,
        categorySizeIds: userSizes.map(({ id }) => id)
      }));
      setTimeout(() => setShowGetUserSizeTooltip(true), 500);
      setTimeout(() => setShowGetUserSizeTooltip(false), 2500);
    }

    setTimeout(() => setIsRequireSize(true), 500);
  };

  useEffect(() => {
    const {
      brand: { id: brandId },
      parentCategory: { id: parentCategoryId },
      gender: { id: genderId, name: genderName }
    } = selectedSearchOptions;

    if (brandId > 0) {
      setBrandValue(selectedSearchOptions.brand.name);
    }

    if (brandId > 0 && parentCategoryId > 0 && genderId > 0) {
      if (selectedSearchOptions.sizes.length === 0) {
        getUserSize(parentCategoryId, genderName);
      } else {
        setTimeout(() => setIsRequireSize(true), 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flexbox direction="vertical" customStyle={{ height: '100vh' }}>
      <SearchHelperLinearProgress
        value={
          3 +
          (Number(selectedSearchOptions.brand.id > 0) +
            Number(
              selectedSearchOptions.parentCategory.id > 0 && selectedSearchOptions.gender.id > 0
            ) +
            Number(selectedSearchOptions.sizes.length > 0)) *
            16
        }
        showInfoText={
          !!searchParams.brandIds?.length ||
          !!searchParams.parentIds?.length ||
          !!searchParams.categorySizeIds?.length
        }
        productTotal={data?.productTotal || 0}
      />
      <Flexbox
        direction="vertical"
        customStyle={{ padding: '0 20px 12px', flex: 1, overflow: 'scroll' }}
      >
        <Typography
          variant="h2"
          weight="bold"
          customStyle={{ padding: '55px 0 41px', '& > span': { color: palette.primary.main } }}
        >
          <span>어떤 매물</span>을 찾아볼까요?
        </Typography>
        <CustomBox isShowKeywordsSuggest={isShowKeywordsSuggest}>
          <SearchHelperInput
            autoFocus={selectedSearchOptions.brand.id === 0}
            labelText="브랜드"
            value={brandValue}
            placeholder="어떤 브랜드 찾으세요?"
            onChange={handleChangeBrand}
            onFocus={handleFocusBrand}
            onBlur={() => setTimeout(() => setFocusedBrand(false), 100)}
            onClear={handleClearBrand}
            showCheckIcon={selectedSearchOptions.brand.id > 0}
            showClearIcon
          />
          <CustomDivider active={focusedBrand} />
          {isShowKeywordsSuggest && (
            <Flexbox direction="vertical" customStyle={{ marginTop: 12, overflow: 'scroll' }}>
              {keywordsSuggest?.map(({ id, name, count }) => (
                <Flexbox
                  key={`brand-${id}`}
                  alignment="center"
                  gap={8}
                  customStyle={{ padding: '10px 0' }}
                  onClick={handleClickBrand({ id, name })}
                >
                  <Typography variant="body1" weight="medium">
                    {name}
                  </Typography>
                  <Typography variant="small2" customStyle={{ color: palette.common.grey['60'] }}>
                    {commaNumber(count)}
                  </Typography>
                </Flexbox>
              ))}
            </Flexbox>
          )}
          {(!focusedBrand || brandValue.length === 0 || !keywordsSuggest) && (
            <>
              <SearchHelperInput
                labelText="카테고리"
                placeholder="카테고리를 골라주세요"
                onClick={handleOpenCategoryBottomSheet}
                readOnly
                value={
                  (
                    selectedSearchOptions.subParentCategory.name ||
                    selectedSearchOptions.parentCategory.name
                  ).replace('(P)', '') || ''
                }
                customStyle={{ marginTop: 20 }}
                showCheckIcon={
                  selectedSearchOptions.parentCategory.id > 0 && selectedSearchOptions.gender.id > 0
                }
              />
              <SearchHelperSizeInputBox expanded={isRequireSize}>
                <CustomDivider />
                <SearchHelperInput
                  labelText="사이즈"
                  value={selectedSearchOptions.sizes.map(({ name }) => name).join(', ') || ''}
                  placeholder="사이즈를 골라주세요"
                  onClick={handleOpenSizeBottomSheet}
                  readOnly
                  showCheckIcon={selectedSearchOptions.sizes.length > 0}
                />
              </SearchHelperSizeInputBox>
            </>
          )}
        </CustomBox>
        <CustomTooltip
          open={showGetUserSizeTooltip}
          disableShadow
          placement="bottom"
          brandColor="primary-highlight"
          round="16"
          message={
            <Typography variant="body1" weight="bold">
              <span>{accessUser?.userName || '회원'}님의 사이즈</span>를 불러왔어요!
            </Typography>
          }
        />
        <Typography
          variant="body2"
          weight="medium"
          customStyle={{ margin: '8px 20px 0', color: palette.secondary.red.main }}
        >
          {(showNoBrandErrorLabel ||
            (!focusedBrand && hasNoBrand && selectedSearchOptions.parentCategory.id > 0)) &&
            '브랜드를 먼저 입력해주세요.'}
          {!focusedBrand && hasNoGender && '성별을 골라주세요.'}
          {selectedSearchOptions.brand.id > 0 &&
            selectedSearchOptions.parentCategory.id > 0 &&
            selectedSearchOptions.gender.id > 0 &&
            hasNoSize &&
            '사이즈를 불러왔지만 맞는 매물이 없어요.'}
        </Typography>
      </Flexbox>
      <SearchHelperFixedBottomCTAButton
        customStyle={{
          padding: checkAgent.isMobileApp() ? undefined : '0 20px 20px',
          position: 'relative'
        }}
        disabled={
          isLoading ||
          selectedSearchOptions.brand.id === 0 ||
          !searchParams.genderIds?.length ||
          !searchParams.parentIds?.length ||
          (isRequireSize && !searchParams.categorySizeIds?.length) ||
          !data?.productTotal
        }
        onClickNext={handleClickNext}
        onClickClose={() =>
          logEvent(attrKeys.searchHelper.CLICK_SEARCHHELPER, { name: 'STEP1', att: 'CLOSE' })
        }
      />
      <SearchHelperCategoryBottomSheet
        isLoading={isLoading}
        open={openBottomSheet === 'category'}
        onClose={() => setOpenBottomSheet(null)}
        getUserSize={getUserSize}
        genderCategories={data?.baseSearchOptions?.genderCategories}
      />
      <SearchHelperMultiOptionBottomSheet
        isLoading={isLoading}
        title="사이즈"
        data={sizeData}
        open={openBottomSheet === 'size'}
        onClose={handleCloseSize}
        onSelect={handleSelectSize}
      />
    </Flexbox>
  );
}

const CustomBox = styled.div<{ isShowKeywordsSuggest: boolean }>`
  width: 100%;
  border: 2px solid ${({ theme }) => theme.palette.common.grey['90']};
  border-radius: ${({ theme }) => theme.box.round['16']};
  padding: 20px 24px ${({ isShowKeywordsSuggest }) => (isShowKeywordsSuggest ? 12 : 20)}px;
  background-color: ${({ theme }) => theme.palette.common.white};
  display: flex;
  flex-direction: column;
  overflow: scroll;
`;

const CustomDivider = styled(Divider)`
  margin-top: ${({ active }) => (active ? 19 : 20)}px;
`;

const SearchHelperSizeInputBox = styled.div<{ expanded: boolean }>`
  overflow: hidden;
  max-height: ${({ expanded }) => (expanded ? 9000 : 0)}px;
  cursor: unset;

  > div {
    margin-top: ${({ expanded }) => (expanded ? '20px' : '0px')};
    transition: margin 0.2s ease-in-out, background-color 0.2s ease-in-out;
  }
`;

const CustomTooltip = styled(Tooltip)`
  > div {
    padding: 8px 12px;
    transform: translate(24px, 28px);

    > svg {
      left: 19px;
    }

    :after {
      border-top: 6px solid transparent;
      border-right: 11px solid #e5e8ff;
      border-left: 0 solid transparent;
      border-bottom: 6px solid transparent;
      top: 50%;
      left: -10px;
    }
  }

  * > span {
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

export default BrandCategorySize;
