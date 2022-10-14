import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, Tooltip, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { filterCodeIds } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber } from '@utils/common';

import {
  activeTabCodeIdState,
  priceFilterOptionsSelector,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

function PriceTabPanel() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const activeTabCodeId = useRecoilValue(activeTabCodeIdState);
  const { codeId, minPrice, minGoodPrice, maxPrice, maxGoodPrice } = useRecoilValue(
    priceFilterOptionsSelector
  );
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );

  const {
    theme: {
      palette: { primary }
    }
  } = useTheme();

  const [openTooltip, setOpenTooltip] = useState(false);
  const [minPriceValue, setMinPriceValue] = useState<number | string>(0);
  const [maxPriceValue, setMaxPriceValue] = useState<number | string>(0);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const dataType = e.currentTarget.getAttribute('data-type');
    const value = e.currentTarget.value.replace(/^0/, '');
    const tenThousandUnitMaxPrice = getTenThousandUnitPrice(maxPrice);
    const validValue = Number(value) > tenThousandUnitMaxPrice ? tenThousandUnitMaxPrice : value;

    if (dataType === 'minPrice') {
      setMinPriceValue(validValue);
    } else if (dataType === 'maxPrice') {
      setMaxPriceValue(validValue);
    }
  };

  const handleBlur = useCallback(() => {
    let applyMinPrice = 0;
    let applyMaxPrice = 0;
    const tenThousandUnitMinPrice = getTenThousandUnitPrice(minPrice);
    const tenThousandUnitMaxPrice = getTenThousandUnitPrice(maxPrice);

    if (!minPriceValue) {
      setMinPriceValue(tenThousandUnitMinPrice);
      applyMinPrice = minPrice;
      applyMaxPrice = Number(maxPriceValue) * 10000;
    } else if (!maxPriceValue) {
      setMaxPriceValue(tenThousandUnitMaxPrice);
      applyMinPrice = Number(minPriceValue) * 10000;
      applyMaxPrice = maxPrice;
    } else if (minPriceValue < 1) {
      setMinPriceValue(tenThousandUnitMinPrice);
      applyMinPrice = minPrice;
      applyMaxPrice = Number(maxPriceValue) * 10000;
    } else if (minPriceValue && maxPriceValue && minPriceValue < maxPriceValue) {
      applyMinPrice = Number(minPriceValue) * 10000;
      applyMaxPrice = Number(maxPriceValue) * 10000;
    } else if (minPriceValue && maxPriceValue && minPriceValue > maxPriceValue) {
      setMaxPriceValue(minPriceValue);
      applyMinPrice = Number(minPriceValue) * 10000;
      applyMaxPrice = Number(minPriceValue) * 10000;
    }

    if (applyMinPrice && applyMaxPrice) {
      setSelectedSearchOptionsState(
        ({ type, selectedSearchOptions: prevSelectedSearchOptions }) => ({
          type,
          selectedSearchOptions: [
            ...prevSelectedSearchOptions.filter(
              (selectedSearchOption) => selectedSearchOption.codeId !== codeId
            ),
            {
              codeId,
              minPrice: applyMinPrice,
              maxPrice: applyMaxPrice
            }
          ]
        })
      );
    }
  }, [setSelectedSearchOptionsState, codeId, minPrice, maxPrice, minPriceValue, maxPriceValue]);

  const handleClickApply = () => {
    logEvent(attrKeys.products.clickRecommPrice, {
      name: attrProperty.name.filter
    });
    setOpenTooltip(false);
    setSelectedSearchOptionsState(({ type }) => ({
      type,
      selectedSearchOptions: [
        ...selectedSearchOptions.filter(
          (selectedSearchOption) => selectedSearchOption.codeId !== codeId
        ),
        {
          codeId,
          minPrice: minGoodPrice,
          maxPrice: maxGoodPrice
        }
      ]
    }));
  };

  useEffect(() => {
    setMinPriceValue(getTenThousandUnitPrice(minPrice));
    setMaxPriceValue(getTenThousandUnitPrice(maxPrice));
  }, [minPrice, maxPrice]);

  useEffect(() => {
    const selectedPriceFilterOption = selectedSearchOptions.find(
      (selectedSearchOption) => selectedSearchOption.codeId === codeId
    );

    if (minGoodPrice && maxGoodPrice && selectedPriceFilterOption && !openTooltip) {
      setOpenTooltip(
        minGoodPrice !== selectedPriceFilterOption.minPrice ||
          maxGoodPrice !== selectedPriceFilterOption.maxPrice
      );
    } else if (minGoodPrice && maxGoodPrice && !openTooltip) {
      setOpenTooltip(true);
    }
  }, [minGoodPrice, maxGoodPrice, selectedSearchOptions, codeId, openTooltip]);

  useEffect(() => {
    if (openTooltip && activeTabCodeId === filterCodeIds.price) {
      logEvent(attrKeys.products.viewRecommPrice, {
        name: 'FILTER'
      });
    }
  }, [openTooltip, activeTabCodeId]);

  useEffect(() => {
    const selectedPriceFilterOption = selectedSearchOptions.find(
      (selectedSearchOption) => selectedSearchOption.codeId === codeId
    );

    if (selectedPriceFilterOption) {
      setMinPriceValue(getTenThousandUnitPrice(Number(selectedPriceFilterOption.minPrice)));
      setMaxPriceValue(getTenThousandUnitPrice(Number(selectedPriceFilterOption.maxPrice)));
    } else {
      setMinPriceValue(getTenThousandUnitPrice(Number(minPrice)));
      setMaxPriceValue(getTenThousandUnitPrice(Number(maxPrice)));
    }
  }, [selectedSearchOptions, codeId, minPrice, maxPrice]);

  return (
    <Flexbox direction="vertical" gap={16} customStyle={{ padding: '24px 20px 0' }}>
      <Typography weight="bold">가격 범위</Typography>
      <Tooltip
        open={openTooltip}
        message={
          <Flexbox gap={8} justifyContent="space-between">
            <Typography
              variant="body2"
              weight="bold"
              customStyle={{
                '& > span': {
                  color: primary.main
                }
              }}
            >
              추천가격
              <span>
                ({commaNumber(getTenThousandUnitPrice(minGoodPrice))}~
                {commaNumber(getTenThousandUnitPrice(maxGoodPrice))}
                만원)
              </span>
              으로 검색해 보세요
            </Typography>
            <Typography
              variant="body2"
              customStyle={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={handleClickApply}
            >
              적용하기
            </Typography>
          </Flexbox>
        }
        variant="ghost"
        brandColor="primary"
        placement="bottom"
        triangleLeft={16}
        disablePadding
        disableShadow
        customStyle={{
          // TODO UI 라이브러리 Tooltip 컴포넌트 렌더링 로직 수정
          width: '100%',
          padding: '8px 16px',
          left: 155
        }}
      >
        <Flexbox gap={22} customStyle={{ width: '100%' }}>
          <Flexbox alignment="center" gap={8}>
            <PriceInput
              type="number"
              data-type="minPrice"
              onBlur={handleBlur}
              onChange={handleChange}
              value={minPriceValue}
              pattern="[0-9]*"
              inputMode="numeric"
            />
            <Typography weight="medium" customStyle={{ whiteSpace: 'nowrap' }}>
              만원에서
            </Typography>
          </Flexbox>
          <Flexbox alignment="center" gap={8}>
            <PriceInput
              type="number"
              data-type="maxPrice"
              onBlur={handleBlur}
              onChange={handleChange}
              value={maxPriceValue}
              pattern="[0-9]*"
              inputMode="numeric"
            />
            <Typography weight="medium" customStyle={{ whiteSpace: 'nowrap' }}>
              만원까지
            </Typography>
          </Flexbox>
        </Flexbox>
      </Tooltip>
    </Flexbox>
  );
}

const PriceInput = styled.input`
  width: 100%;
  max-width: 88px;
  height: 40px;
  text-align: center;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui80};
  border-radius: ${({
    theme: {
      box: { round }
    }
  }) => round['8']};
  ${({
    theme: {
      palette: { common },
      typography: {
        h4: { size, weight, lineHeight, letterSpacing }
      }
    }
  }) => ({
    fontSize: size,
    fontWeight: weight.bold,
    lineHeight,
    letterSpacing,
    color: common.ui20
  })};
  outline: 0;
  background-color: transparent;

  &:focus {
    border: 2px solid ${({ theme: { palette } }) => palette.primary.main};
  }
`;

export default PriceTabPanel;
