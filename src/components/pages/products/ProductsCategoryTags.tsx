import { useEffect, useMemo, useRef } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Typography, useTheme } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { Gap, Skeleton } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { APP_DOWNLOAD_BANNER_HEIGHT, CATEGORY_TAGS_HEIGHT, HEADER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCenterScrollLeft } from '@utils/scroll';
import { convertSearchParamsByQuery } from '@utils/products';
import { convertStringToArray } from '@utils/common';

import type { ProductsVariant } from '@typings/products';
import { searchOptionsStateFamily } from '@recoil/productsFilter';
import { showAppDownloadBannerState } from '@recoil/common';

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

  const wrapperRef = useRef<HTMLDivElement>(null);
  const parentCategoryTagRefs = useRef<HTMLDivElement[]>([]);
  const subParentCategoryTagRefs = useRef<HTMLDivElement[]>([]);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

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

  const handleClickAll = () => {
    if (variant === 'categories') {
      logEvent(attrKeys.products.CLICK_CATEGORY, {
        name: attrProperty.name.productList,
        type: attrProperty.type.input,
        title: attrProperty.title.CATEGORY_PARENT,
        category: '전체',
        parentCategory: keyword
      });
    } else {
      logEvent(attrKeys.products.CLICK_CATEGORY, {
        name: attrProperty.name.productList,
        type: attrProperty.type.input,
        title: attrProperty.title.BRAND_PARENT,
        brandName: keyword
      });
    }

    router
      .push({
        pathname: `/products/${variant}${keyword ? `/${keyword}` : ''}`,
        query: { ...excludedSearchParams, parentIds }
      })
      .then(() => window.scrollTo(0, 0));
  };

  const handleClickParentCategory = (parentId: number, parentCategoryName: string) => () => {
    if (variant === 'brands') {
      logEvent(attrKeys.products.CLICK_CATEGORY, {
        name: attrProperty.name.productList,
        type: attrProperty.type.input,
        title: attrProperty.title.BRAND_PARENT,
        parentCategory: parentCategoryName,
        brandName: keyword
      });
    }

    router
      .push({
        pathname: `/products/${variant}${keyword ? `/${keyword}` : ''}`,
        query: { ...excludedSearchParams, parentIds: [parentId] }
      })
      .then(() => window.scrollTo(0, 0));
  };

  const handleClickSubParentCategory =
    ({
      parentId,
      subParentId,
      subParentName
    }: {
      parentId: number;
      subParentId: number;
      subParentName: string;
    }) =>
    () => {
      if (variant === 'categories') {
        logEvent(attrKeys.products.CLICK_CATEGORY, {
          name: attrProperty.name.productList,
          type: attrProperty.type.input,
          title: attrProperty.title.CATEGORY_SUBPARENT,
          parentCategory: keyword,
          category: subParentName
        });
      } else {
        logEvent(attrKeys.products.CLICK_CATEGORY, {
          name: attrProperty.name.productList,
          type: attrProperty.type.input,
          title: attrProperty.title.BRAND_SUBPARENT,
          parentCategory: parentCategories
            .find(({ id }) => id === parentId)
            ?.name.replace(/\(P\)/g, ''),
          category: subParentName,
          brandName: keyword
        });
      }

      router
        .replace({
          pathname: `/products/${variant}${keyword ? `/${keyword}` : ''}`,
          query: { ...excludedSearchParams, parentIds: [parentId], subParentIds: [subParentId] }
        })
        .then(() => window.scrollTo(0, 0));
    };

  useEffect(() => {
    if (wrapperRef.current && parentCategoryTagRefs.current.length) {
      const [activeCategoryTag] = parentCategoryTagRefs.current.filter((parentCategoryTagRef) => {
        return convertStringToArray(String(parentIds)).includes(
          Number(parentCategoryTagRef.getAttribute('data-id') || 0)
        );
      });

      let scrollLeft = 0;

      if (activeCategoryTag) {
        const { scrollWidth, clientWidth } = wrapperRef.current;
        const { offsetLeft: targetOffsetLeft, clientWidth: targetClientWidth } = activeCategoryTag;

        scrollLeft = getCenterScrollLeft({
          scrollWidth,
          clientWidth,
          targetOffsetLeft,
          targetClientWidth
        });
      }

      wrapperRef.current.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [parentIds, parentCategories]);

  useEffect(() => {
    if (wrapperRef.current && subParentCategoryTagRefs.current.length) {
      const [activeCategoryTag] = subParentCategoryTagRefs.current.filter(
        (subParentCategoryTagRef) => {
          return convertStringToArray(String(subParentIds)).includes(
            Number(subParentCategoryTagRef.getAttribute('data-id') || 0)
          );
        }
      );

      let scrollLeft = 0;

      if (activeCategoryTag) {
        const { scrollWidth, clientWidth } = wrapperRef.current;
        const { offsetLeft: targetOffsetLeft, clientWidth: targetClientWidth } = activeCategoryTag;

        scrollLeft = getCenterScrollLeft({
          scrollWidth,
          clientWidth,
          targetOffsetLeft,
          targetClientWidth
        });
      }

      wrapperRef.current.scrollTo({
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
      <Wrapper ref={wrapperRef} showAppDownloadBanner={showAppDownloadBanner}>
        <CategoryTags>
          {(parentCategories.length > 0 || subParentCategories.length > 0) && (
            <Text
              weight={
                (!parentIds && !subParentIds) || (parentIds && !subParentIds) ? 'bold' : 'regular'
              }
              onClick={handleClickAll}
              isActive={!!((!parentIds && !subParentIds) || (parentIds && !subParentIds))}
            >
              전체
            </Text>
          )}
          {parentCategories.length === 0 && subParentCategories.length === 0 && (
            <>
              <Skeleton
                width="24px"
                height="24px"
                disableAspectRatio
                customStyle={{ borderRadius: 8 }}
              />
              <Skeleton
                width="37px"
                height="24px"
                disableAspectRatio
                customStyle={{ borderRadius: 8 }}
              />
              <Skeleton
                width="33px"
                height="24px"
                disableAspectRatio
                customStyle={{ borderRadius: 8 }}
              />
              <Skeleton
                width="37px"
                height="24px"
                disableAspectRatio
                customStyle={{ borderRadius: 8 }}
              />
              <Skeleton
                width="37px"
                height="24px"
                disableAspectRatio
                customStyle={{ borderRadius: 8 }}
              />
            </>
          )}
          {showParentCategories &&
            parentCategories.map(({ id, name }, index) => (
              <Text
                key={`parent-category-${id}`}
                ref={(ref) => {
                  if (ref) parentCategoryTagRefs.current[index] = ref;
                }}
                weight={convertStringToArray(String(parentIds)).includes(id) ? 'bold' : 'regular'}
                onClick={handleClickParentCategory(id, name.replace(/\(P\)/g, ''))}
                isActive={convertStringToArray(String(parentIds)).includes(id)}
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
                  onClick={handleClickSubParentCategory({
                    parentId,
                    subParentId: id,
                    subParentName: name
                  })}
                  isActive={convertStringToArray(String(subParentIds)).includes(id)}
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
          zIndex: zIndex.header,
          top: showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT + HEADER_HEIGHT : HEADER_HEIGHT
        }}
      />
    </Box>
  );
}

const Wrapper = styled.div<{ showAppDownloadBanner: boolean }>`
  position: fixed;
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
  height: ${CATEGORY_TAGS_HEIGHT}px;
  min-height: ${CATEGORY_TAGS_HEIGHT}px;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  width: 100%;
  overflow-x: auto;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT + HEADER_HEIGHT : HEADER_HEIGHT}px;
`;

const CategoryTags = styled.div`
  height: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  column-gap: 20px;
  width: fit-content;
`;

const Text = styled(Typography)<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  height: 100%;
  cursor: pointer;
  border-bottom: 2px solid transparent;

  ${({
    theme: {
      palette: { common }
    },
    isActive
  }): CSSObject =>
    isActive
      ? {
          borderColor: common.ui20
        }
      : {}}
`;

export default ProductsCategoryTags;
