import { useEffect, useMemo, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Label, Switch, Toast, Typography, useTheme } from 'mrcamel-ui';
import sortBy from 'lodash-es/sortBy';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { filterCodeIds, filterGenders } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParams } from '@utils/products';

import type { ProductsVariant, SelectedSearchOption } from '@typings/products';
import {
  activeMyFilterReceiveState,
  activeMyFilterState,
  myFilterIntersectionCategorySizesState,
  searchOptionsStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface MyFilterInfoProps {
  variant: ProductsVariant;
}

function MyFilterInfo({ variant }: MyFilterInfoProps) {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const atomParam = router.asPath.split('?')[0];

  const [activeMyFilter, setActiveMyFilterState] = useRecoilState(activeMyFilterState);
  const {
    searchOptions: { categorySizes = [], genderCategories = [] }
  } = useRecoilValue(searchOptionsStateFamily(`base-${atomParam}`));
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );
  const setSearchOptionsParamsState = useSetRecoilState(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const { searchParams: baseSearchParams } = useRecoilValue(
    searchParamsStateFamily(`base-${atomParam}`)
  );
  const myFilterIntersectionCategorySizes = useRecoilValue(myFilterIntersectionCategorySizesState);
  const setActiveMyFilterReceiveState = useSetRecoilState(activeMyFilterReceiveState);

  const [open, setOpen] = useState(false);
  const [activeToastOpen, setActiveToastOpen] = useState(false);
  const [inactiveToastOpen, setInActiveToastOpen] = useState(false);

  const { data: accessUser } = useQueryAccessUser();

  const {
    data: {
      info: { value: { gender = '' } = {} } = {},
      size: { value: { tops = [], bottoms = [], shoes = [] } = {} } = {}
    } = {}
  } = useQueryUserInfo();

  const title = useMemo(
    () => (variant === 'search' ? '내 성별/사이즈만 보기' : '내 사이즈만 보기'),
    [variant]
  );
  const needGender = useMemo(
    () => variant === 'search' && gender && gender !== 'N',
    [variant, gender]
  );

  const handleChange = () => {
    if (!activeMyFilter && !myFilterIntersectionCategorySizes.length) {
      setOpen(true);
      return;
    }

    logEvent(attrKeys.products.clickMyFilter, {
      name: attrProperty.name.filterModal,
      att: !activeMyFilter ? 'ON' : 'OFF'
    });

    const intersectionParentCategoryIds = Array.from(
      new Set(myFilterIntersectionCategorySizes.map(({ parentCategoryId }) => parentCategoryId))
    );
    const notIntersectionCategorySizes = categorySizes.filter(
      ({ parentCategoryId }) => !intersectionParentCategoryIds.includes(parentCategoryId)
    );
    let newSelectedSearchOptions: SelectedSearchOption[];
    let genderId = 0;
    if (gender === 'M') genderId = filterGenders.male.id;
    if (gender === 'F') genderId = filterGenders.female.id;

    if (!activeMyFilter) {
      setActiveToastOpen(true);
      newSelectedSearchOptions = [
        ...selectedSearchOptions,
        ...myFilterIntersectionCategorySizes.filter(
          ({ categorySizeId, parentCategoryId, viewSize }) =>
            !selectedSearchOptions.find(
              ({
                categorySizeId: intersectionCategorySizeId,
                parentCategoryId: intersectionParentCategoryId,
                viewSize: intersectionViewSize
              }) =>
                categorySizeId === intersectionCategorySizeId &&
                parentCategoryId === intersectionParentCategoryId &&
                viewSize === intersectionViewSize
            )
        ),
        ...sortBy(notIntersectionCategorySizes, 'parentCategoryId')
      ];

      if (needGender)
        newSelectedSearchOptions = [
          ...newSelectedSearchOptions,
          ...genderCategories
            .filter(({ id }) => id === genderId)
            .map(({ subParentCategories }) => subParentCategories)
            .flat()
            .map((subParentCategory) => ({
              ...subParentCategory,
              codeId: filterCodeIds.category,
              genderIds: [genderId, filterGenders.common.id]
            }))
        ];
    } else {
      setActiveToastOpen(false);
      setInActiveToastOpen(true);
      newSelectedSearchOptions = selectedSearchOptions.filter(
        ({ categorySizeId, parentCategoryId, viewSize }) =>
          ![...myFilterIntersectionCategorySizes, ...notIntersectionCategorySizes].find(
            ({
              categorySizeId: intersectionCategorySizeId,
              parentCategoryId: intersectionParentCategoryId,
              viewSize: intersectionViewSize
            }) =>
              categorySizeId === intersectionCategorySizeId &&
              parentCategoryId === intersectionParentCategoryId &&
              viewSize === intersectionViewSize
          )
      );

      if (needGender)
        newSelectedSearchOptions = newSelectedSearchOptions.filter(({ codeId, genderIds = [] }) => {
          const [selectedGenderId] = genderIds.filter((id) => id !== filterGenders.common.id);

          return codeId !== filterCodeIds.category && selectedGenderId !== genderId;
        });
    }

    setSelectedSearchOptionsState(({ type }) => ({
      type,
      selectedSearchOptions: newSelectedSearchOptions
    }));
    setSearchOptionsParamsState(({ type }) => ({
      type,
      searchParams: convertSearchParams(newSelectedSearchOptions, {
        baseSearchParams
      })
    }));
    setActiveMyFilterState(!activeMyFilter);
  };

  useEffect(() => {
    const hasUnSelectedMyFilterOption = myFilterIntersectionCategorySizes.some(
      ({ categorySizeId, parentCategoryId, viewSize }) =>
        !selectedSearchOptions.some(
          ({
            categorySizeId: intersectionCategorySizeId,
            parentCategoryId: intersectionParentCategoryId,
            viewSize: intersectionViewSize
          }) =>
            categorySizeId === intersectionCategorySizeId &&
            parentCategoryId === intersectionParentCategoryId &&
            viewSize === intersectionViewSize
        )
    );

    if (activeMyFilter && hasUnSelectedMyFilterOption) {
      logEvent(attrKeys.products.clickMyFilter, {
        name: attrProperty.name.filterModal,
        title: attrProperty.title.auto,
        att: 'OFF'
      });
      setActiveMyFilterState(false);
      setActiveMyFilterReceiveState(true);
      setActiveToastOpen(false);
      setInActiveToastOpen(true);
    }
  }, [
    setActiveMyFilterReceiveState,
    setActiveMyFilterState,
    activeMyFilter,
    selectedSearchOptions,
    myFilterIntersectionCategorySizes
  ]);

  useEffect(() => {
    if (accessUser && (tops.length || bottoms.length || shoes.length)) {
      logEvent(attrKeys.products.viewMyFilter);
    }
  }, [accessUser, bottoms, shoes, tops]);

  if (!accessUser || (!tops.length && !bottoms.length && !shoes.length)) return null;

  return (
    <Box
      component="section"
      customStyle={{
        marginTop: 24
      }}
    >
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        customStyle={{
          padding: '0 20px'
        }}
      >
        <Flexbox direction="vertical" gap={4}>
          <Typography weight="medium">{title}</Typography>
          <Typography variant="body2" customStyle={{ color: common.ui60 }}>
            마이페이지에서 수정할 수 있어요
          </Typography>
        </Flexbox>
        <Switch onChange={handleChange} checked={activeMyFilter} />
      </Flexbox>
      <Options>
        {needGender && (
          <Label
            variant="ghost"
            text={gender === 'M' ? '남성' : '여성'}
            size="small"
            brandColor="primary"
          />
        )}
        {tops.length > 0 && (
          <Label
            variant="ghost"
            text={`상의: ${tops.map(({ viewSize }) => viewSize).join(', ')}`}
            size="small"
            brandColor="primary"
          />
        )}
        {bottoms.length > 0 && (
          <Label
            variant="ghost"
            text={`하의: ${bottoms.map(({ viewSize }) => viewSize).join(', ')}`}
            size="small"
            brandColor="primary"
          />
        )}
        {shoes.length > 0 && (
          <Label
            variant="ghost"
            text={`신발: ${shoes.map(({ viewSize }) => viewSize).join(', ')}`}
            size="small"
            brandColor="primary"
          />
        )}
      </Options>
      <Toast open={open} onClose={() => setOpen(false)}>
        필터 설정에 일치하는 중고매물이 없습니다😭
      </Toast>
      <Toast open={activeToastOpen} onClose={() => setActiveToastOpen(false)}>
        {`${title}를 적용했어요!`}
      </Toast>
      <Toast open={inactiveToastOpen} onClose={() => setInActiveToastOpen(false)}>
        {`${title}를 해제했어요!`}
      </Toast>
    </Box>
  );
}

const Options = styled.div`
  margin-top: 8px;
  padding: 0 20px;
  white-space: nowrap;
  font-size: 1px;
  overflow-x: auto;

  & > label {
    margin-right: 6px;
  }
  & > label:last-child {
    margin-right: 0;
  }
`;

export default MyFilterInfo;
