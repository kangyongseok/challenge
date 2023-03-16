import { useEffect, useMemo, useRef } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Skeleton, Typography } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  CATEGORY_TAGS_HEIGHT,
  HEADER_HEIGHT,
  IOS_SAFE_AREA_TOP
} from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCenterScrollLeft } from '@utils/scroll';
import { convertSearchParamsByQuery } from '@utils/products';
import { convertStringToArray, isExtendedLayoutIOSVersion } from '@utils/common';

import type { ProductsVariant } from '@typings/products';
import {
  productFilterScrollToggleState,
  productsStatusTriggeredStateFamily,
  searchOptionsStateFamily
} from '@recoil/productsFilter';
import { showAppDownloadBannerState } from '@recoil/common';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';

interface ProductsCategoryTagListProps {
  variant: ProductsVariant;
}

function ProductsCategoryTags({ variant }: ProductsCategoryTagListProps) {
  const router = useRouter();
  const { keyword = '', parentIds, subParentIds } = router.query;
  const atomParam = router.asPath.split('?')[0];

  const filterScrollToggleState = useRecoilValue(productFilterScrollToggleState);

  const triggered = useReverseScrollTrigger(filterScrollToggleState);

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const { triggered: productsStatusTriggered } = useRecoilValue(
    productsStatusTriggeredStateFamily(atomParam)
  );
  const wrapperRef = useRef<HTMLDivElement>(null);
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
    <StyledCategoryTags
      showAppDownloadBanner={showAppDownloadBanner}
      triggered={triggered}
      productsStatusTriggered={productsStatusTriggered}
    >
      <Box
        component="section"
        customStyle={{ minHeight: CATEGORY_TAGS_HEIGHT, position: 'relative' }}
      >
        <Wrapper ref={wrapperRef}>
          <List>
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
                {Array.from({ length: 12 }).map((_, index) => (
                  <Skeleton
                    // eslint-disable-next-line react/no-array-index-key
                    key={`category-tag-skeleton-${index}`}
                    width={index === 0 ? 37 : 33}
                    height={24}
                    round={8}
                    disableAspectRatio
                  />
                ))}
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
          </List>
        </Wrapper>
      </Box>
    </StyledCategoryTags>
  );
}

const StyledCategoryTags = styled.div<{
  showAppDownloadBanner: boolean;
  triggered?: boolean;
  productsStatusTriggered?: boolean;
}>`
  position: sticky;
  ${({ productsStatusTriggered }): CSSObject =>
    productsStatusTriggered
      ? {
          opacity: 0
        }
      : {}};
  top: ${({ showAppDownloadBanner }) =>
    `calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + ${
      showAppDownloadBanner ? HEADER_HEIGHT + APP_DOWNLOAD_BANNER_HEIGHT : HEADER_HEIGHT
    }px)`};
  ${({ triggered, productsStatusTriggered }): CSSObject => {
    if (!triggered && productsStatusTriggered) {
      return {
        transform: 'translateY(-30px)',
        opacity: 0,
        pointerEvents: 'none'
      };
    }
    if (triggered && productsStatusTriggered) {
      return {
        opacity: 1
      };
    }
    return {};
  }};

  z-index: ${({ theme: { zIndex } }) => zIndex.header - 1};
  transition: top 0.5s, opacity 0.2s, transform 0.2s;
`;

const Wrapper = styled.div`
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
  height: ${CATEGORY_TAGS_HEIGHT}px;
  min-height: ${CATEGORY_TAGS_HEIGHT}px;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  width: 100%;
  overflow-x: auto;
  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
`;

const List = styled.div`
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
