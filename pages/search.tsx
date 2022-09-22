import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { useRecoilState } from 'recoil';
import { QueryClient, dehydrate, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, CtaButton, Dialog, Icon, Typography } from 'mrcamel-ui';
import find from 'lodash-es/find';
import styled from '@emotion/styled';

import { SearchBar } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  SearchBrandList,
  SearchCategoryList,
  SearchHelperBanner,
  SearchKeyword,
  SearchList,
  SearchProductsKeywordList,
  SearchRecentList
} from '@components/pages/search';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchKeywordsSuggest } from '@api/product';
import { fetchParentCategories } from '@api/category';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { SEARCH_BAR_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { calculateExpectCountPerHour } from '@utils/formats';

import type { RecentItems, TotalSearchItem } from '@typings/search';
import { searchRecentSearchListState } from '@recoil/search';
import useDebounce from '@hooks/useDebounce';

function Search() {
  const router = useRouter();
  const [savedRecentSearchList, setSavedRecentSearchList] = useRecoilState(
    searchRecentSearchListState
  );

  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchKeyword = useDebounce<string>(searchValue, 300);
  const { data: suggestKeywords = [] } = useQuery(
    queryKeys.products.keywordsSuggest(debouncedSearchKeyword),
    () => fetchKeywordsSuggest(debouncedSearchKeyword),
    {
      enabled: !!debouncedSearchKeyword,
      onSuccess: (response) => {
        logEvent(attrKeys.search.LOAD_KEYWORD_AUTO, {
          name: attrProperty.productName.SEARCH,
          keyword: searchValue,
          count: response.length
        });

        if (response.some(({ recommFilters }) => recommFilters && recommFilters.length > 0)) {
          logEvent(attrKeys.search.VIEW_RECOMMFILTER, {
            name: attrProperty.productName.SEARCHMODAL,
            keyword: searchValue
          });
        }
      }
    }
  );

  const [recentSearchList, setRecentSearchList] = useState<RecentItems[]>([]);
  const [isSearchEmpty, setIsSearchEmpty] = useState(false);
  const hasKeywordsSuggestData = searchValue.trim().length > 0 && suggestKeywords.length > 0;

  const handleTotalSearch = ({
    keyword,
    title,
    keywordItem,
    skipLogging,
    expectCount,
    count = 0,
    type
  }: TotalSearchItem) => {
    if (!find(savedRecentSearchList, { keyword })) {
      setSavedRecentSearchList((currVal) => [
        { keyword, count, expectCount: expectCount || calculateExpectCountPerHour(count) },
        ...currVal
      ]);
    }

    if (!skipLogging) {
      logEvent(attrKeys.search.SUBMIT_SEARCH, {
        name: 'SEARCH',
        title,
        type: skipLogging ? 'GUIDED' : 'INPUT',
        keyword,
        brandId: keywordItem?.brandId,
        categoryId: keywordItem?.categoryId,
        brand: keywordItem?.brandName,
        category: keywordItem?.categoryName,
        line: keywordItem?.line
      });
    }
    if (type === 'bannerb') {
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.productName.SEARCH,
        title: attrProperty.productTitle.BANNERB,
        type: attrProperty.productType.INPUT
      });
    } else if (type === 'bannerc') {
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.productName.SEARCH,
        title: attrProperty.productTitle.BANNERC,
        type: attrProperty.productType.INPUT
      });
    } else if (type === 'auto') {
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.productName.SEARCH,
        title: attrProperty.productTitle.AUTO,
        type: attrProperty.productType.INPUT
      });
    } else if (type === 'submit') {
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.productName.SEARCH,
        title: attrProperty.productTitle.SCOPE,
        type: attrProperty.productType.INPUT
      });
    }

    router
      .replace({
        pathname: '/search',
        query: { keyword: searchValue }
      })
      .then(() => router.push(`/products/search/${keyword}`));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    logEvent(attrKeys.search.CLICK_SCOPE, { name: 'SEARCH' });

    if (searchValue.trim().length === 0) {
      logEvent(attrKeys.search.NOT_KEYWORD, { att: 'NO' });
      setIsSearchEmpty(true);
      return;
    }

    handleTotalSearch({
      keyword: searchValue,
      title: 'SCOPE',
      count: (suggestKeywords[0] || {}).count || 0,
      type: 'submit'
    });
  };

  const handleClickBack = useCallback(() => {
    logEvent(attrKeys.search.CLICK_BACK, {
      name: attrProperty.productName.SEARCHMODAL
    });
    router.back();
  }, [router]);

  useEffect(() => {
    logEvent(attrKeys.search.VIEW_SEARCH_MODAL);

    if (savedRecentSearchList.length > 0) setRecentSearchList(savedRecentSearchList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { keyword } = router.query;

    if (keyword) setSearchValue(String(keyword));
  }, [router.query]);

  return (
    <>
      <GeneralTemplate disablePadding>
        <Box component="section" customStyle={{ minHeight: 56, zIndex: 1 }}>
          <SearchForm onSubmit={handleSubmit}>
            <SearchBar
              type="search"
              autoCapitalize="none"
              autoComplete="off"
              spellCheck="false"
              autoFocus
              variant="innerOutlined"
              fullWidth
              isFixed
              placeholder="샤넬 클미, 나이키 범고래, 스톤 맨투맨"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClick={() => logEvent(attrKeys.search.CLICK_KEYWORD_INPUT, { name: 'SEARCH' })}
              startIcon={<Icon name="ArrowLeftOutlined" onClick={handleClickBack} />}
            />
          </SearchForm>
        </Box>
        <Box customStyle={{ padding: `0 0 ${hasKeywordsSuggestData ? 0 : '64px'}` }}>
          {!hasKeywordsSuggestData ? (
            <>
              <SearchHelperBanner showText={!hasKeywordsSuggestData} />
              {recentSearchList.length > 0 ? (
                <SearchRecentList
                  refresh={setRecentSearchList}
                  recentSearchList={recentSearchList}
                  onClickTotalSearch={handleTotalSearch}
                />
              ) : (
                <SearchKeyword />
              )}
              <SearchProductsKeywordList />
              <SearchBrandList />
              <SearchCategoryList />
            </>
          ) : (
            <SearchList
              searchValue={searchValue}
              suggestKeywords={suggestKeywords}
              onClickTotalSearch={handleTotalSearch}
            />
          )}
        </Box>
      </GeneralTemplate>
      <Dialog
        open={isSearchEmpty}
        onClose={() => setIsSearchEmpty(false)}
        customStyle={{ textAlign: 'center' }}
      >
        <Typography weight="medium">
          <strong>앗!</strong> <br /> 검색 키워드를 입력해주세요 😭
        </Typography>
        <CtaButton
          fullWidth
          variant="contained"
          brandColor="primary"
          customStyle={{ marginTop: 20 }}
          onClick={() => setIsSearchEmpty(false)}
        >
          확인
        </CtaButton>
      </Dialog>
    </>
  );
}

export async function getStaticProps() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(queryKeys.categories.parentCategories(), fetchParentCategories);

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

const SearchForm = styled.form`
  min-height: ${SEARCH_BAR_HEIGHT}px;
`;

export default Search;
