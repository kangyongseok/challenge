/* eslint-disable @typescript-eslint/ban-ts-comment,no-param-reassign */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
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
import { useInfiniteQuery, useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Box, CtaButton, Flexbox, Grid, Toast, Typography, useTheme } from 'mrcamel-ui';
import throttle from 'lodash-es/throttle';

import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';
import { Skeleton } from '@components/UI/atoms';

import type { Product } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchSearch, fetchSearchOptions } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { filterCodeIds } from '@constants/productsFilter';
import { SHOW_PRODUCTS_KEYWORD_POPUP } from '@constants/localStorage';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  convertSearchParamsByQuery,
  getEventPropertySortValue,
  getEventPropertyViewType
} from '@utils/products';
import { getUtmParams } from '@utils/common';

import type { ProductsVariant } from '@typings/products';
import { ProductsEventProperties } from '@typings/products';
import type { UtmParams } from '@typings/common';
import {
  productsKeywordInduceTriggerState,
  productsSaveSearchPopupState
} from '@recoil/productsKeyword';
import {
  prevScrollTopStateFamily,
  productsFilterProgressDoneState,
  productsFilterTotalCountStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import { ProductsKeywordAlert } from '.';

const cache = new CellMeasurerCache({
  fixedWidth: true
});

function groupingProducts(products: Product[]) {
  const productsLength = products.length;
  const newProducts = products.map((product, index) => ({ ...product, index }));
  const newGroupingProducts = [];
  const newGroupingProductsLength =
    Math.floor(productsLength / 2) + (Math.floor(productsLength % 2) > 0 ? 1 : 0);

  for (let i = 0; i <= newGroupingProductsLength; i += 1) {
    newGroupingProducts.push(newProducts.splice(0, 2));
  }

  return newGroupingProducts.filter((newProduct) => newProduct.length);
}

interface ProductsInfiniteGridProps {
  variant: ProductsVariant;
  name?: string;
}

function ProductsInfiniteGrid({ variant, name }: ProductsInfiniteGridProps) {
  const router = useRouter();
  const { keyword, parentIds } = router.query;
  const atomParam = router.asPath.split('?')[0];

  const { searchParams } = useRecoilValue(searchParamsStateFamily(`search-${atomParam}`));
  const { searchParams: searchOptionsParams } = useRecoilValue(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const { selectedSearchOptions } = useRecoilValue(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );
  const [{ prevScrollTop }, setPrevScrollTopState] = useRecoilState(
    prevScrollTopStateFamily(router.pathname)
  );
  const progressDone = useRecoilValue(productsFilterProgressDoneState);
  const { alert } = useRecoilValue(productsKeywordInduceTriggerState);
  const setTotalCountState = useSetRecoilState(
    productsFilterTotalCountStateFamily(`search-${atomParam}`)
  );

  const [openProductsSaveSearchPopup, setProductsSaveSearchPopup] = useRecoilState(
    productsSaveSearchPopupState
  );

  const { data: accessUser } = useQueryAccessUser();

  const prevScrollTopRef = useRef(prevScrollTop);
  const windowInnerWidthRef = useRef(0);
  const loggedViewProductListLogEventRef = useRef(false);
  const loggedLoadProductListLogEventRef = useRef(false);

  const thrHandleResize = useRef(
    throttle(() => {
      if (windowInnerWidthRef.current !== window.innerWidth) {
        windowInnerWidthRef.current = window.innerWidth;
        cache.clearAll();
      }
    }, 500)
  ).current;

  const {
    theme: {
      palette: { common },
      typography: {
        body1: { weight }
      }
    }
  } = useTheme();

  const [listScrollTop, setListScrollTop] = useState(prevScrollTop);
  const [isNotUsedBrand, setIsNotUsedBrand] = useState(false);
  const [hasSelectedSearchOptions, setHasSelectedSearchOptions] = useState(false);
  const [openToast, setOpenToast] = useState(false);

  const queryClient = useQueryClient();

  const { data: { userProductKeyword } = {}, isFetched: isSearchOptionsFetched } = useQuery(
    queryKeys.products.searchOptions(searchOptionsParams),
    () => fetchSearchOptions(searchOptionsParams),
    {
      keepPreviousData: true,
      enabled: Object.keys(searchOptionsParams).length > 0,
      staleTime: 5 * 60 * 1000
    }
  );

  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetched,
    data: { pageParams = [], pages = [] } = {}
  } = useInfiniteQuery(
    queryKeys.products.search(searchParams),
    ({ pageParam = 0 }) =>
      fetchSearch({
        ...searchParams,
        page: pageParam
      }),
    {
      onSuccess: ({ pages: newPages = [] }) => {
        const lastPage = newPages[newPages.length - 1] || { productTotal: 0 };

        setTotalCountState(({ type }) => ({
          type,
          count: lastPage.productTotal
        }));
      },
      getNextPageParam: (data) => {
        const { page: { number = 0, totalPages = 0 } = {} } = data || {};

        return number < totalPages - 1 ? number + 1 : undefined;
      },
      keepPreviousData: true,
      enabled: Object.keys(searchParams).length > 0,
      staleTime: 5 * 60 * 1000
    }
  );

  const lastPage = useMemo(() => pages[pages.length - 1], [pages]);

  const allowProductsKeyword = useMemo(() => {
    const allowPathNames = [
      '/products/brands/[keyword]',
      '/products/categories/[keyword]',
      '/products/search/[keyword]'
    ];
    return allowPathNames.includes(router.pathname);
  }, [router.pathname]);

  const products = useMemo(
    () => groupingProducts(pages.map(({ page: { content } }) => content).flat()),
    [pages]
  );

  const loadMoreRows = async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    if (lastPage) {
      const {
        page: { totalPages, number }
      } = lastPage;

      logEvent(attrKeys.products.loadMoreAuto, {
        ...searchParams,
        page: number + 1,
        totalPages,
        viewType: getEventPropertyViewType(variant, parentIds)
      });
    }

    await fetchNextPage();
  };

  const handleProductAtt = useCallback(
    (product: Product) => {
      return {
        name: attrProperty.productName.PRODUCT_LIST,
        index: (product.index || 0) + 1,
        id: product.id,
        brand: product.brand.name,
        category: product.category.name,
        parentCategory: FIRST_CATEGORIES[product.category.parentId as number],
        line: product.line,
        site: product.site.name,
        price: product.price,
        scoreTotal: product.scoreTotal,
        scoreStatus: product.scoreStatus,
        scoreSeller: product.scoreSeller,
        scorePrice: product.scorePrice,
        scorePriceAvg: product.scorePriceAvg,
        scorePriceCount: product.scorePriceCount,
        scorePriceRate: product.scorePriceRate,
        cluster: product.cluster,
        listMode: 'LIST',
        isSafeTrade: product.isSafeTrade,
        purchaseCount: product.purchaseCount,
        wishCount: product.wishCount,
        viewCount: product.viewCount,
        labels: product.labels && product.labels.map((l) => l.description),
        source: attrProperty.productSource.PRODUCT_LIST,
        sort: getEventPropertySortValue(searchParams.order)
      };
    },
    [searchParams.order]
  );

  const handleWishAtt = (product: Product) => {
    return {
      name: attrProperty.productName.PRODUCT_LIST,
      id: product.id,
      index: (product.index || 0) + 1,
      brand: product.brand.name,
      category: product.category.name,
      parentId: product.category.parentId,
      line: product.line,
      site: product.site.name,
      price: product.price,
      scoreTotal: product.scoreTotal,
      cluster: product.cluster,
      source: attrProperty.productSource.PRODUCT_LIST
    };
  };

  const handleWishAfterChangeCallback = useCallback(
    () => (product: Product, isWish: boolean) => {
      queryClient.setQueryData(queryKeys.products.search(searchParams), {
        pageParams,
        pages: pages.map((page) => {
          const findIndex = page.page.content.findIndex(({ id }) => id === product.id);

          if (findIndex !== -1) {
            const { wishCount } = page.page.content[findIndex];

            if (!isWish) {
              page.page.content[findIndex].wishCount = wishCount + 1;
            } else if (isWish && wishCount > 0) {
              page.page.content[findIndex].wishCount = wishCount - 1;
            }
            return page;
          }

          return page;
        })
      });
    },
    [pageParams, pages, queryClient, searchParams]
  );

  const rowRenderer = useCallback(
    ({ index, key, parent, style, isVisible }: ListRowProps) => {
      const productsGroup = products[index] || [];
      const firstProduct = productsGroup[0];
      const secondProduct = productsGroup[1];

      const openAlert =
        alert &&
        index >= 30 &&
        index % 15 === 0 &&
        index !== products.length - 1 &&
        allowProductsKeyword &&
        hasSelectedSearchOptions &&
        accessUser;

      if (!firstProduct && !secondProduct) return null;

      if (!isVisible) {
        return (
          // @ts-ignore
          <CellMeasurer cache={cache} parent={parent} key={key} columnIndex={0} rowIndex={index}>
            <div style={style}>
              <Grid container customStyle={{ paddingBottom: 32 }}>
                {firstProduct && (
                  <Grid item xs={2}>
                    <ProductGridCardSkeleton
                      title={firstProduct.title}
                      labels={firstProduct.labels}
                      productSeller={firstProduct.productSeller}
                      hasMetaInfo={!!firstProduct.wishCount || !!firstProduct.purchaseCount}
                    />
                  </Grid>
                )}
                {secondProduct && (
                  <Grid item xs={2}>
                    <ProductGridCardSkeleton
                      title={secondProduct.title}
                      labels={firstProduct.labels}
                      productSeller={firstProduct.productSeller}
                      hasMetaInfo={!!secondProduct.wishCount || !!secondProduct.purchaseCount}
                    />
                  </Grid>
                )}
              </Grid>
              {openAlert && (
                <Box customStyle={{ padding: '0 20px 32px 20px' }}>
                  <Skeleton
                    width="100%"
                    height="56px"
                    disableAspectRatio
                    customStyle={{ borderRadius: 8 }}
                  />
                </Box>
              )}
            </div>
          </CellMeasurer>
        );
      }

      // 비회원 검색집사 완료후 매물목록 저장 로그인 유도 팝업
      if (
        allowProductsKeyword &&
        window.scrollY > 0 &&
        index === 5 &&
        isVisible &&
        !openProductsSaveSearchPopup &&
        LocalStorage.get(SHOW_PRODUCTS_KEYWORD_POPUP)
      ) {
        setProductsSaveSearchPopup(true);
      }

      return (
        // @ts-ignore
        <CellMeasurer cache={cache} parent={parent} key={key} columnIndex={0} rowIndex={index}>
          {({ measure }) => (
            <div style={style}>
              <Grid container customStyle={{ paddingBottom: 32 }}>
                {firstProduct && (
                  <Grid item xs={2}>
                    <ProductGridCard
                      product={firstProduct}
                      measure={measure}
                      name={name}
                      source={attrProperty.productSource.PRODUCT_LIST}
                      productAtt={handleProductAtt(firstProduct)}
                      wishAtt={handleWishAtt(firstProduct)}
                      onWishAfterChangeCallback={handleWishAfterChangeCallback}
                    />
                  </Grid>
                )}
                {secondProduct && (
                  <Grid item xs={2}>
                    <ProductGridCard
                      product={secondProduct}
                      measure={measure}
                      name={name}
                      source={attrProperty.productSource.PRODUCT_LIST}
                      productAtt={handleProductAtt(secondProduct)}
                      wishAtt={handleWishAtt(secondProduct)}
                      onWishAfterChangeCallback={handleWishAfterChangeCallback}
                    />
                  </Grid>
                )}
              </Grid>
              {openAlert && (
                <Box customStyle={{ padding: '0 20px 32px 20px' }}>
                  <ProductsKeywordAlert index={index} measure={measure} />
                </Box>
              )}
            </div>
          )}
        </CellMeasurer>
      );
    },
    [
      products,
      alert,
      allowProductsKeyword,
      hasSelectedSearchOptions,
      accessUser,
      openProductsSaveSearchPopup,
      setProductsSaveSearchPopup,
      name,
      handleProductAtt,
      handleWishAfterChangeCallback
    ]
  );

  const handleClickRequestKeyword = () => {
    if (isNotUsedBrand) {
      logEvent(attrKeys.products.clickKeywordRequest, {
        keyword
      });
    } else {
      const { notUsedBrands = [] } = lastPage || {};
      logEvent(attrKeys.products.clickBrandRequest, {
        keyword,
        brand: notUsedBrands
      });
    }

    setOpenToast(true);
  };

  const handleRouteChangeStart = useCallback(
    (_: unknown, { shallow }: { shallow: boolean }) => {
      if (!shallow) {
        setPrevScrollTopState(({ type }) => ({
          type,
          prevScrollTop: window.scrollY
        }));
      }
    },
    [setPrevScrollTopState]
  );

  const handleScroll = useCallback(() => setListScrollTop(window.scrollY), []);

  const handleRouteChangeComplete = useCallback(() => {
    if (prevScrollTop && prevScrollTopRef.current) {
      window.scrollTo(0, prevScrollTop);
    }
  }, [prevScrollTop]);

  useEffect(() => {
    return () => LocalStorage.remove(SHOW_PRODUCTS_KEYWORD_POPUP);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router, handleRouteChangeComplete]);

  useEffect(() => {
    windowInnerWidthRef.current = window.innerWidth;
    window.addEventListener('resize', thrHandleResize);

    return () => {
      window.removeEventListener('resize', thrHandleResize);
    };
  }, [thrHandleResize]);

  useEffect(() => {
    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router, handleRouteChangeStart]);

  useEffect(() => {
    if (
      !progressDone &&
      isFetched &&
      isSearchOptionsFetched &&
      !loggedViewProductListLogEventRef.current
    ) {
      loggedViewProductListLogEventRef.current = true;

      let eventProperties: ProductsEventProperties & UtmParams =
        SessionStorage.get<ProductsEventProperties>(sessionStorageKeys.productsEventProperties) || {
          name: 'NONE',
          title: 'NONE',
          type: 'ETC'
        };

      if (eventProperties.title === 'MYLIST' && userProductKeyword) {
        const { keyword: userKeyword, keywordFilterJson } = userProductKeyword;
        if (userKeyword) eventProperties.keyword = userKeyword;
        if (keywordFilterJson) eventProperties.filters = JSON.parse(keywordFilterJson);
      } else if (router.pathname === '/products/crm/[notice]') {
        eventProperties = {
          ...eventProperties,
          name: attrProperty.productName.DIRECT,
          title: attrProperty.productTitle.DEFAULT,
          type: attrProperty.productType.CRM
        };
      } else {
        eventProperties = {
          ...eventProperties,
          ...convertSearchParamsByQuery(router.query, {
            variant
          })
        };
      }

      const utmParams = getUtmParams();

      if (Object.keys(utmParams).length) {
        const { utmSource = '', utmMedium, utmCampaign } = utmParams;
        eventProperties = {
          ...eventProperties,
          name: 'DIRECT',
          title: utmSource.toUpperCase(),
          type: 'UTM',
          utmSource,
          utmMedium,
          utmCampaign
        };
      }

      logEvent(attrKeys.products.viewProductList, eventProperties);

      SessionStorage.remove(sessionStorageKeys.productsEventProperties);
    }
  }, [
    router.pathname,
    router.query,
    variant,
    progressDone,
    isFetched,
    isSearchOptionsFetched,
    userProductKeyword
  ]);

  useEffect(() => {
    if (!progressDone && isFetched && !loggedLoadProductListLogEventRef.current) {
      loggedLoadProductListLogEventRef.current = true;

      const { productTotal, sellerTotal } = lastPage || {};
      const {
        name: nameProperty,
        type,
        title
      }: ProductsEventProperties = SessionStorage.get<ProductsEventProperties>(
        sessionStorageKeys.productsEventProperties
      ) || {
        name: 'NONE',
        title: 'NONE',
        type: 'ETC'
      };

      logEvent(attrKeys.products.loadProductList, {
        ...convertSearchParamsByQuery(router.query, {
          variant
        }),
        name: nameProperty,
        type,
        title,
        productTotal,
        sellerTotal
      });
    }
  }, [router.query, variant, progressDone, isFetched, lastPage]);

  useEffect(() => {
    if (lastPage) {
      const { notUsedBrands = [] } = lastPage;
      setIsNotUsedBrand(!notUsedBrands.length);
    }
  }, [lastPage]);

  useEffect(() => {
    setHasSelectedSearchOptions(
      !!selectedSearchOptions.filter(({ codeId }) => codeId !== filterCodeIds.order).length
    );
  }, [selectedSearchOptions]);

  // TODO 추후 로직 개선
  useEffect(() => {
    if (prevScrollTopRef.current && !progressDone) {
      setListScrollTop(0);
      prevScrollTopRef.current = 0;
      setPrevScrollTopState(({ type }) => ({
        type,
        prevScrollTop: 0
      }));
    }
  }, [setPrevScrollTopState, progressDone, prevScrollTop]);

  useEffect(() => {
    return () => {
      SessionStorage.remove(sessionStorageKeys.productsEventProperties);
    };
  }, []);

  if (!progressDone)
    return (
      <Grid container rowGap={32}>
        {Array.from({ length: 10 }, (_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Grid key={`product-card-skeleton-${index}`} item xs={2}>
            <ProductGridCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );

  if (progressDone && isFetched && !products.length) {
    return (
      <>
        <Flexbox gap={4} direction="vertical" customStyle={{ margin: '0 20px 24px 20px' }}>
          {variant === 'search' && keyword && (
            <Typography weight="medium">{`'${keyword}'`}</Typography>
          )}
          <Typography variant="body2" customStyle={{ color: common.grey['40'] }}>
            {!hasSelectedSearchOptions && isNotUsedBrand
              ? '아직 서비스 대상 브랜드가 아니에요.'
              : '조건을 만족하는 매물이 없어요.'}
          </Typography>
          <Typography variant="small2" customStyle={{ color: common.grey['60'] }}>
            {hasSelectedSearchOptions
              ? '필터를 다시 조합해 보세요!'
              : '검색 키워드를 변경하거나, 다른 모델을 검색해 보세요!'}
          </Typography>
        </Flexbox>
        {variant !== 'categories' && !hasSelectedSearchOptions && (
          <>
            <Box
              customStyle={{
                width: 'calc(100% - 40px)',
                height: 1,
                margin: '0 20px 24px 20px',
                backgroundColor: common.grey['90']
              }}
            />
            <Flexbox
              gap={24}
              direction="vertical"
              alignment="center"
              customStyle={{ marginBottom: 24, textAlign: 'center' }}
            >
              <Typography weight="medium">
                카멜 팀에게
                <br />
                입력하신 {isNotUsedBrand ? '검색어' : '브랜드'}를 추가해달라고 요청하세요!
              </Typography>
              <CtaButton
                fullWidth
                variant="contained"
                brandColor="primary"
                onClick={handleClickRequestKeyword}
                customStyle={{ maxWidth: 200, fontWeight: weight.bold }}
              >
                {isNotUsedBrand ? '검색어' : '브랜드'} 추가 요청
              </CtaButton>
            </Flexbox>
            <Toast open={openToast} onClose={() => setOpenToast(false)}>
              <Typography customStyle={{ color: common.white }}>
                {isNotUsedBrand ? '검색어' : '브랜드'} 추가가 성공적으로 완료되었어요! 검토 후
                빠르게 추가할게요.
              </Typography>
            </Toast>
          </>
        )}
      </>
    );
  }

  return (
    // @ts-ignore
    <InfiniteLoader
      loadMoreRows={loadMoreRows}
      isRowLoaded={(params: Index) => !!products[params.index]}
      rowCount={hasNextPage ? products.length + 15 : products.length}
    >
      {({ registerChild, onRowsRendered }) => (
        // @ts-ignore
        <WindowScroller>
          {({ height, isScrolling }) => (
            // @ts-ignore
            <AutoSizer disableHeight>
              {({ width }) => (
                // @ts-ignore
                <List
                  ref={registerChild}
                  onRowsRendered={onRowsRendered}
                  autoHeight
                  width={width}
                  height={height}
                  isScrolling={isScrolling}
                  scrollTop={listScrollTop}
                  rowCount={products.length}
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
  );
}

export default ProductsInfiniteGrid;
