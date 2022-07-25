import { useMemo } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Icon, Typography, useTheme } from 'mrcamel-ui';
import omitBy from 'lodash-es/omitBy';
import isEmpty from 'lodash-es/isEmpty';
import styled from '@emotion/styled';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchParentCategories } from '@api/category';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { filterGenders } from '@constants/productsFilter';
import { CATEGORIES_BY_GENDER } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  searchHelperPopupStateFamily,
  searchParamsState,
  selectedSearchOptionsDefault,
  selectedSearchOptionsState
} from '@recoil/searchHelper/atom';
import categoryState from '@recoil/category';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface HomeCategoryListProps {
  isViewSearchHelperOnboarding: () => boolean;
}

function HomeCategoryList({ isViewSearchHelperOnboarding }: HomeCategoryListProps) {
  const {
    theme: { palette }
  } = useTheme();
  const router = useRouter();
  const setSearchHelperPopup = useSetRecoilState(searchHelperPopupStateFamily('continue'));
  const setSearchParams = useSetRecoilState(searchParamsState);
  const [selectedSearchOptions, setSelectedSearchOptions] = useRecoilState(
    selectedSearchOptionsState
  );
  const resetCategory = useResetRecoilState(categoryState);
  const { data: accessUser } = useQueryAccessUser();
  const {
    data: {
      personalStyle: { personalCategories = [] } = {},
      info: { value: { gender = '' } = {} } = {}
    } = {}
  } = useQueryUserInfo();
  const { data: parentCategories } = useQuery(
    queryKeys.categories.parentCategories(),
    fetchParentCategories
  );
  const genderName = gender === 'F' ? 'female' : 'male';
  const genderId = filterGenders[genderName as keyof typeof filterGenders].id;

  const categories = useMemo(() => {
    let result = CATEGORIES_BY_GENDER.N.map((category) => {
      const parentCategory = parentCategories?.find(
        ({ parentCategory: { id } }) => category.parentId === id
      )?.parentCategory;

      return {
        ...category,
        parentCategoryName: parentCategory ? parentCategory.name.replace('(P)', '') : ''
      };
    });

    if (personalCategories.length) {
      result = personalCategories.map((personalCategory) => {
        const parentCategory = parentCategories?.find(
          ({ parentCategory: { id } }) => id === personalCategory.parentId
        )?.parentCategory;

        return {
          name: personalCategory.name,
          nameEng: personalCategory.nameEng!,
          parentId: personalCategory.parentId!,
          subParentId: personalCategory.id!,
          parentCategoryName: parentCategory ? parentCategory.name.replace('(P)', '') : ''
        };
      });
    }

    return result.slice(0, 9);
  }, [parentCategories, personalCategories]);

  const handleClickCategory =
    ({
      parentId,
      subParentId,
      parentCategoryName,
      subParentCategoryName
    }: {
      parentId: number;
      subParentId: number;
      parentCategoryName: string;
      subParentCategoryName: string;
    }) =>
    () => {
      logEvent(attrKeys.home.CLICK_MAIN_BUTTON, {
        title: 'CATEGORY',
        att: subParentCategoryName
      });

      if (isViewSearchHelperOnboarding()) {
        setSelectedSearchOptions({
          ...selectedSearchOptionsDefault,
          pathname: router.pathname,
          gender: gender ? { id: genderId, name: genderName } : selectedSearchOptionsDefault.gender,
          parentCategory: { id: parentId, name: parentCategoryName },
          subParentCategory: { id: subParentId, name: subParentCategoryName }
        });
        setSearchParams(
          omitBy(
            {
              genderIds: gender ? [genderId, filterGenders.common.id] : [],
              parentIds: [parentId],
              subParentIds: [subParentId]
            },
            isEmpty
          )
        );
        return;
      }

      if (
        selectedSearchOptions.subParentCategory.id > 0
          ? selectedSearchOptions.parentCategory.id === parentId &&
            selectedSearchOptions.subParentCategory.id === subParentId
          : selectedSearchOptions.parentCategory.id === parentId
      ) {
        setSearchHelperPopup(true);
        return;
      }

      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.productName.MAIN,
        title: attrProperty.productTitle.CATEGORY,
        type: attrProperty.productType.INPUT
      });

      router.push({
        pathname: `/products/categories/${parentCategoryName}`,
        query: {
          subParentIds: subParentId,
          genders: (accessUser?.gender === 'F' && 'female') || 'male'
        }
      });
    };

  const handleClickCategoryAll = () => {
    logEvent(attrKeys.home.CLICK_MAIN_CATEGORY);

    resetCategory();

    if (isViewSearchHelperOnboarding()) {
      setSelectedSearchOptions({
        ...selectedSearchOptionsDefault,
        pathname: router.pathname,
        gender: gender ? { id: genderId, name: genderName } : selectedSearchOptionsDefault.gender
      });
      setSearchParams(
        omitBy({ genderIds: gender ? [genderId, filterGenders.common.id] : [] }, isEmpty)
      );
    } else {
      router.push('/category');
    }
  };

  return (
    <Box component="section" customStyle={{ marginTop: 64 }}>
      <Typography variant="h4" weight="bold" customStyle={{ marginBottom: 8 }}>
        카테고리로 빠른검색
      </Typography>
      <CategoryList>
        {categories.map(({ parentId, subParentId, parentCategoryName, name }) => (
          <CategoryCard
            key={`category-${parentCategoryName}-${name}`}
            onClick={handleClickCategory({
              parentId,
              subParentId,
              parentCategoryName,
              subParentCategoryName: name
            })}
          >
            <Box>
              <Typography
                variant="small2"
                weight="bold"
                customStyle={{ color: palette.common.grey['60'], minHeight: 15 }}
              >
                {parentCategoryName}
              </Typography>
              <Typography variant="body2" weight="medium">
                {name}
              </Typography>
            </Box>
            <Icon name="ArrowRightOutlined" size="medium" />
          </CategoryCard>
        ))}
        <CategoryCard onClick={handleClickCategoryAll}>
          <Typography variant="body2" weight="medium">
            전체보기
          </Typography>
          <Icon name="ArrowRightOutlined" size="medium" />
        </CategoryCard>
      </CategoryList>
    </Box>
  );
}

const CategoryList = styled.div`
  margin: 0 -20px;
  padding: 16px 20px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
  background-color: #eff2f7;
`;

const CategoryCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.palette.common.white};
  box-shadow: ${({ theme }) => theme.box.shadow.category};
  border-radius: ${({ theme }) => theme.box.round['8']};
  min-height: 49px;
`;

export default HomeCategoryList;
