import { useEffect, useMemo, useRef } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Gap } from '@components/UI/atoms';

import { CATEGORY_TAGS_HEIGHT } from '@constants/common';

import { getCenterScrollLeft } from '@utils/scroll';
import { convertSearchParamsByQuery } from '@utils/products';
import { convertStringToArray } from '@utils/common';

import type { ProductsVariant } from '@typings/products';
import { searchOptionsStateFamily } from '@recoil/productsFilter';

interface ProductsCategoryTagListProps {
  variant: ProductsVariant;
}

function ProductsCategoryTags({ variant }: ProductsCategoryTagListProps) {
  const {
    theme: { zIndex }
  } = useTheme();
  const router = useRouter();
  const { keyword = '', parentIds, subParentIds } = router.query;
  const atomParam = router.asPath.split('?')[0];

  const categoryTagRef = useRef<HTMLDivElement | null>(null);
  const parentCategoryTagRefs = useRef<HTMLDivElement[]>([]);
  const subParentCategoryTagRefs = useRef<HTMLDivElement[]>([]);

  const {
    searchOptions: { parentCategories = [], subParentCategories = [] }
  } = useRecoilValue(searchOptionsStateFamily(`base-${atomParam}`));
  const parentCategory = useMemo(
    () => parentCategories.find(({ name }) => name === keyword),
    [parentCategories, keyword]
  );
  const excludedSearchParams = useMemo(
    () =>
      convertSearchParamsByQuery(router.query, {
        onlyBaseSearchParams: true,
        excludeSearchParams: ['parentIds', 'subParentIds', 'keyword', 'brands', 'categories']
      }),
    [router.query]
  );
  const showParentCategories = useMemo(
    () => variant !== 'categories' && !parentIds,
    [variant, parentIds]
  );

  useEffect(() => {
    if (categoryTagRef.current && parentCategoryTagRefs.current.length) {
      const [activeCategoryTag] = parentCategoryTagRefs.current.filter((parentCategoryTagRef) => {
        return convertStringToArray(String(parentIds)).includes(
          Number(parentCategoryTagRef.getAttribute('data-id') || 0)
        );
      });

      let scrollLeft = 0;

      if (activeCategoryTag) {
        const { scrollWidth, clientWidth } = categoryTagRef.current;
        const { offsetLeft: targetOffsetLeft, clientWidth: targetClientWidth } = activeCategoryTag;

        scrollLeft = getCenterScrollLeft({
          scrollWidth,
          clientWidth,
          targetOffsetLeft,
          targetClientWidth
        });
      }

      categoryTagRef.current.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [parentIds, parentCategories]);

  useEffect(() => {
    if (categoryTagRef.current && subParentCategoryTagRefs.current.length) {
      const [activeCategoryTag] = subParentCategoryTagRefs.current.filter(
        (subParentCategoryTagRef) => {
          return convertStringToArray(String(subParentIds)).includes(
            Number(subParentCategoryTagRef.getAttribute('data-id') || 0)
          );
        }
      );

      let scrollLeft = 0;

      if (activeCategoryTag) {
        const { scrollWidth, clientWidth } = categoryTagRef.current;
        const { offsetLeft: targetOffsetLeft, clientWidth: targetClientWidth } = activeCategoryTag;

        scrollLeft = getCenterScrollLeft({
          scrollWidth,
          clientWidth,
          targetOffsetLeft,
          targetClientWidth
        });
      }

      categoryTagRef.current.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [subParentIds, subParentCategories]);

  return (
    <Box
      component="section"
      customStyle={{ minHeight: CATEGORY_TAGS_HEIGHT + 8, position: 'relative' }}
    >
      <Wrapper>
        <CategoryTags ref={categoryTagRef}>
          <Text
            weight={
              (!parentIds && !subParentIds) || (parentIds && !subParentIds) ? 'bold' : 'regular'
            }
            onClick={() =>
              router
                .push({
                  pathname: `/products/${variant}${keyword ? `/${keyword}` : ''}`,
                  query: {
                    ...excludedSearchParams,
                    parentIds
                  }
                })
                .then(() => window.scrollTo(0, 0))
            }
          >
            전체
          </Text>
          {showParentCategories &&
            parentCategories.map(({ id, name }, index) => (
              <Text
                key={`parent-category-${id}`}
                ref={(ref) => {
                  if (ref) parentCategoryTagRefs.current[index] = ref;
                }}
                weight={convertStringToArray(String(parentIds)).includes(id) ? 'bold' : 'regular'}
                onClick={() =>
                  router
                    .push({
                      pathname: `/products/${variant}${keyword ? `/${keyword}` : ''}`,
                      query: {
                        ...excludedSearchParams,
                        parentIds: id
                      }
                    })
                    .then(() => window.scrollTo(0, 0))
                }
              >
                {name.replace(/\(P\)/g, '')}
              </Text>
            ))}
          {!showParentCategories &&
            subParentCategories
              .filter(({ parentId: subParentCategoryParentId, name }) => {
                if (parentIds)
                  return (
                    convertStringToArray(String(parentIds)).includes(subParentCategoryParentId) &&
                    name
                  );
                if (parentCategory) return parentCategory.id === subParentCategoryParentId;

                return name;
              })
              .map(({ id, name, parentId }, index) => (
                <Text
                  key={`sub-parent-category-${id}`}
                  ref={(ref) => {
                    if (ref) subParentCategoryTagRefs.current[index] = ref;
                  }}
                  data-id={id}
                  weight={
                    convertStringToArray(String(subParentIds)).includes(id) ? 'bold' : 'regular'
                  }
                  onClick={() =>
                    router
                      .replace({
                        pathname: `/products/${variant}${keyword ? `/${keyword}` : ''}`,
                        query: {
                          ...excludedSearchParams,
                          parentIds: parentId,
                          subParentIds: id
                        }
                      })
                      .then(() => window.scrollTo(0, 0))
                  }
                >
                  {name}
                </Text>
              ))}
        </CategoryTags>
      </Wrapper>
      <Gap
        height={8}
        customStyle={{
          position: 'fixed',
          marginTop: CATEGORY_TAGS_HEIGHT,
          zIndex: zIndex.header
        }}
      />
    </Box>
  );
}

const Wrapper = styled.div`
  position: fixed;
  background-color: ${({ theme: { palette } }) => palette.common.white};
  height: ${CATEGORY_TAGS_HEIGHT}px;
  min-height: ${CATEGORY_TAGS_HEIGHT}px;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  width: 100%;
  overflow-x: auto;
`;

const CategoryTags = styled.div`
  height: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  column-gap: 20px;
  width: fit-content;
`;

const Text = styled(Typography)`
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  height: 100%;
  cursor: pointer;
`;

export default ProductsCategoryTags;
