import { useCallback, useEffect, useRef, useState } from 'react';
import type { UIEvent } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Typography } from 'mrcamel-ui';
import throttle from 'lodash-es/throttle';
import has from 'lodash-es/has';
import debounce from 'lodash-es/debounce';
import styled from '@emotion/styled';

import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';
import { Skeleton } from '@components/UI/atoms';

import type { Product, SearchParams } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchSearch } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { RecentItems } from '@typings/search';
import { searchRecentSearchListState } from '@recoil/search';
import { homeSelectedTabStateFamily } from '@recoil/home';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function HomeRecentSearchList() {
  const router = useRouter();
  const [{ selectedIndex, prevScroll }, setSelectedTabState] = useRecoilState(
    homeSelectedTabStateFamily('recentSearch')
  );
  const savedRecentSearchList = useRecoilValue(searchRecentSearchListState);

  const { data: accessUser } = useQueryAccessUser();
  const [searchParams, setSearchParams] = useState<SearchParams>({ logging: false });
  const {
    isLoading,
    isFetching,
    data: { page: { content = [] } = {} } = {}
  } = useQuery(queryKeys.products.search(searchParams), () => fetchSearch(searchParams), {
    enabled: !!searchParams?.keyword?.length,
    onSettled() {
      if (recentSearchListRef.current?.scrollLeft !== 0) {
        recentSearchListRef.current?.scrollTo(0, 0);
      }
    }
  });

  const [recentSearchList, setrecentSearchList] = useState<RecentItems[]>([]);
  const recentSearchTabRef = useRef<HTMLDivElement | null>(null);
  const recentSearchListRef = useRef<HTMLDivElement | null>(null);
  const throttleScrollRecentSearch = useRef(
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
  const debounceScrollRecentSearch = useRef(
    debounce(() => {
      logEvent(attrKeys.home.SWIPE_X_BUTTON, {
        name: attrProperty.productName.MAIN,
        title: attrProperty.productTitle.RECENT
      });
    }, 500)
  ).current;

  const handleTabScroll = (e: UIEvent<HTMLDivElement>) => {
    throttleScrollRecentSearch.current(e);
    debounceScrollRecentSearch();
  };

  const handleClickTab = useCallback(
    (keyword: string, index: number) => () => {
      logEvent(attrKeys.home.CLICK_RECENT_BUTTON, { name: attrProperty.productName.MAIN });

      recentSearchListRef.current?.scrollTo(0, 0);

      if (selectedIndex !== index) {
        setSelectedTabState((currVal) => ({ ...currVal, selectedIndex: index }));
        setSearchParams((prevState) => ({ ...prevState, keyword }));
      }
    },
    [selectedIndex, setSelectedTabState]
  );

  const handleCardScroll = debounce(() => {
    logEvent(attrKeys.home.SWIP_X_CARD, {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.RECENT
    });
  }, 500);

  const handleWishAtt = (product: Product, i: number) => {
    return {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.RECENT,
      id: product.id,
      index: i + 1,
      brand: product.brand.name,
      category: product.category.name,
      parentId: product.category.parentId,
      line: product.line,
      site: product.site.name,
      price: product.price,
      scoreTotal: product.scoreTotal,
      cluster: product.cluster,
      source: attrProperty.productSource.MAIN_RECENT_LIST
    };
  };

  const handleClickProductKeywordProduct = useCallback(
    (product: Product, index: number) => () => {
      logEvent(attrKeys.wishes.CLICK_PRODUCT_DETAIL, {
        name: attrProperty.productName.MAIN,
        title: attrProperty.productTitle.RECENT,
        index: index + 1,
        id: product.id,
        brand: product.brand.name,
        category: product.category.name,
        parentCategory: FIRST_CATEGORIES[product.category.parentId as number],
        site: product.site.name,
        price: product.price
      });
      router.push(`/products/${product.id}`);
    },
    [router]
  );

  const handleClickAll = useCallback(() => {
    if (isLoading || !searchParams?.keyword?.length) return;

    logEvent(attrKeys.home.CLICK_RECENT_BUTTON, {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.RECENT
    });
    router.push(`/products/search/${searchParams.keyword}`);
  }, [isLoading, router, searchParams.keyword]);

  useEffect(() => {
    if (savedRecentSearchList.length > 0) {
      setrecentSearchList(savedRecentSearchList);
      setSearchParams((prevState) => ({
        ...prevState,
        keyword: savedRecentSearchList[0].keyword ?? ''
      }));
    } else {
      setSearchParams((prevState) => ({ ...prevState, keyword: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (recentSearchTabRef.current && prevScroll) {
      recentSearchTabRef.current.scrollTo(prevScroll, 0);
    }
  }, [prevScroll]);

  return !has(searchParams, 'keyword') || recentSearchList.length > 0 ? (
    <Box component="section" customStyle={{ display: 'grid', gap: 20, padding: '20px 0' }}>
      <Typography variant="h3" weight="bold" customStyle={{ padding: '0 20px' }}>
        {accessUser?.userName || '회원'}님의 검색목록
      </Typography>
      <TabList ref={recentSearchTabRef} onScroll={handleTabScroll}>
        {!has(searchParams, 'keyword')
          ? Array.from({ length: 10 }, (_, index) => (
              <Tab key={`product-tab-skeleton-${index}`} isActive={false}>
                <Skeleton width="130px" height="19px" disableAspectRatio isRound />
              </Tab>
            ))
          : recentSearchList.map(({ keyword }, index) => (
              <Tab
                key={`recent-search-tab-${keyword}`}
                isActive={selectedIndex === index}
                onClick={handleClickTab(keyword, index)}
              >
                <Keyword
                  weight="medium"
                  isSelected={selectedIndex === index}
                  dangerouslySetInnerHTML={{ __html: keyword || '' }}
                />
              </Tab>
            ))}
      </TabList>
      <ProductList ref={recentSearchListRef} onScroll={handleCardScroll}>
        {!has(searchParams, 'keyword') || isLoading || isFetching ? (
          Array.from({ length: 8 }, (_, index) => (
            <ProductGridCardSkeleton
              key={`carmel-product-curation-card-skeleton-${index}`}
              isRound
              hasAreaWithDateInfo={false}
              customStyle={{ minWidth: 144, flex: 1 }}
            />
          ))
        ) : (
          <>
            {content.map((product, i) => (
              <ProductGridCard
                key={`product-keyword-product-card-${product.id}`}
                product={product}
                hideProductLabel
                hideAreaWithDateInfo
                hideLegitStatusLabel
                wishAtt={handleWishAtt(product, i)}
                name={attrProperty.productName.MAIN}
                source={attrProperty.productSource.MAIN_RECENT_LIST}
                compact
                isRound
                customStyle={{ minWidth: 144, maxWidth: 144, flex: 1 }}
                onClick={handleClickProductKeywordProduct(product, i)}
              />
            ))}
          </>
        )}
      </ProductList>
      <Box customStyle={{ padding: '0 20px' }}>
        <Button
          fullWidth
          brandColor="grey"
          disabled={isLoading || !has(searchParams, 'keyword')}
          onClick={handleClickAll}
        >
          이 검색 전체보기
        </Button>
      </Box>
    </Box>
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
  padding: 12px;
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

const ProductList = styled.div`
  padding: 0 20px;
  display: grid;
  grid-auto-flow: column;
  column-gap: 12px;
  overflow-x: auto;
`;

export default HomeRecentSearchList;
