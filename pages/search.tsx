import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import find from 'lodash-es/find';
import dayjs from 'dayjs';
import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import { Box, Button, Dialog, Icon, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { SearchBar } from '@components/UI/molecules';
import PageHead from '@components/UI/atoms/PageHead';
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

import UserTraceRecord from '@library/userTraceRecord';
import updateAccessUserOnBraze from '@library/updateAccessUserOnBraze';
import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchKeywordsSuggest } from '@api/product';
import { fetchParentCategories } from '@api/category';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { SEARCH_TIME_FOR_EXIT_BOTTOM_SHEET } from '@constants/localStorage';
import { IOS_SAFE_AREA_TOP, SEARCH_BAR_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { calculateExpectCountPerHour } from '@utils/formats';
import { isExtendedLayoutIOSVersion } from '@utils/common';

import type { RecentItems, TotalSearchItem } from '@typings/search';
import { searchRecentSearchListState } from '@recoil/search';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useDebounce from '@hooks/useDebounce';

function Search() {
  const router = useRouter();
  const [savedRecentSearchList, setSavedRecentSearchList] = useRecoilState(
    searchRecentSearchListState
  );

  const [searchValue, setSearchValue] = useState('');

  const { data: accessUser } = useQueryAccessUser();

  const debouncedSearchKeyword = useDebounce<string>(searchValue.replace(/-/g, ' '), 300);
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
    if (accessUser) {
      updateAccessUserOnBraze({ ...accessUser, lastKeyword: keyword });
    }

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

    if (searchValue) {
      router
        .replace({
          pathname: '/search',
          query: { keyword: searchValue }
        })
        .then(() =>
          setTimeout(() => {
            router.push(`/products/search/${keyword}`);
          }, 300)
        );
    } else {
      router.push(`/products/search/${keyword}`);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    logEvent(attrKeys.search.CLICK_SCOPE, { name: 'SEARCH' });

    if (searchValue.trim().length === 0) {
      logEvent(attrKeys.search.NOT_KEYWORD, { att: 'NO' });
      setIsSearchEmpty(true);
      return;
    }

    handleClickSaveTime();

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

  const handleClickSaveTime = () => {
    LocalStorage.set(SEARCH_TIME_FOR_EXIT_BOTTOM_SHEET, dayjs());
  };

  useEffect(() => {
    logEvent(attrKeys.search.VIEW_SEARCH_MODAL);
    UserTraceRecord.increasePageViewCount('exitSearch');
    if (savedRecentSearchList.length > 0) setRecentSearchList(savedRecentSearchList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { keyword } = router.query;

    if (keyword) setSearchValue(String(keyword));
  }, [router.query]);

  return (
    <>
      <PageHead
        title="검색만 하면 전국에서 중고명품 모아드릴게요 | 카멜"
        description="중고명품, 이앱 저앱 모두 검색해보지 말고 카멜에서 바로 한번에 검색해보세요!"
        ogTitle="검색만 하면 전국에서 중고명품 모아드릴게요 | 카멜"
        ogDescription="중고명품, 이앱 저앱 모두 검색해보지 말고 카멜에서 바로 한번에 검색해보세요!"
        ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/seo/main.webp`}
      />
      <GeneralTemplate disablePadding>
        <SearchForm action="" onSubmit={handleSubmit}>
          <SearchBar
            type="search"
            autoCapitalize="none"
            autoComplete="off"
            spellCheck="false"
            autoFocus
            variant="innerOutlined"
            fullWidth
            isFixed
            placeholder="어떤 명품을 득템해 볼까요?"
            value={searchValue.replace(/-/g, ' ')}
            onChange={(e) => setSearchValue(e.target.value)}
            onClick={() => logEvent(attrKeys.search.CLICK_KEYWORD_INPUT, { name: 'SEARCH' })}
            startIcon={<Icon name="ArrowLeftOutlined" onClick={handleClickBack} />}
          />
        </SearchForm>
        <Box customStyle={{ padding: `0 0 ${hasKeywordsSuggestData ? 0 : '64px'}` }}>
          {!hasKeywordsSuggestData ? (
            <>
              <SearchHelperBanner showText={!hasKeywordsSuggestData} />
              {recentSearchList.length > 0 ? (
                <SearchRecentList
                  refresh={setRecentSearchList}
                  recentSearchList={recentSearchList}
                  onClickTotalSearch={handleTotalSearch}
                  handleClickSaveTime={handleClickSaveTime}
                />
              ) : (
                <SearchKeyword handleClickSaveTime={handleClickSaveTime} />
              )}
              <SearchProductsKeywordList handleClickSaveTime={handleClickSaveTime} />
              <SearchBrandList handleClickSaveTime={handleClickSaveTime} />
              <SearchCategoryList handleClickSaveTime={handleClickSaveTime} />
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
        <Button
          fullWidth
          variant="solid"
          brandColor="primary"
          customStyle={{ marginTop: 20 }}
          onClick={() => setIsSearchEmpty(false)}
        >
          확인
        </Button>
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
  min-height: calc(
    ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + ${SEARCH_BAR_HEIGHT}px
  );
`;

export default Search;
