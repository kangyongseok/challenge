/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useEffect, useMemo } from 'react';

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
import { Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';

import type { ProductResult } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchProductsByUserId } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

const cache = new CellMeasurerCache({
  fixedWidth: true
});

interface UserInfoProductsPanelProps {
  userId: number;
}

function UserInfoProductsPanel({ userId }: UserInfoProductsPanelProps) {
  const router = useRouter();
  const {
    theme: { palette }
  } = useTheme();

  const params = useMemo(() => ({ userId, size: 20 }), [userId]);
  const {
    data: { pages = [] } = {},
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery(
    queryKeys.users.productsByUserId(params),
    async ({ pageParam = 0 }) => fetchProductsByUserId({ ...params, page: pageParam }),
    {
      enabled: !!params.userId,
      getNextPageParam: (nextData) => {
        const { number = 0, totalPages = 0 } = nextData || {};

        if (number > 0) {
          logEvent(attrKeys.sellerInfo.LOAD_MOREAUTO, {
            title: attrProperty.title.SELLER_PRODUCT,
            name: attrProperty.name.SELLER_PRODUCT,
            page: number,
            userId
          });
        }

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

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
      name: attrProperty.name.SELLER_INFO,
      title: attrProperty.title.SELLER_PRODUCT,
      id: product.id,
      index: i + 1,
      brand: product.brand.name,
      category: product.category.name,
      parentId: product.category.parentId,
      site: product.site.name,
      price: product.price,
      cluster: product.cluster,
      source: attrProperty.source.SELLER_INFO_SELLER_PRODUCT,
      sellerType: product.sellerType
    };
  };

  const handleProductAtt = (product: ProductResult, i: number) => {
    return {
      name: attrProperty.name.SELLER_INFO,
      title: attrProperty.title.SELLER_PRODUCT,
      id: product.id,
      index: i + 1,
      brand: product.brand.name,
      category: product.category.name,
      parentId: product.category.parentId,
      site: product.site.name,
      price: product.price,
      cluster: product.cluster,
      source: attrProperty.source.MAIN_PERSONAL,
      sellerType: product.sellerType
    };
  };

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

  const loadMoreRows = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    await fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleResize = useCallback(() => {
    cache.clearAll();
  }, []);

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
    <Typography
      weight="bold"
      variant="h3"
      customStyle={{ textAlign: 'center', margin: '84px 20px 0', color: palette.common.ui60 }}
    >
      판매중인 매물이 없어요
    </Typography>
  ) : (
    <Flexbox direction="vertical" component="section" customStyle={{ paddingBottom: 100 }}>
      {isLoading ? (
        <ProductGridList>
          {Array.from(new Array(10), (_, index) => (
            <ProductGridCardSkeleton key={`product-grid-card-skeleton-${index}`} />
          ))}
        </ProductGridList>
      ) : (
        // @ts-ignore
        <InfiniteLoader
          isRowLoaded={({ index }: Index) => !!groupedProducts[index]}
          loadMoreRows={loadMoreRows}
          rowCount={hasNextPage ? groupedProducts.length + 10 : groupedProducts.length}
        >
          {({ registerChild, onRowsRendered }) => (
            // @ts-ignore
            <WindowScroller>
              {({ height, isScrolling, scrollTop, scrollLeft }) => (
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
                      scrollLeft={scrollLeft}
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

export default UserInfoProductsPanel;
