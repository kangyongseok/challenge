/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useEffect, useMemo } from 'react';

import { useRecoilValue } from 'recoil';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  List,
  WindowScroller
} from 'react-virtualized';
import type { Index, ListRowProps } from 'react-virtualized';
import { useInfiniteQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';

import type { ProductResult } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchUserProducts } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { toastState } from '@recoil/common';

import UserShopProductSoldOutConfirmBottomSheet from './UserShopProductSoldOutConfirmBottomSheet';
import UserShopProductManageBottomSheet from './UserShopProductManageBottomSheet';
import UserShopEmpty from './UserShopEmpty';

const cache = new CellMeasurerCache({
  fixedWidth: true
});

interface UserShopProductListProps {
  tab: string;
}

function UserShopProductList({ tab }: UserShopProductListProps) {
  const router = useRouter();
  const setToastState = useRecoilValue(toastState);
  const userProductsParams = useMemo(
    () => ({
      page: 0,
      status: tab === '0' ? [Number(tab || 0), 4, 8] : [1]
    }),
    [tab]
  );

  const {
    data: { pages = [] } = {},
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery(
    queryKeys.users.products(userProductsParams),
    ({ pageParam = 0 }) =>
      fetchUserProducts({
        ...userProductsParams,
        page: pageParam
      }),
    {
      refetchOnMount: 'always',
      getNextPageParam: (data) => {
        const { number = 0, totalPages = 0 } = data || {};

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  useEffect(() => {
    if (setToastState.status) {
      refetch();
    }
  }, [setToastState, refetch]);

  const groupedProducts = useMemo(() => {
    const contents = pages.flatMap(({ content }) => content);
    const newGroupedProductsLength =
      Math.floor(contents.length / 2) + (Math.floor(contents.length % 2) > 0 ? 1 : 0);
    const newGroupedProducts = [];

    for (let i = 0; i <= newGroupedProductsLength; i += 1) {
      newGroupedProducts.push(contents.splice(0, 2));
    }

    return newGroupedProducts.filter((product) => product.length);
  }, [pages]);

  const handleWishAtt = (product: ProductResult, i: number) => {
    return {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.PERSONAL,
      id: product.id,
      index: i + 1,
      brand: product.brand.name,
      category: product.category.name,
      parentId: product.category.parentId,
      site: product.site.name,
      price: product.price,
      cluster: product.cluster,
      source: attrProperty.productSource.MAIN_PERSONAL
    };
  };

  const handleProductAtt = (product: ProductResult, i: number) => {
    return {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.PERSONAL,
      index: i + 1,
      id: product.id,
      brand: product.brand.name,
      category: product.category.name,
      parentCategory: FIRST_CATEGORIES[product.category.parentId as number],
      site: product.site.name,
      price: product.price,
      source: attrProperty.productSource.MAIN_PERSONAL
    };
  };

  const loadMoreRows = async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    await fetchNextPage();
  };

  const handleResize = useCallback(() => {
    cache.clearAll();
  }, []);

  const handleClickProduct = useCallback(
    (id: number) => () => {
      logEvent(attrKeys.userShop.CLICK_PRODUCT_DETAIL, {
        name: attrProperty.productName.USER_SHOP,
        title: attrProperty.productTitle.PRODUCT
      });
      SessionStorage.set(sessionStorageKeys.productDetailEventProperties, {
        source: attrProperty.productSource.USER_SHOP_PRODUCT
      });
      router.push(`/products/${id}`);
    },
    [router]
  );

  const rowRenderer = useCallback(
    ({ key, index, parent, style }: ListRowProps) => {
      const groupedProduct = groupedProducts[index] || [];
      const firstProduct = groupedProduct[0];
      const secondProduct = groupedProduct[1];

      return firstProduct || secondProduct ? (
        // @ts-ignore
        <CellMeasurer cache={cache} parent={parent} key={key} columnIndex={0} rowIndex={index}>
          {({ registerChild, measure }) => (
            <ProductGridCardBox
              ref={(ref) => {
                if (ref && registerChild) registerChild(ref);
              }}
              style={style}
            >
              {firstProduct && (
                <ProductGridCard
                  product={firstProduct}
                  measure={measure}
                  wishAtt={handleWishAtt(firstProduct, index)}
                  productAtt={handleProductAtt(firstProduct, index)}
                  name={attrProperty.productName.USER_SHOP}
                  source={attrProperty.productSource.USER_SHOP_PRODUCT}
                  onClick={handleClickProduct(firstProduct.id)}
                  hideWishButton
                  showShopManageButton
                  showMyShopHideOverlay
                />
              )}
              {secondProduct && (
                <ProductGridCard
                  product={secondProduct}
                  measure={measure}
                  wishAtt={handleWishAtt(secondProduct, index)}
                  productAtt={handleProductAtt(firstProduct, index)}
                  name={attrProperty.productName.USER_SHOP}
                  source={attrProperty.productSource.USER_SHOP_PRODUCT}
                  onClick={handleClickProduct(secondProduct.id)}
                  hideWishButton
                  showShopManageButton
                  showMyShopHideOverlay
                />
              )}
            </ProductGridCardBox>
          )}
        </CellMeasurer>
      ) : null;
    },
    [groupedProducts, handleClickProduct]
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return !isLoading && groupedProducts.length === 0 ? (
    <UserShopEmpty tab={tab} />
  ) : (
    <Flexbox direction="vertical" component="section" gap={20} customStyle={{ paddingBottom: 100 }}>
      {isLoading ? (
        <ProductGridList>
          {Array.from(new Array(6), (_, index) => (
            <ProductGridCardSkeleton key={`product-grid-card-skeleton-${index}`} />
          ))}
        </ProductGridList>
      ) : (
        // @ts-ignore
        <InfiniteLoader
          isRowLoaded={(params: Index) => !!groupedProducts[params.index]}
          loadMoreRows={loadMoreRows}
          rowCount={hasNextPage ? groupedProducts.length + 10 : groupedProducts.length}
        >
          {({ registerChild, onRowsRendered }) => (
            // @ts-ignore
            <WindowScroller>
              {({ height, isScrolling, scrollTop }) => (
                // @ts-ignore
                <AutoSizer disableHeight onResize={handleResize}>
                  {({ width }) => (
                    // @ts-ignore
                    <List
                      ref={registerChild}
                      onRowsRendered={onRowsRendered}
                      autoHeight
                      width={width}
                      height={height}
                      isScrolling={isScrolling}
                      scrollTop={scrollTop}
                      rowCount={groupedProducts.length}
                      rowHeight={cache.rowHeight}
                      rowRenderer={rowRenderer}
                      deferredMeasurementCache={cache}
                    />
                  )}
                </AutoSizer>
              )}
            </WindowScroller>
          )}
        </InfiniteLoader>
      )}
      <UserShopProductManageBottomSheet />
      <UserShopProductSoldOutConfirmBottomSheet />
    </Flexbox>
  );
}

const ProductGridList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const ProductGridCardBox = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding-bottom: 32px;
`;

export default UserShopProductList;
