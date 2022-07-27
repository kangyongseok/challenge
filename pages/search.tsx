import { useEffect, useRef, useState } from 'react';
import type { BaseSyntheticEvent, FormEvent } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, CtaButton, Dialog, Icon, Typography, useTheme } from 'mrcamel-ui';
import { debounce, isEmpty } from 'lodash-es';
import styled from '@emotion/styled';

import SaveSearchList from '@components/UI/organisms/SaveSearchList';
import { BottomNavigation, SearchBar } from '@components/UI/molecules';
import { TouchIcon } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  SearchHelperBanner,
  SearchKeyword,
  SearchList,
  SearchRecentList
} from '@components/pages/search';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchKeywordsSuggest } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { RECENT_SEARCH_LIST } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import checkRecentListHasExpectPrice from '@utils/search/checkRecentListHasExpectPrice';
import accumulateStorage from '@utils/search/accumulateStorage';

import type { RecentItems, SelectItem, TotalSearchItem } from '@typings/search';

function Search() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const {
    theme: { palette }
  } = useTheme();

  const [searchValue, setSearchValue] = useState('');
  const [recentSearchList, setRecentSearchList] = useState<RecentItems[]>([]);
  const [isSearchEmpty, setIsSearchEmpty] = useState(false);
  const [focusedSearchBar, setFocusedSearchBar] = useState(false);

  const { data = [], refetch } = useQuery(
    ['product', searchValue],
    () => fetchKeywordsSuggest(searchValue),
    {
      enabled: false,
      onSuccess: (response) => {
        logEvent(attrKeys.search.LOAD_KEYWORD_AUTO, {
          name: 'SEARCH',
          keyword: searchValue,
          count: response.length
        });
      }
    }
  );

  const handleClearValue = () => {
    if (inputRef.current) {
      (inputRef.current.querySelector('input') as HTMLInputElement).value = '';
    }
    setSearchValue('');
  };

  const handleSearchItem = (item: SelectItem) => {
    const newItem = { ...item };
    delete newItem.keyword;

    router.push({
      pathname: `/products/search/${item.keyword}`,
      query: newItem
    });
  };

  const handleClickCategoryBanner = (item: SelectItem) => {
    const newItem = { ...item };
    delete newItem.categoryKeyword;
    delete newItem.keyword;

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.productName.SEARCH,
      title: attrProperty.productTitle.BANNERC,
      type: attrProperty.productType.INPUT
    });

    router.push({
      pathname: `/products/categories/${(item.categoryKeyword || '')
        .split('>')[1]
        .replace(/\(P\)/g, '')}`,
      query: newItem
    });
  };

  const handleChange = debounce((e: BaseSyntheticEvent) => {
    setSearchValue(e.target.value);
  }, 300);

  const handleTotalSearch = ({
    keyword,
    title,
    keywordItem,
    skipLogging,
    expectCount,
    count,
    type
  }: TotalSearchItem) => {
    const logType = skipLogging ? 'GUIDED' : 'INPUT';
    accumulateStorage(RECENT_SEARCH_LIST, {
      keyword,
      count,
      expectCount
    });
    if (!skipLogging) {
      logEvent(attrKeys.search.SUBMIT_SEARCH, {
        name: 'SEARCH',
        title,
        type: logType,
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
    const inputEl = inputRef.current?.querySelector('input') as HTMLInputElement;

    logEvent(attrKeys.search.CLICK_SCOPE, {
      name: 'SEARCH'
    });

    if (isEmpty(searchValue.trim() || inputEl.value.trim())) {
      logEvent(attrKeys.search.NOT_KEYWORD, {
        att: 'NO'
      });

      setIsSearchEmpty(true);
      return;
    }

    handleTotalSearch({
      keyword: inputEl.value,
      title: 'SCOPE',
      count: (data[0] || {}).count || 0,
      type: 'submit'
    });
  };

  const handleFocusedSearchBar = () => setFocusedSearchBar(!focusedSearchBar);

  useEffect(() => {
    logEvent(attrKeys.search.VIEW_SEARCH_MODAL);
    const list = (LocalStorage.get(RECENT_SEARCH_LIST) as object[]) || [];
    checkRecentListHasExpectPrice();
    setRecentSearchList(list as RecentItems[]);
  }, []);

  useEffect(() => {
    if (searchValue.trim()) {
      refetch();
    }
  }, [refetch, searchValue]);

  useEffect(() => {
    const { keyword } = router.query;

    if (keyword) {
      if (inputRef.current) {
        const inputEl = inputRef.current.querySelector('input') as HTMLInputElement;

        if (inputEl) {
          inputEl.value = String(keyword);
          setSearchValue(String(keyword));
        }
      }
    }
  }, [router.query]);

  return (
    <GeneralTemplate
      header={
        <form onSubmit={handleSubmit}>
          <SearchBar
            fullWidth
            autoFocus
            isBottomBorderFixed
            placeholder="샤넬 클미, 나이키 범고래, 스톤 맨투맨"
            ref={inputRef}
            onFocus={handleFocusedSearchBar}
            onBlur={handleFocusedSearchBar}
            onChange={handleChange}
            startIcon={
              <TouchIcon
                size="medium"
                direction="left"
                name="ArrowLeftOutlined"
                onClick={() => {
                  logEvent(attrKeys.search.CLICK_BACK, {
                    name: attrProperty.productName.SEARCHMODAL
                  });
                  router.back();
                }}
                customStyle={{ minWidth: 20, minHeight: 20 }}
              />
            }
            endIcon={
              <ClearIcon
                name="CloseOutlined"
                size="small"
                direction="right"
                color={palette.common.white}
                onClick={handleClearValue}
                customStyle={{ display: searchValue.trim() ? 'block' : 'none', cursor: 'pointer' }}
              />
            }
            onClick={() => {
              logEvent(attrKeys.search.CLICK_KEYWORD_INPUT, {
                name: 'SEARCH'
              });
            }}
            disabled={isSearchEmpty}
          />
        </form>
      }
      footer={
        <BottomNavigation display={searchValue.trim() || focusedSearchBar ? 'none' : 'block'} />
      }
    >
      <Box
        customStyle={{
          paddingTop: 55
        }}
      >
        {(data.length === 0 || !searchValue.trim()) && !recentSearchList.length && (
          <>
            <SearchHelperBanner showText />
            <SaveSearchList page="SEARCH" />
            <SearchKeyword onClick={handleSearchItem} />
          </>
        )}
        {searchValue.trim() && data.length > 0 && (
          <SearchList
            searchValue={searchValue}
            onClick={handleTotalSearch}
            onClickCategory={handleClickCategoryBanner}
            searchResult={data}
          />
        )}
        {!searchValue.trim() && recentSearchList.length > 0 && (
          <>
            <SearchHelperBanner showText />
            <SaveSearchList page="SEARCH" />
            <SearchRecentList
              refresh={setRecentSearchList}
              recentSearchList={recentSearchList}
              onClick={handleTotalSearch}
            />
          </>
        )}
      </Box>
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
    </GeneralTemplate>
  );
}

const ClearIcon = styled(Icon)`
  background: ${({ theme: { palette } }) => palette.common.grey['80']};
  min-width: 16px;
  height: 16px;
  border-radius: 16px;
  padding: 2px;
`;

export default Search;
