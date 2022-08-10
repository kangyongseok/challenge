import { useCallback, useEffect, useRef } from 'react';
import type { UIEvent } from 'react';

import { ParsedUrlQueryInput } from 'node:querystring';

import { useRecoilState } from 'recoil';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Typography } from 'mrcamel-ui';
import throttle from 'lodash-es/throttle';
import debounce from 'lodash-es/debounce';
import styled from '@emotion/styled';

import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';
import { Skeleton } from '@components/UI/atoms';

import type { ProductResult, SearchParams } from '@dto/product';

import { logEvent } from '@library/amplitude';

import {
  fetchProductKeywordProducts,
  fetchProductKeywords,
  putProductKeywordView
} from '@api/user';

import queryKeys from '@constants/queryKeys';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { homeSelectedTabStateFamily } from '@recoil/home';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function HomeProductsKeywordList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [{ selectedIndex, prevScroll }, setSelectedTabState] = useRecoilState(
    homeSelectedTabStateFamily('productKeyword')
  );

  const { data: accessUser } = useQueryAccessUser();
  const {
    data: productKeywordsData,
    isLoading: isLoadingProductKeywords,
    isFetched: isFetchedProductKeywords
  } = useQuery(queryKeys.users.userProductKeywords(), fetchProductKeywords, {
    refetchOnMount: selectedIndex === 0,
    onSuccess(data) {
      const firstProduct = data.content[0];
      const newProducts = data.content.filter((product) => product.isNew);
      const generalProducts = data.content.filter((product) => !product.isNew);

      if (firstProduct && selectedIndex === 0) {
        setSelectedTabState((currVal) => ({ ...currVal, selectedId: firstProduct.id }));
        logEvent(attrKeys.home.LOAD_MYLIST, {
          name: attrProperty.productName.MAIN,
          title: attrProperty.productTitle.MYLIST,
          total: data.content.length,
          totalIds: data.content.map((product) => product.id),
          new: newProducts.length,
          newIds: newProducts.map((product) => product.id),
          general: generalProducts.length,
          generalIds: generalProducts.map((product) => product.id)
        });
      }
    }
  });
  const { content: productKeywords = [] } = productKeywordsData || {};
  const selectedProductKeyword = productKeywords[selectedIndex];

  const {
    data: productKeywordProducts = [],
    isLoading: isLoadingProductKeywordProducts,
    isFetching: isFetchingProductKeywordProducts
  } = useQuery(
    queryKeys.users.productKeywordProducts(selectedProductKeyword?.id),
    () => fetchProductKeywordProducts(selectedProductKeyword?.id),
    {
      refetchOnMount: true,
      enabled: !!accessUser && !isLoadingProductKeywords && productKeywords.length > 0,
      onSettled() {
        if (productKeywordListRef.current?.scrollLeft !== 0) {
          productKeywordListRef.current?.scrollTo(0, 0);
        }
      }
    }
  );
  const { mutate: productKeywordViewMutate } = useMutation(putProductKeywordView);

  const productKeywordTabRef = useRef<HTMLDivElement | null>(null);
  const productKeywordListRef = useRef<HTMLDivElement | null>(null);
  const throttleScrollProductKeyword = useRef(
    throttle((e: UIEvent<HTMLDivElement>) => {
      const scrollLeft = e.currentTarget?.scrollLeft;

      if (scrollLeft) {
        setSelectedTabState((currVal) => ({
          ...currVal,
          prevScroll: scrollLeft
        }));
      }
    }, 200)
  );
  const debounceScrollProductKeyword = useRef(
    debounce(() => {
      logEvent(attrKeys.home.SWIPE_X_BUTTON, {
        name: attrProperty.productName.MAIN,
        title: attrProperty.productTitle.MYLIST
      });
    }, 500)
  ).current;
  const isLoading = isLoadingProductKeywords || isLoadingProductKeywordProducts;

  const handleTabScroll = (e: UIEvent<HTMLDivElement>) => {
    throttleScrollProductKeyword.current(e);
    debounceScrollProductKeyword();
  };

  const handleClickTab = useCallback(
    (index: number) => () => {
      logEvent(attrKeys.home.CLICK_MYLIST_BUTTON, {
        name: attrProperty.productName.MAIN,
        att: productKeywords[index].isNew ? 'NEW' : 'GENERAL',
        index
      });

      productKeywordListRef.current?.scrollTo(0, 0);

      if (selectedIndex !== index) {
        setSelectedTabState((currVal) => ({ ...currVal, selectedIndex: index }));
      }
    },
    [productKeywords, selectedIndex, setSelectedTabState]
  );

  const handleCardScroll = debounce(() => {
    logEvent(attrKeys.home.SWIP_X_CARD, {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.MYLIST
    });
  }, 500);

  const handleWishAtt = (product: ProductResult, i: number) => {
    return {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.MYLIST,
      id: product.id,
      index: i + 1,
      brand: product.brand.name,
      category: product.category.name,
      parentId: product.category.parentId,
      site: product.site.name,
      price: product.price,
      cluster: product.cluster,
      source: attrProperty.productSource.MAIN_MYLIST
    };
  };

  const handleProductAtt = (product: ProductResult, i: number) => {
    return {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.MYLIST,
      index: i + 1,
      id: product.id,
      brand: product.brand.name,
      category: product.category.name,
      parentCategory: FIRST_CATEGORIES[product.category.parentId as number],
      site: product.site.name,
      price: product.price,
      source: attrProperty.productSource.MAIN_MYLIST
    };
  };

  const handleClickProductKeywordProduct = useCallback(
    (id: number) => () => {
      logEvent(attrKeys.home.CLICK_PRODUCT_DETAIL, {
        name: attrProperty.productName.MAIN,
        title: attrProperty.productTitle.MYLIST
      });

      if (selectedProductKeyword) {
        productKeywordViewMutate(selectedProductKeyword.id, {
          onSettled: () => {
            if (productKeywordsData) {
              queryClient.setQueryData(queryKeys.users.userProductKeywords(), {
                ...productKeywordsData,
                content: productKeywordsData.content.map((productKeyword) =>
                  productKeyword.id === selectedProductKeyword.id
                    ? { ...productKeyword, isNew: false }
                    : productKeyword
                )
              });
            }

            router.push(`/products/${id}`);
          }
        });
      }
    },
    [productKeywordViewMutate, productKeywordsData, queryClient, router, selectedProductKeyword]
  );

  const handleClickAll = useCallback(() => {
    if (isLoading || !selectedProductKeyword) return;

    logEvent(attrKeys.home.CLICK_PRODUCT_LIST, {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.MYLIST,
      att: selectedProductKeyword.isNew ? 'NEW' : 'GENERAL'
    });

    const searchParams: SearchParams = JSON.parse(selectedProductKeyword.keywordFilterJson);
    let viewType = 'search';
    let productKeyword: string | string[] | undefined = searchParams.keyword;

    if (selectedProductKeyword.sourceType === 3) {
      viewType = 'categories';
      productKeyword = searchParams.categories;
    }

    if (selectedProductKeyword.sourceType === 1 || selectedProductKeyword.sourceType === 2) {
      viewType = 'brands';
      productKeyword = searchParams.requiredBrands;
    }

    if (selectedProductKeyword.isNew) {
      productKeywordViewMutate(selectedProductKeyword.id, {
        onSettled: () =>
          router.push({
            pathname: `/products/${viewType}/${encodeURIComponent(String(productKeyword))}`,
            query: searchParams as ParsedUrlQueryInput
          })
      });
    } else {
      router.push({
        pathname: `/products/${viewType}/${encodeURIComponent(String(productKeyword))}`,
        query: searchParams as ParsedUrlQueryInput
      });
    }
  }, [isLoading, productKeywordViewMutate, router, selectedProductKeyword]);

  useEffect(() => {
    logEvent(attrKeys.home.VIEW_MYLIST, { name: attrProperty.productName.MAIN });
  }, []);

  useEffect(() => {
    if (productKeywordTabRef.current && prevScroll) {
      productKeywordTabRef.current.scrollTo(prevScroll, 0);
    }
  }, [prevScroll]);

  return !!accessUser && (isLoading || (isFetchedProductKeywords && productKeywords.length > 0)) ? (
    <Flexbox component="section" direction="vertical" gap={20} customStyle={{ padding: '20px 0' }}>
      <Flexbox direction="vertical" gap={2} customStyle={{ padding: '0 20px' }}>
        <Typography variant="h3" weight="bold">
          {accessUser?.userName || '회원'}님의 매물목록
        </Typography>
        <Typography variant="body2">저장한 검색조건의 매물 확인하세요!</Typography>
      </Flexbox>
      <TabList ref={productKeywordTabRef} onScroll={handleTabScroll}>
        {isLoadingProductKeywords
          ? Array.from({ length: 10 }, (_, index) => (
              <Tab key={`product-tab-skeleton-${index}`} isActive={false}>
                <Flexbox direction="vertical" gap={4}>
                  <Skeleton width="130px" height="19px" disableAspectRatio isRound />
                  <Skeleton width="90px" height="15px" disableAspectRatio isRound />
                </Flexbox>
              </Tab>
            ))
          : productKeywords.map(({ id, keyword, isNew, filter }, index) => (
              <Tab
                key={`product-tab-${id}`}
                isActive={selectedIndex === index}
                onClick={handleClickTab(index)}
              >
                <Flexbox gap={4} alignment="flex-start">
                  <Keyword weight="medium" isSelected={selectedIndex === index}>
                    {keyword.replace('(P)', '')}
                  </Keyword>
                  {isNew && (
                    <Typography variant="small1" weight="bold" brandColor="primary">
                      NEW
                    </Typography>
                  )}
                </Flexbox>
                <Filter variant="small2" isSelected={selectedIndex === index}>
                  {filter}
                </Filter>
              </Tab>
            ))}
      </TabList>
      <ProductList ref={productKeywordListRef} onScroll={handleCardScroll}>
        {isLoading || isFetchingProductKeywordProducts
          ? Array.from({ length: 8 }, (_, index) => (
              <ProductGridCardSkeleton
                key={`carmel-product-curation-card-skeleton-${index}`}
                isRound
                hasAreaWithDateInfo={false}
                customStyle={{ minWidth: 144, flex: 1 }}
              />
            ))
          : productKeywordProducts.map((product, index) => (
              <ProductGridCard
                key={`product-keyword-product-card-${product.id}`}
                product={product}
                hideProductLabel
                hideAreaWithDateInfo
                hideLegitStatusLabel
                showNewLabel={selectedProductKeyword?.isNew}
                name={attrProperty.productName.MAIN}
                source={attrProperty.productSource.MAIN_MYLIST}
                wishAtt={handleWishAtt(product, index)}
                productAtt={handleProductAtt(product, index)}
                compact
                isRound
                customStyle={{ minWidth: 144, maxWidth: 144, flex: 1 }}
                onClick={handleClickProductKeywordProduct(product.id)}
              />
            ))}
      </ProductList>
      <Box customStyle={{ padding: '0 20px' }}>
        <Button
          fullWidth
          brandColor="grey"
          disabled={isLoading || productKeywords.length === 0}
          onClick={handleClickAll}
        >
          이 검색조건으로 전체보기
        </Button>
      </Box>
    </Flexbox>
  ) : null;
}

const TabList = styled.div`
  display: grid;
  grid-auto-flow: column;
  column-gap: 8px;
  padding: 0 20px;
  overflow-x: auto;
`;

const Tab = styled.div<{ isActive: boolean }>`
  padding: 8px 12px;
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.palette.primary.highlight : theme.palette.common.grey['95']};
  min-width: 200px;
  max-width: 200px;
  border-radius: 4px;
`;

const Keyword = styled(Typography)<{ isSelected: boolean }>`
  color: ${({ theme: { palette }, isSelected }) => palette.common.grey[isSelected ? '20' : '60']};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Filter = styled(Typography)<{ isSelected: boolean }>`
  color: ${({ theme: { palette }, isSelected }) => palette.common.grey[isSelected ? '20' : '60']};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const ProductList = styled.div`
  padding: 0 20px;
  display: grid;
  grid-auto-flow: column;
  column-gap: 12px;
  overflow-x: auto;
`;

export default HomeProductsKeywordList;
