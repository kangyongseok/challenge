import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Box, Button, Flexbox, Icon, Input, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import LinearProgress from '@components/UI/molecules/LinearProgress';

import { logEvent } from '@library/amplitude';

import { fetchSearch } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { filterCodeIds, orderFilterOptions } from '@constants/productsFilter';
import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  CATEGORY_TAGS_HEIGHT,
  FILTER_HISTORY_HEIGHT,
  GENERAL_FILTER_HEIGHT,
  HEADER_HEIGHT,
  ID_FILTER_HEIGHT,
  IOS_SAFE_AREA_TOP
} from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import type { ProductsVariant } from '@typings/products';
import {
  filterHistoryOpenStateFamily,
  productsFilterProgressDoneState,
  productsFilterStateFamily,
  productsFilterTotalCountStateFamily,
  productsStatusTriggeredStateFamily,
  searchAgainInputOpenStateFamily,
  searchAgainKeywordStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';
import { showAppDownloadBannerState } from '@recoil/common';
import useScrollTrigger from '@hooks/useScrollTrigger';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';

function getRandomCount(minCount: number, maxCount: number) {
  return Math.floor(Math.random() * (Math.ceil(minCount) - Math.floor(maxCount)) + minCount);
}

interface ProductsStatusProps {
  variant: ProductsVariant;
}

function ProductsStatus({ variant }: ProductsStatusProps) {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const {
    theme: {
      palette: { primary }
    }
  } = useTheme();

  const reverseTriggered = useReverseScrollTrigger();

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const { searchParams } = useRecoilValue(searchParamsStateFamily(`search-${atomParam}`));
  const { count } = useRecoilValue(productsFilterTotalCountStateFamily(`search-${atomParam}`));
  const [progressDone, setProductsFilterProgressDoneState] = useRecoilState(
    productsFilterProgressDoneState
  );
  const setSelectedSearchOptionsState = useSetRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );

  const [{ searchAgainKeyword }, setSearchAgainKeywordStateFamily] = useRecoilState(
    searchAgainKeywordStateFamily(atomParam)
  );
  const [{ open }, setSearchAgainInputOpenStateFamily] = useRecoilState(
    searchAgainInputOpenStateFamily(atomParam)
  );
  const { open: openFilterHistory } = useRecoilValue(filterHistoryOpenStateFamily(atomParam));
  const setSearchParamsState = useSetRecoilState(searchParamsStateFamily(`search-${atomParam}`));
  const setSearchOptionsParamsState = useSetRecoilState(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const resetSearchAgainKeywordStateFamily = useResetRecoilState(
    searchAgainKeywordStateFamily(atomParam)
  );

  const setProductsOrderFilterState = useSetRecoilState(
    productsFilterStateFamily(`order-${atomParam}`)
  );
  const [{ triggered: productsStatusTriggered }, setProductsStatusTriggeredState] = useRecoilState(
    productsStatusTriggeredStateFamily(atomParam)
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const {
    data: { pages: newPages = [[0, 0, 0, 0]] } = {},
    isLoading,
    isFetched,
    isFetchedAfterMount
  } = useInfiniteQuery(
    queryKeys.products.search(searchParams),
    ({ pageParam = 0 }) =>
      fetchSearch({
        ...searchParams,
        page: pageParam
      }),
    {
      select: ({ pages = [], pageParams }) => {
        const lastPage = pages[pages.length - 1];
        if (pages[0].resultUseAI) {
          logEvent(attrKeys.products.LOAD_PRODUCT_LIST_ZAI);
        }
        const { sellerTotal = 0, productTotal = 0, productCounts = [0, 0] } = lastPage || {};
        return {
          pages: [[sellerTotal, productTotal, productCounts[0], productCounts[1]]],
          pageParams
        };
      },
      keepPreviousData: true,
      enabled: Object.keys(searchParams).length > 0,
      staleTime: 5 * 60 * 1000
    }
  );

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [fetchValue, setFetchValue] = useState(0);
  const [value, setValue] = useState(0);
  const [progressCount, setProgressCount] = useState(0);
  const [isFocus, setIsFocus] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const updatedFirstAnalysisCountRef = useRef(false);
  const updatedSecondAnalysisCountRef = useRef(false);

  const selectedOrderFilterOption = useMemo(
    () => orderFilterOptions.find(({ order }) => order === searchParams.order),
    [searchParams]
  );

  const triggered = useScrollTrigger({
    ref,
    additionalOffsetTop: -(HEADER_HEIGHT + CATEGORY_TAGS_HEIGHT)
  });

  const handleClickCancel = () => {
    setSearchAgainInputOpenStateFamily(({ type }) => ({
      type,
      open: false
    }));
    resetSearchAgainKeywordStateFamily();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    logEvent(attrKeys.products.SUBMIT_SEARCH_AGAIN, {
      keyword: searchAgainKeyword
    });

    setSearchParamsState(({ type, searchParams: prevSearchParams }) => ({
      type,
      searchParams: { ...prevSearchParams, title: searchAgainKeyword || undefined }
    }));
    setSearchOptionsParamsState(({ type, searchParams: prevSearchParams }) => ({
      type,
      searchParams: { ...prevSearchParams, title: searchAgainKeyword || undefined }
    }));

    if (searchAgainKeyword) {
      setSelectedSearchOptionsState(({ type, selectedSearchOptions }) => ({
        type,
        selectedSearchOptions: selectedSearchOptions
          .filter(({ codeId }) => codeId !== filterCodeIds.title)
          .concat({
            codeId: filterCodeIds.title,
            title: searchAgainKeyword,
            name: searchAgainKeyword
          })
      }));
    } else {
      setSelectedSearchOptionsState(({ type, selectedSearchOptions }) => ({
        type,
        selectedSearchOptions: selectedSearchOptions.filter(
          ({ codeId }) => codeId !== filterCodeIds.title
        )
      }));
    }
    if (inputRef.current) {
      inputRef.current.blur();
      setIsFocus(false);
    }
    setSearchAgainInputOpenStateFamily(({ type }) => ({
      type,
      open: false
    }));
  };

  const handleClick = () => {
    logEvent(attrKeys.products.CLICK_SEARCH_AGAIN);
    setSearchAgainInputOpenStateFamily(({ type }) => ({
      type,
      open: true
    }));
  };

  useEffect(() => {
    setProductsStatusTriggeredState(({ type }) => ({
      type,
      triggered: isFocus ? false : triggered
    }));
  }, [setProductsStatusTriggeredState, isFocus, triggered]);

  useEffect(() => {
    if (!progressDone && isLoading) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setFetchValue((prevValue) => {
          if (prevValue >= 100) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            return prevValue + Number((Math.random() * 0.5).toFixed(2));
          }
          return prevValue + Number((Math.random() * 0.5).toFixed(2));
        });
      }, 50);
    } else if (!progressDone && !isLoading && isFetched) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setValue((prevValue) => {
          if (prevValue >= 100) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            return prevValue + 1;
          }

          return prevValue < fetchValue ? prevValue + fetchValue : prevValue + 1;
        });
      }, 10);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [setProductsFilterProgressDoneState, progressDone, isFetched, isLoading, fetchValue]);

  useEffect(() => {
    if (!progressDone && value >= 1 && value < 50 && !updatedFirstAnalysisCountRef.current) {
      updatedFirstAnalysisCountRef.current = true;
      setProgressCount(getRandomCount((newPages[0][2] + newPages[0][3]) / 1.5, newPages[0][2]));
    } else if (!progressDone && value >= 50 && !updatedSecondAnalysisCountRef.current) {
      updatedSecondAnalysisCountRef.current = true;
      setProgressCount(Math.floor((newPages[0][3] + progressCount) / 2));
    }
  }, [value, newPages, progressCount, progressDone]);

  useEffect(() => {
    if (value > 100) setProductsFilterProgressDoneState(true);
  }, [setProductsFilterProgressDoneState, value]);

  useEffect(() => {
    if (isFetchedAfterMount && !newPages[0][1]) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setValue(101);
    }
  }, [isFetchedAfterMount, newPages]);

  useEffect(() => {
    if (!isFocus) {
      setSearchAgainInputOpenStateFamily(({ type }) => ({
        type,
        open: false
      }));
      resetSearchAgainKeywordStateFamily();
    }
  }, [setSearchAgainInputOpenStateFamily, resetSearchAgainKeywordStateFamily, isFocus]);

  useEffect(() => {
    return () => {
      setProductsFilterProgressDoneState(false);
    };
  }, [setProductsFilterProgressDoneState]);

  return (
    <>
      <Flexbox
        ref={ref}
        component="section"
        alignment="center"
        justifyContent="space-between"
        customStyle={{
          position: 'relative',
          padding: open ? 0 : '12px 20px',
          height: open ? 0 : 53,
          overflow: 'hidden'
        }}
      >
        {!progressDone && (
          <LinearProgress
            value={value || fetchValue}
            customStyle={{ position: 'absolute', top: 0, left: 0 }}
          />
        )}
        {!progressDone && (
          <Typography
            variant="body2"
            weight="medium"
            customStyle={{ '& > b': { color: primary.main, weight: 700 } }}
          >
            {value === 0 && '매물 검색 중...'}
            {value >= 1 && <b>{`${Math.floor(value)}%`}</b>}&nbsp;
            {value >= 1 && value < 50 && (
              <>
                <strong>{newPages[0][0].toLocaleString()}</strong>개 플랫폼에서 수집 중...&nbsp;
                <strong>{progressCount.toLocaleString()}</strong>개
              </>
            )}
            {value >= 50 && (
              <>
                상태, 가격, 판매자 신용도 분석 중...{' '}
                <strong>{progressCount.toLocaleString()}</strong>개
              </>
            )}
          </Typography>
        )}
        {progressDone && (
          <Typography weight="medium">전체 {newPages[0][1].toLocaleString()}개</Typography>
        )}
        {progressDone && (
          <Flexbox gap={12} alignment="center">
            {(count > 0 || !!searchAgainKeyword) && (
              <>
                <Button
                  variant="inline"
                  size="small"
                  startIcon={<Icon name="SearchOutlined" />}
                  onClick={handleClick}
                  customStyle={{
                    paddingLeft: 0,
                    paddingRight: 0,
                    fontWeight: 400
                  }}
                >
                  결과 내 재검색
                </Button>
                <Box
                  customStyle={{
                    width: 1,
                    height: 16,
                    backgroundColor: common.line01
                  }}
                />
              </>
            )}
            <Flexbox
              alignment="center"
              gap={4}
              onClick={() =>
                setProductsOrderFilterState(({ type }) => ({
                  type,
                  open: true
                }))
              }
              customStyle={{ cursor: 'pointer' }}
            >
              <Typography variant="body2">{(selectedOrderFilterOption || {}).viewName}</Typography>
              <Icon name="DropdownFilled" viewBox="0 0 12 24" width={8} height={16} />
            </Flexbox>
          </Flexbox>
        )}
      </Flexbox>
      {progressDone && open && (
        <SearchAgainInputBox
          variant={variant}
          showAppDownloadBanner={showAppDownloadBanner}
          triggered={reverseTriggered}
          productsStatusTriggered={productsStatusTriggered}
          openFilterHistory={openFilterHistory}
        >
          <Form action="search" onSubmit={handleSubmit}>
            <Input
              ref={inputRef}
              type="search"
              autoFocus
              variant="solid"
              fullWidth
              startAdornment={<Icon name="SearchOutlined" />}
              placeholder="결과 내 재검색"
              onChange={(e) =>
                setSearchAgainKeywordStateFamily({
                  type: atomParam,
                  searchAgainKeyword: e.currentTarget.value
                })
              }
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              value={searchAgainKeyword}
            />
          </Form>
          <Typography
            onClick={handleClickCancel}
            customStyle={{
              whiteSpace: 'nowrap'
            }}
          >
            취소
          </Typography>
        </SearchAgainInputBox>
      )}
    </>
  );
}

const SearchAgainInputBox = styled.section<{
  variant?: ProductsVariant;
  showAppDownloadBanner: boolean;
  triggered: boolean;
  productsStatusTriggered: boolean;
  openFilterHistory: boolean;
}>`
  position: sticky;
  ${({ productsStatusTriggered }): CSSObject =>
    productsStatusTriggered
      ? {
          opacity: 0
        }
      : {}};

  top: ${({ variant, showAppDownloadBanner, openFilterHistory }) => {
    if (variant === 'search' && !openFilterHistory) {
      return `calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + ${
        showAppDownloadBanner
          ? HEADER_HEIGHT + APP_DOWNLOAD_BANNER_HEIGHT + ID_FILTER_HEIGHT + GENERAL_FILTER_HEIGHT
          : HEADER_HEIGHT + ID_FILTER_HEIGHT + GENERAL_FILTER_HEIGHT
      }px)`;
    }

    if (variant === 'search' && openFilterHistory) {
      return `calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + ${
        showAppDownloadBanner
          ? HEADER_HEIGHT +
            APP_DOWNLOAD_BANNER_HEIGHT +
            ID_FILTER_HEIGHT +
            GENERAL_FILTER_HEIGHT +
            FILTER_HISTORY_HEIGHT
          : HEADER_HEIGHT + ID_FILTER_HEIGHT + GENERAL_FILTER_HEIGHT + FILTER_HISTORY_HEIGHT
      }px)`;
    }

    if (openFilterHistory) {
      return `calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + ${
        showAppDownloadBanner
          ? APP_DOWNLOAD_BANNER_HEIGHT +
            HEADER_HEIGHT +
            CATEGORY_TAGS_HEIGHT +
            ID_FILTER_HEIGHT +
            GENERAL_FILTER_HEIGHT +
            FILTER_HISTORY_HEIGHT
          : HEADER_HEIGHT +
            CATEGORY_TAGS_HEIGHT +
            ID_FILTER_HEIGHT +
            GENERAL_FILTER_HEIGHT +
            FILTER_HISTORY_HEIGHT
      }px)`;
    }

    return `calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + ${
      showAppDownloadBanner
        ? APP_DOWNLOAD_BANNER_HEIGHT +
          HEADER_HEIGHT +
          CATEGORY_TAGS_HEIGHT +
          ID_FILTER_HEIGHT +
          GENERAL_FILTER_HEIGHT
        : HEADER_HEIGHT + CATEGORY_TAGS_HEIGHT + ID_FILTER_HEIGHT + GENERAL_FILTER_HEIGHT
    }px)`;
  }};

  ${({ triggered, productsStatusTriggered }): CSSObject => {
    if (!triggered && productsStatusTriggered) {
      return {
        transform: 'translateY(-30px)',
        opacity: 0,
        pointerEvents: 'none'
      };
    }
    if (triggered && productsStatusTriggered) {
      return {
        opacity: 1
      };
    }
    return {};
  }};

  display: flex;
  align-items: center;
  padding: 8px 20px 12px;
  gap: 12px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};

  z-index: ${({ theme: { zIndex } }) => zIndex.header - 1};
  transition: top 0.5s, opacity 0.2s, transform 0.2s;
`;

const Form = styled.form`
  flex-grow: 1;
`;

export default ProductsStatus;
