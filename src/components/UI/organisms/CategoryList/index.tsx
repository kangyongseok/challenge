import { useMemo } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Skeleton, Typography, useTheme } from 'mrcamel-ui';

import { fetchParentCategories } from '@api/category';

import queryKeys from '@constants/queryKeys';
import { CATEGORIES_BY_GENDER } from '@constants/category';

import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import { CategoryItem, CategoryName, StyledCategoryList } from './CategoryList.styles';

interface CategoryListProps {
  variant?: 'solid' | 'outline';
  onClickCategory?: ({
    parentId,
    subParentId,
    parentCategoryName,
    subParentCategoryName,
    callback
  }: {
    parentId: number | null;
    subParentId: number | null;
    parentCategoryName: string;
    subParentCategoryName: string;
    callback: () => void;
  }) => void;
}

function CategoryList({ variant = 'solid', onClickCategory }: CategoryListProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();

  const { data: accessUser } = useQueryAccessUser();
  const {
    data: {
      personalStyle: { personalCategories = [] } = {},
      info: { value: { gender = '' } = {} } = {}
    } = {},
    isFetched
  } = useQueryUserInfo();
  const { data: { parentCategories = [] } = {} } = useQuery(
    queryKeys.categories.parentCategories(),
    fetchParentCategories
  );

  const categories = useMemo(
    () =>
      (personalCategories.length > 0
        ? personalCategories.map((personalCategory) => ({
            name: personalCategory.name,
            parentId: personalCategory.parentId,
            subParentId: personalCategory.id,
            parentCategoryName:
              parentCategories
                ?.find(({ parentCategory: { id } }) => id === personalCategory.parentId)
                ?.parentCategory?.name.replace('(P)', '') || ''
          }))
        : CATEGORIES_BY_GENDER.N.map(({ nameEng: _nameEng, ...category }) => ({
            ...category,
            parentCategoryName:
              parentCategories
                ?.find(({ parentCategory: { id } }) => category.parentId === id)
                ?.parentCategory?.name.replace('(P)', '') || ''
          }))
      ).slice(0, 6),
    [parentCategories, personalCategories]
  );

  const handleClickCategory =
    ({
      parentId,
      subParentId,
      parentCategoryName,
      subParentCategoryName
    }: {
      parentId: number | null;
      subParentId: number | null;
      parentCategoryName: string;
      subParentCategoryName: string;
    }) =>
    () => {
      const callback = () => {
        const query: { subParentIds?: number[]; genders?: string[] } = {};

        if (subParentId) {
          query.subParentIds = [subParentId];
        }

        if (gender.length && ['F', 'M'].includes(gender)) {
          query.genders = [gender === 'F' ? 'female' : 'male'];
        }

        router.push({
          pathname: `/products/categories/${parentCategoryName}`,
          query
        });
      };

      if (onClickCategory) {
        onClickCategory({
          parentId,
          subParentId,
          parentCategoryName,
          subParentCategoryName,
          callback
        });
      } else {
        callback();
      }
    };

  return (
    <StyledCategoryList variant={variant}>
      {!!accessUser && !isFetched && personalCategories.length === 0
        ? Array.from({ length: 6 }, (_, index) => (
            <CategoryItem key={`category-skeleton-${index}`} variant={variant}>
              <Flexbox direction="vertical" gap={4}>
                <Skeleton width={30} height={13} round={8} disableAspectRatio />
                <Skeleton width={80} height={19} round={8} disableAspectRatio />
              </Flexbox>
            </CategoryItem>
          ))
        : categories.map(({ parentId, subParentId, parentCategoryName, name }) => (
            <CategoryItem
              key={`category-${parentCategoryName}-${name}`}
              variant={variant}
              onClick={handleClickCategory({
                parentId,
                subParentId,
                parentCategoryName,
                subParentCategoryName: name
              })}
            >
              <Typography variant="small2" weight="medium" customStyle={{ color: common.ui60 }}>
                {parentCategoryName}
              </Typography>
              <CategoryName variant={variant === 'solid' ? 'body2' : 'body1'} weight="medium">
                {name}
              </CategoryName>
            </CategoryItem>
          ))}
    </StyledCategoryList>
  );
}

export default CategoryList;
