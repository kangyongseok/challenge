import { useEffect, useMemo, useState } from 'react';

import { useRecoilState } from 'recoil';
import { BottomSheet, Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import omitBy from 'lodash-es/omitBy';
import isEmpty from 'lodash-es/isEmpty';

import SearchHelperBottomSheetSkeleton from '@components/pages/searchHelper/SearchHelperBottomSheetSkeleton';

import type { GenderCategory } from '@dto/product';
import type { CommonCode } from '@dto/common';

import { logEvent } from '@library/amplitude';

import { filterGenders } from '@constants/productsFilter';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/common';

import { searchParamsState, selectedSearchOptionsState } from '@recoil/searchHelper';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

import SearchHelperBottomSheetButton from './SearchHelperBottomSheetButton';

interface SearchHelperCategoryBottomSheetProps {
  isLoading: boolean;
  open: boolean;
  onClose: () => void;
  genderCategories: GenderCategory<CommonCode>[] | undefined;
  getUserSize: (parentCategoryId: number, selectedGenderName: string) => void;
}

function SearchHelperCategoryBottomSheet({
  isLoading,
  open,
  onClose,
  genderCategories,
  getUserSize
}: SearchHelperCategoryBottomSheetProps) {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const [searchParams, setSearchParams] = useRecoilState(searchParamsState);
  const [selectedSearchOptions, setSelectedSearchOptions] = useRecoilState(
    selectedSearchOptionsState
  );
  const { data: { info: { value: { gender = '' } = {} } = {} } = {} } = useQueryUserInfo();
  const [selectedOptions, setSelectedOptions] = useState({
    gender: { id: 0, name: '' },
    parentCategory: { id: 0, name: '' },
    subParentCategory: { id: 0, name: '' }
  });

  const { parentCategories, subParentCategories } = useMemo(
    () => ({
      parentCategories:
        genderCategories
          ?.find(({ id }) => searchParams.genderIds?.includes(id))
          ?.parentCategories.filter(({ name, count }) =>
            searchParams.genderIds?.includes(filterGenders.male.id)
              ? name !== '원피스(P)' && name && count > 0
              : name && count > 0
          ) || [],
      subParentCategories:
        genderCategories
          ?.find(({ id }) => searchParams.genderIds?.includes(id))
          ?.subParentCategories.filter(
            ({ name, count }) =>
              !(
                searchParams.genderIds?.includes(filterGenders.male.id)
                  ? ['스커트', '힐/펌프스', '버킷백', '그릇']
                  : ['그릇']
              ).includes(name) &&
              name &&
              count > 0
          ) || []
    }),
    [genderCategories, searchParams.genderIds]
  );
  const parentCategoryInfo = parentCategories.find(
    ({ id }) => selectedOptions.parentCategory.id === id
  );
  const showSubParentCategories =
    selectedOptions.gender.id > 0 && selectedOptions.parentCategory.id > 0;
  const showBackButton = (!gender && selectedOptions.gender.id > 0) || showSubParentCategories;

  const handleClose = () => {
    onClose();
    setSelectedOptions({
      gender: { id: 0, name: '' },
      parentCategory: { id: 0, name: '' },
      subParentCategory: { id: 0, name: '' }
    });
    setSearchParams(({ deviceId, brandIds }) =>
      omitBy(
        {
          deviceId,
          brandIds,
          genderIds:
            selectedSearchOptions.gender.id > 0
              ? [selectedSearchOptions.gender.id, filterGenders.common.id]
              : [],
          parentIds:
            selectedSearchOptions.parentCategory.id > 0
              ? [selectedSearchOptions.parentCategory.id]
              : [],
          subParentIds:
            selectedSearchOptions.subParentCategory.id > 0
              ? [selectedSearchOptions.subParentCategory.id]
              : [],
          categorySizeIds:
            selectedSearchOptions.sizes.length > 0
              ? [selectedSearchOptions.sizes.map(({ id }) => id)]
              : []
        },
        isEmpty
      )
    );
  };

  const handleClickBack = () => {
    if (showSubParentCategories) {
      setSearchParams(({ deviceId, brandIds, genderIds }) => ({ deviceId, brandIds, genderIds }));
      setSelectedOptions((prevState) => ({
        gender: prevState.gender,
        parentCategory: { id: 0, name: '' },
        subParentCategory: { id: 0, name: '' }
      }));
    } else {
      setSearchParams(({ deviceId, brandIds }) => ({ deviceId, brandIds }));
      setSelectedOptions({
        gender: { id: 0, name: '' },
        parentCategory: { id: 0, name: '' },
        subParentCategory: { id: 0, name: '' }
      });
    }
  };

  const handleClickGender = (selectedGender: { id: number; name: string }) => () => {
    setSelectedOptions((prevState) => ({ ...prevState, gender: selectedGender }));
    setSearchParams((currVal) => ({
      ...currVal,
      genderIds: [selectedGender.id, filterGenders.common.id]
    }));

    if (selectedOptions.parentCategory.id > 0) {
      onClose();
      setSelectedSearchOptions((currVal) => ({ ...currVal, gender: selectedGender }));
      setSelectedOptions({
        gender: { id: 0, name: '' },
        parentCategory: { id: 0, name: '' },
        subParentCategory: { id: 0, name: '' }
      });
      getUserSize(selectedOptions.parentCategory.id, selectedGender.name);
    }
  };

  const handleClickCategory =
    ({ id, name }: { id: number; name: string }) =>
    () => {
      if (showSubParentCategories) {
        setSelectedOptions((prevState) => ({
          ...prevState,
          subParentCategory:
            prevState.subParentCategory.id === id ? { id: 0, name: '' } : { id, name }
        }));
      } else {
        setSelectedOptions((prevState) => ({
          ...prevState,
          parentCategory: { id, name },
          subParentCategory: { id: 0, name: '' }
        }));
        setSearchParams((currVal) => ({ ...currVal, parentIds: [id] }));
      }
    };

  const handleClickCtaButton = () => {
    logEvent(attrKeys.searchHelper.SELECT_ITEM, {
      name: 'SEARCHHELPER',
      title: 'CATEGORY',
      att:
        selectedOptions.subParentCategory.id > 0
          ? selectedOptions.subParentCategory.name
          : selectedOptions.parentCategory.name
    });
    onClose();
    setSelectedSearchOptions((currVal) => ({
      pathname: currVal.pathname,
      brand: currVal.brand,
      gender: selectedOptions.gender,
      parentCategory: selectedOptions.parentCategory,
      subParentCategory: selectedOptions.subParentCategory,
      sizes: []
    }));
    setSearchParams((currVal) => ({
      deviceId: currVal.deviceId,
      brandIds: currVal.brandIds,
      ...omitBy(
        {
          genderIds: [selectedOptions.gender.id, filterGenders.common.id],
          parentIds: [selectedOptions.parentCategory.id],
          subParentIds:
            selectedOptions.subParentCategory.id > 0 ? [selectedOptions.subParentCategory.id] : []
        },
        isEmpty
      )
    }));
    setSelectedOptions({
      gender: { id: 0, name: '' },
      parentCategory: { id: 0, name: '' },
      subParentCategory: { id: 0, name: '' }
    });
    getUserSize(selectedOptions.parentCategory.id, selectedOptions.gender.name);
  };

  useEffect(() => {
    if (open) {
      setSelectedOptions({
        gender: selectedSearchOptions.gender,
        parentCategory: selectedSearchOptions.parentCategory,
        subParentCategory: selectedSearchOptions.subParentCategory
      });
    }
  }, [
    open,
    selectedSearchOptions.gender,
    selectedSearchOptions.parentCategory,
    selectedSearchOptions.subParentCategory
  ]);

  return (
    <BottomSheet open={open} onClose={handleClose} customStyle={{ height: 522 }}>
      {open && (
        <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
          <Typography variant="h3" weight="bold" customStyle={{ padding: '12px 20px 16px' }}>
            카테고리
          </Typography>
          {showBackButton && (
            <Flexbox
              alignment="center"
              gap={2}
              customStyle={{ padding: '2px 20px 6px' }}
              onClick={handleClickBack}
            >
              <Icon name="ArrowLeftOutlined" size="small" customStyle={{ color: common.ui60 }} />
              <Typography variant="small2" weight="medium" customStyle={{ color: common.ui60 }}>
                돌아가기
              </Typography>
            </Flexbox>
          )}
          <Box customStyle={{ flex: '1 1 0%', overflowY: 'auto' }}>
            {isLoading ? (
              Array.from({ length: 10 }, (_, index) => (
                <SearchHelperBottomSheetSkeleton key={`search-helper-category-skeleton-${index}`} />
              ))
            ) : (
              <>
                {!searchParams.genderIds?.length &&
                  genderCategories?.map(({ id, name, synonyms, count }) => (
                    <Flexbox
                      key={`gender-${name}`}
                      alignment="center"
                      gap={8}
                      customStyle={{ padding: '10px 20px' }}
                      onClick={handleClickGender({ id, name: synonyms })}
                    >
                      <Typography variant="body1" weight="medium">
                        {name}
                      </Typography>
                      <Typography variant="small2" customStyle={{ color: common.ui60 }}>
                        {commaNumber(count)}
                      </Typography>
                    </Flexbox>
                  ))}
                {!!searchParams.genderIds?.length &&
                  (showSubParentCategories ? subParentCategories : parentCategories).map(
                    ({ id, name, count }) => (
                      <Flexbox
                        key={`category-${name}`}
                        alignment="center"
                        gap={8}
                        customStyle={{ padding: '10px 20px' }}
                        onClick={handleClickCategory({ id, name: name.replace('(P)', '') })}
                      >
                        <Typography
                          variant="body1"
                          weight={selectedOptions.subParentCategory.id === id ? 'bold' : 'medium'}
                          customStyle={{
                            color:
                              selectedOptions.subParentCategory.id === id ? primary.main : undefined
                          }}
                        >
                          {name.replace('(P)', '')}
                        </Typography>
                        <Typography variant="small2" customStyle={{ color: common.ui60 }}>
                          {commaNumber(count)}
                        </Typography>
                      </Flexbox>
                    )
                  )}
              </>
            )}
          </Box>
          {showSubParentCategories && (
            <SearchHelperBottomSheetButton
              variant={selectedOptions.subParentCategory.id > 0 ? 'contained' : 'outlined'}
              onClick={handleClickCtaButton}
            >
              {selectedOptions.subParentCategory.id > 0
                ? '선택완료'
                : `${parentCategoryInfo?.name.replace('(P)', '') || ''} 전체선택`}
            </SearchHelperBottomSheetButton>
          )}
        </Flexbox>
      )}
    </BottomSheet>
  );
}

export default SearchHelperCategoryBottomSheet;
