import { useEffect, useMemo, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import sortBy from 'lodash-es/sortBy';
import Toast from '@mrcamelhub/camel-ui-toast';
import { Box, Button, Flexbox, Switch, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { Gap } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { filterCodeIds, filterGenders } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParams } from '@utils/products';

import type { ProductsVariant, SelectedSearchOption } from '@typings/products';
import {
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

  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState('');
  const [activeToastOpen, setActiveToastOpen] = useState(false);
  const [inactiveToastOpen, setInActiveToastOpen] = useState(false);

  const { data: accessUser } = useQueryAccessUser();

  const {
    data: {
      info: { value: { gender = '' } = {} } = {},
      size: { value: { tops = [], bottoms = [], shoes = [] } = {} } = {}
    } = {}
  } = useQueryUserInfo();

  const needGender = useMemo(
    () => variant === 'search' && gender && gender !== 'N',
    [variant, gender]
  );

  const handleChange = () => {
    logEvent(attrKeys.products.clickMyFilter, {
      name: attrProperty.name.filterModal,
      att: !activeMyFilter ? 'ON' : 'OFF'
    });

    if (!activeMyFilter && !myFilterIntersectionCategorySizes.length) {
      setOpen(true);
      return;
    }

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
      setInActiveToastOpen(false);
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
    if (accessUser && (tops.length || bottoms.length || shoes.length)) {
      logEvent(attrKeys.products.viewMyFilter);
    }
  }, [accessUser, bottoms, shoes, tops]);

  useEffect(() => {
    const newInfo = [];

    if (needGender) newInfo.push(gender === 'M' ? '남성' : '여성');
    if (tops.length > 0) {
      const checkLimit = tops.map(({ viewSize }) => viewSize).length > 3;
      newInfo.push(
        `상의: ${
          checkLimit
            ? `${tops.map(({ viewSize }) => viewSize)[0]} 외 ${tops.length - 3}개`
            : tops.map(({ viewSize }) => viewSize).join(', ')
        }`
      );
    }
    if (bottoms.length > 0) {
      const checkLimit = bottoms.map(({ viewSize }) => viewSize).length > 3;
      newInfo.push(
        `하의: ${
          checkLimit
            ? `${bottoms.map(({ viewSize }) => viewSize)[0]} 외 ${bottoms.length - 3}개`
            : bottoms.map(({ viewSize }) => viewSize).join(', ')
        }`
      );
    }
    if (shoes.length > 0) {
      const checkLimit = shoes.map(({ viewSize }) => viewSize).length > 3;
      newInfo.push(
        `신발: ${
          checkLimit
            ? `${shoes.map(({ viewSize }) => viewSize)[0]} 외 ${shoes.length - 3}개`
            : shoes.map(({ viewSize }) => viewSize).join(', ')
        }`
      );
    }

    setInfo(newInfo.join(' / '));
  }, [needGender, tops, bottoms, shoes, gender]);

  if (!accessUser || (!tops.length && !bottoms.length && !shoes.length)) return null;

  return (
    <>
      <Box
        component="section"
        customStyle={{
          padding: '20px 0'
        }}
      >
        <Flexbox
          alignment="center"
          justifyContent="space-between"
          gap={12}
          customStyle={{
            padding: '0 20px'
          }}
        >
          <Flexbox
            direction="vertical"
            gap={4}
            customStyle={{
              flex: 1,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis'
            }}
          >
            <Typography variant="h4" weight="bold">
              내 사이즈만 보기
            </Typography>
            <Typography
              variant="body2"
              customStyle={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                color: common.ui60
              }}
            >
              {info}
            </Typography>
          </Flexbox>
          <Switch onChange={handleChange} checked={activeMyFilter} size="large" />
        </Flexbox>
        <Button
          variant="ghost"
          brandColor="blue"
          onClick={() => router.push('/user/sizeInput')}
          customStyle={{
            margin: '20px 20px 0'
          }}
        >
          내 사이즈 바꾸기
        </Button>
        <Toast open={open} onClose={() => setOpen(false)}>
          필터 설정에 일치하는 중고매물이 없습니다😭
        </Toast>
        <Toast open={activeToastOpen} onClose={() => setActiveToastOpen(false)}>
          내 사이즈만 보기를 적용했어요!
        </Toast>
        <Toast open={inactiveToastOpen} onClose={() => setInActiveToastOpen(false)}>
          내 사이즈만 보기를 해제했어요!
        </Toast>
      </Box>
      <Gap height={8} />
    </>
  );
}

export default MyFilterInfo;
