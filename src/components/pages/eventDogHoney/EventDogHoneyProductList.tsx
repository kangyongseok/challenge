/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  List,
  WindowScroller
} from 'react-virtualized';
import type { Index, ListRowProps } from 'react-virtualized';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Label, Skeleton, Typography, useTheme } from 'mrcamel-ui';
import { useInfiniteQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import EventDogHoneyProductCard from '@components/pages/eventDogHoney/EventDogHoneyProductCard';

import { logEvent } from '@library/amplitude';

import { fetchContentProducts } from '@api/common';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  eventContentDogHoneyFilterState,
  eventContentDogHoneyScrollTopState,
  eventContentProductsParamsState
} from '@recoil/eventFilter';

const cache = new CellMeasurerCache({
  fixedWidth: true
});

interface EventDogHoneyProductListProps {
  offsetTop: number;
}

function EventDogHoneyProductList({ offsetTop }: EventDogHoneyProductListProps) {
  const router = useRouter();
  const {
    theme: {
      palette: { common, secondary }
    }
  } = useTheme();

  const eventContentProductsParams = useRecoilValue(eventContentProductsParamsState);
  const [eventContentDogHoneyScrollTop, setEventContentDogHoneyScrollTop] = useRecoilState(
    eventContentDogHoneyScrollTopState
  );
  const setEventContentDogHoneyFilterState = useSetRecoilState(eventContentDogHoneyFilterState);

  const [listScrollTop, setListScrollTop] = useState(eventContentDogHoneyScrollTop);

  const eventContentDogHoneyScrollTopRef = useRef(eventContentDogHoneyScrollTop);

  const {
    data: { pages = [] } = {},
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useInfiniteQuery(
    queryKeys.commons.contentProducts(eventContentProductsParams),
    ({ pageParam = 0 }) => fetchContentProducts({ ...eventContentProductsParams, page: pageParam }),
    {
      getNextPageParam(data) {
        const { number = 0, totalPages = 0 } = data || {};

        return number < totalPages - 1 ? number + 1 : undefined;
      },
      enabled: !!eventContentProductsParams.id,
      onSuccess(successData) {
        const { pages: successDataPages = [] } = successData;
        const pageNumber = successDataPages.length;
        const keyword =
          eventContentProductsParams.keyword === '' ? '전체' : eventContentProductsParams.keyword;

        logEvent(attrKeys.events.LOAD_PRODUCT_LIST, {
          name: attrProperty.name.EVENT_DETAIL,
          title: '2301_DOG_HONEY',
          type: attrProperty.type.GUIDED,
          keyword,
          page: pageNumber,
          productTotal: successDataPages[pageNumber - 1].totalElements,
          data: successDataPages[pageNumber - 1].content
        });

        setEventContentDogHoneyFilterState((currVal) => ({
          ...currVal,
          totalElements: successDataPages[0].totalElements
        }));
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

  const loadMoreRows = useCallback(async () => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return;

    await fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]);

  const rowRenderer = useCallback(
    ({ key, index, parent, style }: ListRowProps) => {
      const groupedProduct = groupedProducts[index] || [];
      const firstProduct = groupedProduct[0];
      const secondProduct = groupedProduct[1];
      const firstProductDiscountPercentage = +(100 - (firstProduct?.scorePriceRate || 0)).toFixed();
      const secondProductDiscountPercentage = +(
        100 - (secondProduct?.scorePriceRate || 0)
      ).toFixed();

      return firstProduct || secondProduct ? (
        // @ts-ignore
        <CellMeasurer cache={cache} parent={parent} key={key} columnIndex={0} rowIndex={index}>
          {({ registerChild, measure }) => (
            <ProductGridList
              ref={(ref) => {
                if (ref && registerChild) registerChild(ref);
              }}
              style={style}
            >
              {firstProduct && (
                <EventDogHoneyProductCard
                  variant="gridA"
                  hidePrice={false}
                  product={firstProduct}
                  attributes={{
                    name: attrProperty.name.EVENT_DETAIL,
                    title: '2301_DOG_HONEY',
                    source: attrProperty.source.EVENT_PRODUCT_LIST,
                    index: index * 2 + 1
                  }}
                  measure={measure}
                  subText={
                    firstProduct.size ? `size ${firstProduct.size?.replace(/\|/g, ',')}` : undefined
                  }
                  bottomLabel={
                    <Flexbox direction="vertical" gap={4}>
                      {firstProductDiscountPercentage >= 30 && (
                        <Label
                          size="xsmall"
                          variant="ghost"
                          brandColor="red"
                          text={
                            <>
                              <Typography
                                variant="small2"
                                weight="medium"
                                customStyle={{ color: secondary.red.light }}
                              >
                                {`실거래가 대비 ${firstProductDiscountPercentage}%`}
                              </Typography>
                              <Icon
                                name="Arrow4DownFilled"
                                customStyle={{ width: 12, height: 12, color: '#E5001B' }}
                              />
                            </>
                          }
                          customStyle={{ padding: '3px 4px' }}
                        />
                      )}
                      {firstProduct.viewCount >= 10 && (
                        <Label
                          size="xsmall"
                          variant="ghost"
                          brandColor="gray"
                          text={
                            <Typography variant="small2" weight="medium">
                              {`오늘 ${firstProduct.viewCount}번 조회`}
                            </Typography>
                          }
                          customStyle={{
                            padding: '3px 4px',
                            color: common.ui60,
                            width: 'fit-content'
                          }}
                        />
                      )}
                    </Flexbox>
                  }
                />
              )}
              {secondProduct && (
                <EventDogHoneyProductCard
                  variant="gridA"
                  hidePrice={false}
                  product={secondProduct}
                  attributes={{
                    name: attrProperty.name.EVENT_DETAIL,
                    title: '2301_DOG_HONEY',
                    source: attrProperty.source.EVENT_PRODUCT_LIST,
                    index: index * 2 + 2
                  }}
                  measure={measure}
                  subText={
                    secondProduct.size
                      ? `size ${secondProduct.size?.replace(/\|/g, ',')}`
                      : undefined
                  }
                  bottomLabel={
                    <Flexbox direction="vertical" gap={4}>
                      {secondProductDiscountPercentage >= 30 && (
                        <Label
                          size="xsmall"
                          variant="ghost"
                          brandColor="red"
                          text={
                            <>
                              <Typography
                                variant="small2"
                                weight="medium"
                                customStyle={{ color: secondary.red.light }}
                              >
                                {`실거래가 대비 ${secondProductDiscountPercentage}%`}
                              </Typography>
                              <Icon
                                name="Arrow4DownFilled"
                                customStyle={{ width: 12, height: 12, color: '#E5001B' }}
                              />
                            </>
                          }
                          customStyle={{ padding: '3px 4px' }}
                        />
                      )}
                      {secondProduct.viewCount >= 10 && (
                        <Label
                          size="xsmall"
                          variant="ghost"
                          brandColor="gray"
                          text={
                            <Typography variant="small2" weight="medium">
                              {`오늘 ${secondProduct.viewCount}번 조회`}
                            </Typography>
                          }
                          customStyle={{
                            padding: '3px 4px',
                            color: common.ui60,
                            width: 'fit-content'
                          }}
                        />
                      )}
                    </Flexbox>
                  }
                />
              )}
            </ProductGridList>
          )}
        </CellMeasurer>
      ) : null;
    },
    [common.ui60, groupedProducts, secondary.red.light]
  );

  useEffect(() => {
    const handleRouteChangeStart = (_: unknown, { shallow }: { shallow: boolean }) => {
      if (!shallow) {
        setEventContentDogHoneyScrollTop(window.scrollY);
      }
    };

    const handleRouteChangeComplete = () => {
      if (eventContentDogHoneyScrollTop) {
        window.scrollTo(0, eventContentDogHoneyScrollTop);
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [eventContentDogHoneyScrollTop, router, setEventContentDogHoneyScrollTop]);

  useEffect(() => {
    const handleScroll = () => {
      setListScrollTop(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (eventContentDogHoneyScrollTopRef.current) {
      setListScrollTop(0);
      eventContentDogHoneyScrollTopRef.current = 0;
    }
  }, []);

  useEffect(() => {
    logEvent(attrKeys.events.VIEW_PRODUCT_LIST, {
      name: attrProperty.name.EVENT_DETAIL,
      title: '2301_DOG_HONEY',
      type: attrProperty.type.GUIDED,
      keyword:
        eventContentProductsParams.keyword === '' ? '전체' : eventContentProductsParams.keyword
    });
  }, [eventContentProductsParams.keyword]);

  return (
    <Flexbox
      direction="vertical"
      component="section"
      customStyle={{
        marginTop: -offsetTop,
        paddingTop: offsetTop,
        minHeight: `calc(100vh + ${offsetTop}px)`
      }}
    >
      {isLoading ? (
        <ProductGridList>
          {Array.from(new Array(10), (_, index) => (
            <Flexbox
              key={`product-grid-card-skeleton-${index}`}
              direction="vertical"
              customStyle={{ paddingBottom: 52 }}
            >
              <Skeleton ratio="5:6" />
              <Box customStyle={{ position: 'relative', padding: '14px 12px' }}>
                <Flexbox alignment="baseline" gap={4} customStyle={{ marginTop: 4 }}>
                  <Skeleton width={52} height={24} round={8} disableAspectRatio />
                  <Skeleton width={38} height={12} round={8} disableAspectRatio />
                </Flexbox>
                <Skeleton
                  width="100%"
                  maxWidth={80}
                  height={12}
                  round={8}
                  disableAspectRatio
                  customStyle={{ marginTop: 10 }}
                />
                <Skeleton
                  width="100%"
                  maxWidth={50}
                  height={12}
                  round={8}
                  disableAspectRatio
                  customStyle={{ marginTop: 8 }}
                />
                <Flexbox direction="vertical" gap={4} customStyle={{ marginTop: 12 }}>
                  <Skeleton width={100} height={18} round={8} disableAspectRatio />
                  <Skeleton width={70} height={18} round={8} disableAspectRatio />
                </Flexbox>
              </Box>
            </Flexbox>
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
              {({ height, isScrolling, scrollLeft }) => (
                // @ts-ignore
                <AutoSizer disableHeight>
                  {({ width }) => {
                    return (
                      // @ts-ignore
                      <List
                        ref={registerChild}
                        onRowsRendered={onRowsRendered}
                        autoHeight
                        width={width}
                        height={height}
                        isScrolling={isScrolling}
                        scrollTop={listScrollTop - cache.rowHeight({ index: 0 }) - 52} // -Gap
                        scrollLeft={scrollLeft}
                        rowCount={groupedProducts.length}
                        rowHeight={cache.rowHeight}
                        rowRenderer={rowRenderer}
                        deferredMeasurementCache={cache}
                      />
                    );
                  }}
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
  padding-bottom: 52px;
  gap: 2px;
`;

export default EventDogHoneyProductList;
