import type { Dispatch, MouseEvent, SetStateAction } from 'react';
import { useCallback } from 'react';

import { useRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/react';

import { Accordion } from '@components/UI/molecules';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchParentCategories } from '@api/category';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { CATEGORY_TAB_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import categoryState from '@recoil/category';

interface CategoryCollapseProps {
  selectedParentCategory: number;
  setSelectedParentCategory: Dispatch<SetStateAction<number>>;
}

function CategoryCollapse({
  selectedParentCategory,
  setSelectedParentCategory
}: CategoryCollapseProps) {
  const router = useRouter();
  const { data: parentCategories } = useQuery(
    queryKeys.categories.parentCategories(),
    fetchParentCategories
  );
  const [{ gender, subParentId }, setCategoryState] = useRecoilState(categoryState);

  const handleChangeParentCategory = useCallback(
    (parentCategoryId: number) => (_: MouseEvent<HTMLDivElement>, isExpanded: boolean) => {
      setSelectedParentCategory(isExpanded ? 0 : parentCategoryId);
    },
    [setSelectedParentCategory]
  );

  const handleClickAllButton = useCallback(
    (_: unknown, selectedParentName: string) => (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setCategoryState((prevCategory) => ({
        ...prevCategory,
        parentId: 0,
        subParentId: 0,
        gender
      }));
      logEvent(attrKeys.category.CLICK_CATEGORY, {
        name: 'CATEGORY',
        title: 'PARENT',
        type: 'GUIDED',
        parentCategory: selectedParentName,
        subParentIds: '',
        category: selectedParentName,
        gender: gender === 'male' ? 'M' : 'F'
      });
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.productName.CATEGORY,
        title: attrProperty.productTitle.PARENT,
        type: attrProperty.productType.GUIDED
      });
      router.push(
        `/products/categories/${selectedParentName.replace(/\(P\)/g, '')}?genders=${gender}`
      );
    },
    [gender, router, setCategoryState]
  );

  const handleClickSubParentCategory = useCallback(
    ({
        parentCategoryName,
        parentCategoryId,
        subParentCategoryId,
        subParentCategoryName
      }: {
        parentCategoryName: string;
        parentCategoryId: number;
        subParentCategoryId: number;
        subParentCategoryName: string;
      }) =>
      (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        logEvent(attrKeys.category.CLICK_CATEGORY, {
          name: 'CATEGORY',
          title: 'SUBPARENT',
          type: 'GUIDED',
          parentCategory: parentCategoryName,
          subParentIds: subParentCategoryId,
          category: subParentCategoryName,
          gender: gender === 'male' ? 'M' : 'F'
        });
        setCategoryState((prevCategory) => ({
          ...prevCategory,
          parentId: parentCategoryId,
          subParentId: subParentCategoryId,
          gender
        }));
        SessionStorage.set(sessionStorageKeys.productsEventProperties, {
          name: attrProperty.productName.CATEGORY,
          title: attrProperty.productTitle.SUBPARENT,
          type: attrProperty.productType.GUIDED
        });
        router.push(
          `/products/categories/${parentCategoryName.replace(
            /\(P\)/g,
            ''
          )}?genders=${gender}&parentIds=${parentCategoryId}&subParentIds=${subParentCategoryId}`
        );
      },
    [gender, router, setCategoryState]
  );

  return (
    <Box
      component="section"
      customStyle={{
        margin: '16px 0px',
        paddingTop: CATEGORY_TAB_HEIGHT
      }}
    >
      {parentCategories
        ?.filter(({ parentCategory: { name, nameEng } }) =>
          gender === 'male' ? name !== '원피스(P)' && nameEng : nameEng
        )
        .map(
          ({
            parentCategory: { id: parentCategoryId, name: parentCategoryName },
            subParentCategories
          }) => (
            <Accordion
              key={`parent-category-${parentCategoryId}`}
              variant="outlined"
              summary={parentCategoryName.replace('(P)', '')}
              expanded={selectedParentCategory === parentCategoryId}
              changeExpandedStatus={handleChangeParentCategory(parentCategoryId)}
              button="전체보기"
              onClickButton={handleClickAllButton(parentCategoryId, parentCategoryName)}
            >
              {subParentCategories
                .filter(
                  ({ name: subParentCategoryName }) =>
                    !(
                      gender === 'male' ? ['스커트', '힐/펌프스', '버킷백', '그릇'] : ['그릇']
                    ).includes(subParentCategoryName)
                )
                .map(({ id: subParentCategoryId, name: subParentCategoryName }) => (
                  <SubParentCategory
                    key={`sub-parent-category-${subParentCategoryId}`}
                    variant="body1"
                    selected={subParentCategoryId === subParentId}
                    onClick={handleClickSubParentCategory({
                      parentCategoryName,
                      parentCategoryId,
                      subParentCategoryId,
                      subParentCategoryName
                    })}
                  >
                    {subParentCategoryName}
                  </SubParentCategory>
                ))}
            </Accordion>
          )
        )}
    </Box>
  );
}

const SubParentCategory = styled(Typography)<{ selected: boolean }>`
  float: left;
  width: 50%;
  padding: 10px;
  cursor: pointer;

  ${({ theme: { palette }, selected }): CSSObject => ({
    color: selected ? palette.primary.main : palette.common.grey['20']
  })}
`;

export default CategoryCollapse;
