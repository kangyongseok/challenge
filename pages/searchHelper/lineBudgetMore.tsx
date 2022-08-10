import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Label, Typography, useTheme } from 'mrcamel-ui';
import omitBy from 'lodash-es/omitBy';
import isEmpty from 'lodash-es/isEmpty';
import debounce from 'lodash-es/debounce';
import styled from '@emotion/styled';

import { Divider } from '@components/UI/molecules';
import {
  SearchHelperFixedBottomCTAButton,
  SearchHelperInput,
  SearchHelperLinearProgress,
  SearchHelperMoreOptionBottomSheet,
  SearchHelperMultiOptionBottomSheet
} from '@components/pages/searchHelper';

import { logEvent } from '@library/amplitude';

import { fetchSearch } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/common';

import {
  allSelectedSearchOptionsSelector,
  searchParamsState,
  selectedSearchOptionsState
} from '@recoil/searchHelper';

function LineBudgetMore() {
  const router = useRouter();
  const {
    theme: { palette }
  } = useTheme();
  const [searchParams, setSearchParams] = useRecoilState(searchParamsState);
  const [selectedSearchOptions, setSelectedSearchOptions] = useRecoilState(
    selectedSearchOptionsState
  );
  const { brandLabel, categoryLabel, sizeLabel, maxPriceLabel } = useRecoilValue(
    allSelectedSearchOptionsSelector
  );
  const { isLoading, data } = useQuery(
    queryKeys.products.search(searchParams),
    () => fetchSearch(searchParams),
    {
      enabled:
        !!searchParams.brandIds?.length &&
        !!searchParams.genderIds &&
        !!searchParams.parentIds?.length
    }
  );

  const [historyLabels, setHistoryLabels] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [productTotal, setProductTotal] = useState(0);
  const [focusedBudget, setFocusedBudget] = useState(false);
  const [openBottomSheet, setOpenBottomSheet] = useState<'line' | 'more' | null>(null);
  const budgetRef = useRef<HTMLInputElement>(null);
  const debounceBudget = useRef(
    debounce((newMinPrice: number, newMaxPrice: number) => {
      setSearchParams(({ minPrice: _prevMinPrice, maxPrice: _maxPrice, ...currVal }) =>
        newMaxPrice === 0
          ? currVal
          : {
              ...currVal,
              minPrice: newMinPrice * 10000,
              maxPrice: newMaxPrice * 10000
            }
      );
    }, 500)
  ).current;

  const lineData = useMemo(
    () =>
      data?.searchOptions.lines
        .filter(({ count }) => count > 0)
        .map(({ id, name, count }) => ({ id, name, count })),
    [data?.searchOptions.lines]
  );

  const isBudgetLow = Number(budget) < minPrice;
  const progress =
    51 +
    (Number(!!selectedSearchOptions?.lines?.length) +
      Number(budget.length > 0 && !isBudgetLow) +
      Number(
        !!(
          selectedSearchOptions?.platforms?.length ||
          selectedSearchOptions?.colors?.length ||
          selectedSearchOptions?.seasons?.length ||
          selectedSearchOptions?.materials?.length
        )
      )) *
      16;
  const moreValue =
    [
      ...(selectedSearchOptions?.platforms?.map(({ name }) => name) || []),
      ...(selectedSearchOptions?.colors?.map(({ name }) => name) || []),
      ...(selectedSearchOptions?.seasons?.map(({ name }) => name) || []),
      ...(selectedSearchOptions?.materials?.map(({ name }) => name) || [])
    ]
      .filter((item) => !!item)
      .join(', ') || '';

  const handleOpenLineBottomSheet = useCallback(() => {
    if (searchParams.lineIds?.length)
      setSearchParams(({ lineIds: _lineIds, ...currVal }) => currVal);

    setOpenBottomSheet('line');
  }, [searchParams.lineIds?.length, setSearchParams]);

  const handleCloseLine = useCallback(() => {
    setOpenBottomSheet(null);
    setSearchParams(({ lineIds: _lineIds, ...currVal }) => ({
      ...currVal,
      ...omitBy({ lineIds: selectedSearchOptions?.lines?.map(({ id }) => id) }, isEmpty)
    }));
  }, [selectedSearchOptions?.lines, setSearchParams]);

  const handleSelectLine = useCallback(
    (selectedOptions: { id: number; name: string }[]) => {
      if (selectedOptions.length > 0) {
        logEvent(attrKeys.searchHelper.SELECT_ITEM, {
          name: 'SEARCHHELPER',
          title: 'LINE',
          att: selectedOptions.map(({ name }) => name).join(', ')
        });
      }

      setOpenBottomSheet(null);
      setSelectedSearchOptions((currVal) => ({ ...currVal, lines: selectedOptions }));
      setSearchParams((currVal) => ({
        ...currVal,
        ...omitBy({ lineIds: selectedOptions.map(({ id }) => id) }, isEmpty)
      }));
    },
    [setSearchParams, setSelectedSearchOptions]
  );

  const handleChangeBudget = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9]/g, '').substring(0, 5);

    setBudget(newValue);

    if (Number(newValue) >= minPrice) {
      debounceBudget(minPrice, Number(newValue));
    }
  };

  const handleBlurBudget = () => {
    setTimeout(() => {
      setSearchParams(({ minPrice: _prevMinPrice, maxPrice, ...currVal }) =>
        Number(budget) > 0 && maxPrice !== Number(budget)
          ? { ...currVal, minPrice: minPrice * 10000, maxPrice: Number(budget) * 10000 }
          : currVal
      );
      setSelectedSearchOptions(({ minPrice: _prevMinPrice, maxPrice: _maxPrice, ...currVal }) =>
        Number(budget) > 0 ? { ...currVal, minPrice, maxPrice: Number(budget) } : currVal
      );

      setFocusedBudget(false);
    }, 100);
  };

  const handleClearBudget = useCallback(() => {
    setBudget('');
    setSearchParams(({ minPrice: _prevMinPrice, maxPrice: _maxPrice, ...currVal }) => ({
      ...currVal
    }));
    budgetRef.current?.focus();
  }, [setSearchParams]);

  const handleOpenMoreBottomSheet = useCallback(() => {
    setSearchParams(({ siteUrlIds: _siteUrlIds, ...currVal }) => currVal);
    setOpenBottomSheet('more');
  }, [setSearchParams]);

  const handleClickNext = useCallback(() => {
    if (progress === 51 && (budget.length === 0 || (budget.length > 0 && !isBudgetLow))) {
      logEvent(attrKeys.searchHelper.CLICK_SEARCHHELPER, { name: 'STEP2', att: 'SKIP' });
    } else {
      logEvent(attrKeys.searchHelper.SELECT_SEARCHHELPER, {
        name: 'STEP2',
        att: [
          selectedSearchOptions?.lines ? selectedSearchOptions?.lines.map(({ name }) => name) : [],
          maxPriceLabel,
          selectedSearchOptions?.platforms
            ? selectedSearchOptions?.platforms.map(({ name }) => name)
            : [],
          selectedSearchOptions?.colors
            ? selectedSearchOptions?.colors.map(({ name }) => name)
            : [],
          selectedSearchOptions?.seasons
            ? selectedSearchOptions?.seasons.map(({ name }) => name)
            : [],
          selectedSearchOptions?.materials
            ? selectedSearchOptions?.materials.map(({ name }) => name)
            : []
        ]
          .filter((label) => label.length > 0)
          .join(', ')
      });
    }

    setTimeout(() => router.replace('/searchHelper/allOptions'), 300);
  }, [
    budget.length,
    isBudgetLow,
    maxPriceLabel,
    progress,
    router,
    selectedSearchOptions?.colors,
    selectedSearchOptions?.lines,
    selectedSearchOptions?.materials,
    selectedSearchOptions?.platforms,
    selectedSearchOptions?.seasons
  ]);

  useEffect(() => {
    logEvent(attrKeys.searchHelper.VIEW_SEARCHHELPER_STEP2);
    setHistoryLabels([brandLabel, categoryLabel, sizeLabel].filter((item) => item));
    setProductTotal(data?.productTotal || 0);

    if (selectedSearchOptions.maxPrice) {
      setBudget(`${selectedSearchOptions.maxPrice}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      !openBottomSheet &&
      data?.searchOptions.minPrice &&
      data.searchOptions.minPrice / 10000 !== minPrice
    ) {
      setMinPrice(data.searchOptions.minPrice / 10000);
    }
  }, [data?.searchOptions.minPrice, minPrice, openBottomSheet]);

  useEffect(() => {
    if (!openBottomSheet) {
      setProductTotal(data?.productTotal || 0);
    }
  }, [data?.productTotal, openBottomSheet]);

  useEffect(() => {
    if (!focusedBudget && budget.length > 0 && !isBudgetLow) {
      logEvent(attrKeys.searchHelper.SELECT_ITEM, {
        name: attrProperty.productName.SEARCHHELPER,
        title: attrProperty.productTitle.MONEY,
        att: budget
      });
    }
  }, [budget, focusedBudget, isBudgetLow]);

  return (
    <>
      <SearchHelperLinearProgress
        value={progress}
        showInfoText={
          !!searchParams.brandIds?.length ||
          !!searchParams.parentIds?.length ||
          !!searchParams.categorySizeIds?.length
        }
        productTotal={productTotal}
      />
      <Box customStyle={{ padding: '0 20px' }}>
        <Flexbox gap={8} customStyle={{ marginTop: 40, flexWrap: 'wrap' }}>
          {historyLabels.map((item) => (
            <Label key={item} text={item} variant="ghost" brandColor="primary" size="small" />
          ))}
        </Flexbox>
        <Typography variant="h2" weight="bold" customStyle={{ padding: '16px 0 32px' }}>
          꿀매물까지 거의 다 왔어요!
        </Typography>
        <CustomBox>
          <SearchHelperInput
            labelText="라인 (선택)"
            value={selectedSearchOptions.lines?.map(({ name }) => name).join(', ') || ''}
            placeholder="찾으시는 라인이 있나요? (선택)"
            onClick={handleOpenLineBottomSheet}
            showCheckIcon={!!selectedSearchOptions?.lines?.length}
            readOnly
          />
          <CustomDivider />
          <SearchHelperInput
            ref={budgetRef}
            labelText="예산 (선택)"
            inputMode="numeric"
            placeholder={focusedBudget ? '만원' : '얼마까지 생각하세요? (선택)'}
            errorMessage={
              budget.length > 0 && isBudgetLow ? (
                <Typography
                  variant="body2"
                  weight="medium"
                  customStyle={{
                    color: palette.secondary.red.main,
                    position: 'absolute',
                    right: 44
                  }}
                >
                  {commaNumber(minPrice + 1)}만원부터 매물이 있어요
                </Typography>
              ) : undefined
            }
            showSuffix={budget.length > 0}
            showClearIcon={focusedBudget && !(budget.length > 0 && isBudgetLow)}
            showCheckIcon={budget.length > 0 && !isBudgetLow}
            value={budget}
            onChange={handleChangeBudget}
            onFocus={() => setFocusedBudget(true)}
            onBlur={handleBlurBudget}
            onClear={handleClearBudget}
          />
          <CustomDivider />
          <SearchHelperInput
            labelText="추가할 조건 (선택)"
            placeholder="더 추가할 조건은요? (선택)"
            value={moreValue}
            readOnly
            showCheckIcon={
              !!(
                selectedSearchOptions?.platforms?.length ||
                selectedSearchOptions?.colors?.length ||
                selectedSearchOptions?.seasons?.length ||
                selectedSearchOptions?.materials?.length
              )
            }
            onClick={handleOpenMoreBottomSheet}
          />
        </CustomBox>
      </Box>
      <SearchHelperFixedBottomCTAButton
        showEnableSkip={
          progress === 51 && (budget.length === 0 || (budget.length > 0 && !isBudgetLow))
        }
        showEnableNext={
          progress > 51 &&
          (budget.length === 0 ||
            (budget.length > 0 && !isBudgetLow) ||
            !(
              selectedSearchOptions?.platforms?.length ||
              selectedSearchOptions?.colors?.length ||
              selectedSearchOptions?.seasons?.length ||
              selectedSearchOptions?.materials?.length
            ))
        }
        disabled={
          (!isLoading && !focusedBudget && productTotal === 0) || (budget.length > 0 && isBudgetLow)
        }
        onClickNext={handleClickNext}
      />
      <SearchHelperMultiOptionBottomSheet
        isLoading={isLoading}
        title="라인"
        data={lineData}
        open={openBottomSheet === 'line'}
        onClose={handleCloseLine}
        onSelect={handleSelectLine}
        needClearOptions={!!selectedSearchOptions.lines?.length}
      />
      <SearchHelperMoreOptionBottomSheet
        isLoading={isLoading}
        open={openBottomSheet === 'more'}
        onClose={() => setOpenBottomSheet(null)}
        searchOptions={data?.searchOptions}
      />
    </>
  );
}

const CustomBox = styled.div`
  border: 2px solid ${({ theme }) => theme.palette.common.grey['90']};
  border-radius: ${({ theme }) => theme.box.round['16']};
  padding: 20px 24px;
`;

const CustomDivider = styled(Divider)<{ active?: boolean }>`
  margin: 20px 0;
`;

export default LineBudgetMore;
