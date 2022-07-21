import { useEffect, useMemo, useRef } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

import { convertSearchParamsByQuery } from '@utils/products';
import getCenterScrollLeft from '@utils/getCenterScrollLeft';
import convertStringToArray from '@utils/convertStringToArray';

import type { ProductsVariant } from '@typings/products';
import { searchOptionsStateFamily } from '@recoil/productsFilter';
import { showAppDownloadBannerState } from '@recoil/common';

interface ProductsCategoryTagListProps {
  variant: ProductsVariant;
}

function ProductsCategoryTags({ variant }: ProductsCategoryTagListProps) {
  const router = useRouter();
  const { keyword = '', parentIds, subParentIds } = router.query;
  const atomParam = router.asPath.split('?')[0];

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

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
    <Box component="section" customStyle={{ height: 45 }}>
      <StyledCategoryTags ref={categoryTagRef} showAppDownloadBanner={showAppDownloadBanner}>
        <Typography
          weight={
            (!parentIds && !subParentIds) || (parentIds && !subParentIds) ? 'bold' : 'regular'
          }
          customStyle={{ cursor: 'pointer' }}
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
        </Typography>
        {showParentCategories &&
          parentCategories.map(({ id, name }, index) => (
            <Typography
              key={`parent-category-${id}`}
              ref={(ref) => {
                if (ref) parentCategoryTagRefs.current[index] = ref;
              }}
              weight={convertStringToArray(String(parentIds)).includes(id) ? 'bold' : 'regular'}
              customStyle={{ cursor: 'pointer' }}
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
            </Typography>
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
              <Typography
                key={`sub-parent-category-${id}`}
                ref={(ref) => {
                  if (ref) subParentCategoryTagRefs.current[index] = ref;
                }}
                data-id={id}
                weight={
                  convertStringToArray(String(subParentIds)).includes(id) ? 'bold' : 'regular'
                }
                customStyle={{ cursor: 'pointer' }}
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
              </Typography>
            ))}
      </StyledCategoryTags>
    </Box>
  );
}

const StyledCategoryTags = styled.div<{ showAppDownloadBanner: boolean }>`
  position: fixed;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? 56 + APP_DOWNLOAD_BANNER_HEIGHT : 56}px;
  width: 100%;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.white};
  height: 45px;
  min-height: 45px;
  padding: 0 20px;
  white-space: nowrap;
  overflow-x: auto;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};

  & > div {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-width: fit-content;
    margin-right: 20px;

    &:last-child {
      margin-right: 0;
    }
  }
`;

export default ProductsCategoryTags;
