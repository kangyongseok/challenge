/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useRecoilState } from 'recoil';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  Index,
  InfiniteLoader,
  List,
  ListRowProps,
  WindowScroller
} from 'react-virtualized';
import { useInfiniteQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import ProductGridCard from '@components/UI/molecules/ProductGridCard';
import { ProductGridCardSkeleton } from '@components/UI/molecules';

import type { ProductResult } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchRecommProducts } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { homePersonalProductCurationPrevScrollState } from '@recoil/home';

const cache = new CellMeasurerCache({
  fixedWidth: true
});

function HomePersonalProductCuration() {
  const router = useRouter();
  const [prevScrollY, setPrevScroll] = useRecoilState(homePersonalProductCurationPrevScrollState);

  const [recommProductsParams] = useState({ size: 20 });
  const {
    data: { pages = [] } = {},
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useInfiniteQuery(
    queryKeys.products.recommProducts(recommProductsParams),
    ({ pageParam = 0 }) => fetchRecommProducts({ ...recommProductsParams, page: pageParam }),
    {
      getNextPageParam: ({ number }, allPages) => (allPages.length <= 5 ? number + 1 : undefined),
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000
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
      logEvent(attrKeys.home.CLICK_PRODUCT_DETAIL, {
        name: attrProperty.productName.MAIN,
        title: attrProperty.productTitle.PERSONAL
      });
      SessionStorage.set(sessionStorageKeys.productDetailEventProperties, {
        source: attrProperty.productSource.MAIN_PERSONAL
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
                  hideProductLabel
                  wishAtt={handleWishAtt(firstProduct, index)}
                  productAtt={handleProductAtt(firstProduct, index)}
                  name={attrProperty.productName.MAIN}
                  source={attrProperty.productSource.MAIN_PERSONAL}
                  compact
                  isRound
                  onClick={handleClickProduct(firstProduct.id)}
                />
              )}
              {secondProduct && (
                <ProductGridCard
                  product={secondProduct}
                  measure={measure}
                  hideProductLabel
                  wishAtt={handleWishAtt(secondProduct, index)}
                  productAtt={handleProductAtt(firstProduct, index)}
                  name={attrProperty.productName.MAIN}
                  source={attrProperty.productSource.MAIN_PERSONAL}
                  compact
                  isRound
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
    const handleRouteChangeComplete = () => {
      if (prevScrollY) {
        window.scrollTo(0, prevScrollY);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [prevScrollY, router.events]);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setPrevScroll(window.scrollY);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router, setPrevScroll]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // @ts-ignore
  return (
    <Flexbox component="section" direction="vertical" gap={20} customStyle={{ padding: '20px 0' }}>
      <Flexbox
        direction="vertical"
        justifyContent="center"
        gap={2}
        customStyle={{ padding: '0 20px' }}
      >
        <Typography variant="h3" weight="bold">
          찾는 것과 비슷한 매물 👀
        </Typography>
        <Typography variant="body2">카멜이 전국에서 꿀매물만 모아왔어요.</Typography>
      </Flexbox>
      {isLoading ? (
        <ProductCuration>
          {Array.from({ length: 6 }, (_, index) => (
            <ProductGridCardSkeleton
              key={`carmel-product-curation-card-skeleton-${index}`}
              isRound
            />
          ))}
        </ProductCuration>
      ) : (
        <Box customStyle={{ padding: '0 20px' }}>
          {/* @ts-ignore */}
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
        </Box>
      )}
    </Flexbox>
  );
}

const ProductCuration = styled.div`
  padding: 0 20px;
  display: grid;
  gap: 32px 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const ProductGridCardBox = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 12px;
  padding-bottom: 32px;
`;

export default HomePersonalProductCuration;
