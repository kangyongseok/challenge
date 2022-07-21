import { useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useInfiniteQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

import LinearProgress from '@components/UI/molecules/LinearProgress';

import { fetchSearch } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { orderFilterOptions } from '@constants/productsFilter';

import {
  productsFilterProgressDoneState,
  productsFilterStateFamily,
  searchParamsStateFamily
} from '@recoil/productsFilter';

function getRandomCount(minCount: number, maxCount: number) {
  return Math.floor(Math.random() * (Math.ceil(minCount) - Math.floor(maxCount)) + minCount);
}

function ProductsStatus() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const { searchParams } = useRecoilValue(searchParamsStateFamily(`search-${atomParam}`));
  const [progressDone, setProductsFilterProgressDoneState] = useRecoilState(
    productsFilterProgressDoneState
  );
  const setProductsOrderFilterState = useSetRecoilState(
    productsFilterStateFamily(`order-${atomParam}`)
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

  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const updatedFirstAnalysisCountRef = useRef(false);
  const updatedSecondAnalysisCountRef = useRef(false);

  const selectedOrderFilterOption = useMemo(
    () => orderFilterOptions.find(({ order }) => order === searchParams.order),
    [searchParams]
  );

  useEffect(() => {
    router.beforePopState(({ url }) => {
      if (url.indexOf('/products') > -1) {
        setProductsFilterProgressDoneState(true);
      }
      return true;
    });
  }, [router, setProductsFilterProgressDoneState]);

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
    return () => {
      setProductsFilterProgressDoneState(false);
    };
  }, [setProductsFilterProgressDoneState]);

  return (
    <Flexbox
      justifyContent="space-between"
      customStyle={{
        position: 'relative',
        padding: '16px 20px'
      }}
    >
      {!progressDone && (
        <LinearProgress
          value={value || fetchValue}
          customStyle={{ position: 'absolute', top: 0, left: 0 }}
        />
      )}
      {!progressDone && (
        <Typography variant="body2" weight="medium">
          {value === 0 && '매물 검색 중...'}
          {value >= 1 && `${Math.floor(value)}%`}&nbsp;
          {value >= 1 && value < 50 && (
            <>
              <strong>{newPages[0][0].toLocaleString()}</strong>개 플랫폼에서 수집 중...&nbsp;
              <strong>{progressCount.toLocaleString()}</strong>개
            </>
          )}
          {value >= 50 && (
            <>
              상태, 가격, 판매자 신용도 분석 중... <strong>{progressCount.toLocaleString()}</strong>
              개
            </>
          )}
        </Typography>
      )}
      {progressDone && (
        <Typography variant="body2" weight="medium">
          전체 <strong>{newPages[0][1].toLocaleString()}</strong>개
        </Typography>
      )}
      {progressDone && (
        <Flexbox
          alignment="center"
          gap={2}
          customStyle={{ cursor: 'pointer' }}
          onClick={() =>
            setProductsOrderFilterState(({ type }) => ({
              type,
              open: true
            }))
          }
        >
          <Typography variant="body2" weight="medium">
            {(selectedOrderFilterOption || {}).viewName}
          </Typography>
          <Icon name="CaretDownOutlined" width={12} height={12} color={common.grey['40']} />
        </Flexbox>
      )}
    </Flexbox>
  );
}

export default ProductsStatus;
