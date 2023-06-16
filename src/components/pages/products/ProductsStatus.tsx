import { useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Box, Button, Flexbox, Icon, Input, Typography, useTheme } from '@mrcamelhub/camel-ui';

import LinearProgress from '@components/UI/molecules/LinearProgress';

import { logEvent } from '@library/amplitude';

import { fetchSearch } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { filterCodeIds, orderFilterOptions } from '@constants/productsFilter';
import { CATEGORY_TAGS_HEIGHT, HEADER_HEIGHT } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import {
  filterKeywordStateFamily,
  productsFilterProgressDoneState,
  productsFilterStateFamily,
  productsFilterTotalCountStateFamily,
  productsStatusTriggeredStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';
import useScrollTrigger from '@hooks/useScrollTrigger';
import useDebounce from '@hooks/useDebounce';

function getRandomCount(minCount: number, maxCount: number) {
  return Math.floor(Math.random() * (Math.ceil(minCount) - Math.floor(maxCount)) + minCount);
}

function ProductsStatus() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const {
    theme: {
      palette: { primary }
    }
  } = useTheme();

  const { searchParams } = useRecoilValue(searchParamsStateFamily(`search-${atomParam}`));
  const { count } = useRecoilValue(productsFilterTotalCountStateFamily(`search-${atomParam}`));
  const [progressDone, setProductsFilterProgressDoneState] = useRecoilState(
    productsFilterProgressDoneState
  );
  const setSelectedSearchOptionsState = useSetRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );

  const [{ filterKeyword }, setFilterKeywordStateFamily] = useRecoilState(
    filterKeywordStateFamily(atomParam)
  );
  const debouncedFilterKeyword = useDebounce(filterKeyword, 300);

  const setSearchParamsState = useSetRecoilState(searchParamsStateFamily(`search-${atomParam}`));
  const setSearchOptionsParamsState = useSetRecoilState(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );

  const resetFilterKeywordStateFamily = useResetRecoilState(filterKeywordStateFamily(atomParam));

  const [open, setOpen] = useState(!!filterKeyword);
  const [isFocus, setIsFocus] = useState(false);

  const setProductsOrderFilterState = useSetRecoilState(
    productsFilterStateFamily(`order-${atomParam}`)
  );
  const setProductsStatusTriggeredState = useSetRecoilState(
    productsStatusTriggeredStateFamily(atomParam)
  );

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
    setOpen(false);
    resetFilterKeywordStateFamily();
  };

  useEffect(() => {
    setProductsStatusTriggeredState(({ type }) => ({
      type,
      triggered
    }));
  }, [setProductsStatusTriggeredState, triggered]);

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
    setOpen((prevState) => (!count && !debouncedFilterKeyword ? false : prevState));
  }, [debouncedFilterKeyword, count]);

  useEffect(() => {
    setSearchParamsState(({ type, searchParams: prevSearchParams }) => ({
      type,
      searchParams: { ...prevSearchParams, title: debouncedFilterKeyword || undefined }
    }));
    setSearchOptionsParamsState(({ type, searchParams: prevSearchParams }) => ({
      type,
      searchParams: { ...prevSearchParams, title: debouncedFilterKeyword || undefined }
    }));

    if (debouncedFilterKeyword) {
      setSelectedSearchOptionsState(({ type, selectedSearchOptions }) => ({
        type,
        selectedSearchOptions: selectedSearchOptions
          .filter(({ codeId }) => codeId !== filterCodeIds.title)
          .concat({
            codeId: filterCodeIds.title,
            title: debouncedFilterKeyword,
            name: debouncedFilterKeyword
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
  }, [
    setSearchParamsState,
    setSearchOptionsParamsState,
    setSelectedSearchOptionsState,
    debouncedFilterKeyword
  ]);

  useEffect(() => {
    if (isFetched && !isFocus)
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
  }, [searchParams, isFetched, isFocus]);

  useEffect(() => {
    return () => {
      setProductsFilterProgressDoneState(false);
    };
  }, [setProductsFilterProgressDoneState]);

  return (
    <Flexbox
      ref={ref}
      direction="vertical"
      gap={4}
      customStyle={{
        position: 'relative',
        padding: '12px 20px'
      }}
    >
      <Flexbox alignment="center" justifyContent="space-between">
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
            {(count > 0 || !!debouncedFilterKeyword) && (
              <>
                <Button
                  variant="inline"
                  size="small"
                  startIcon={<Icon name="SearchOutlined" />}
                  onClick={() => setOpen(!open)}
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
        <Flexbox
          gap={12}
          alignment="center"
          customStyle={{
            padding: '8px 0'
          }}
        >
          <Input
            variant="solid"
            fullWidth
            startAdornment={<Icon name="SearchOutlined" />}
            placeholder="결과 내 재검색"
            onChange={(e) =>
              setFilterKeywordStateFamily({
                type: atomParam,
                filterKeyword: e.currentTarget.value
              })
            }
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            value={filterKeyword}
          />
          <Typography
            onClick={handleClickCancel}
            customStyle={{
              whiteSpace: 'nowrap'
            }}
          >
            취소
          </Typography>
        </Flexbox>
      )}
    </Flexbox>
  );
}

export default ProductsStatus;
