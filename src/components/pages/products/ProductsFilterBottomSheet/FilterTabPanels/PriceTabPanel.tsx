import type { ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Flexbox, Input, Label, Switch, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { Gap } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { filterCodeIds, idFilterIds } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParams } from '@utils/products';
import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber } from '@utils/common';

import {
  activeTabCodeIdState,
  priceFilterOptionsSelector,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

function PriceTabPanel() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const { searchParams: baseSearchParams } = useRecoilValue(
    searchParamsStateFamily(`base-${atomParam}`)
  );
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );
  const activeTabCodeId = useRecoilValue(activeTabCodeIdState);
  const { codeId, minPrice, minGoodPrice, maxPrice, maxGoodPrice } = useRecoilValue(
    priceFilterOptionsSelector
  );
  const setSearchParamsState = useSetRecoilState(searchParamsStateFamily(`search-${atomParam}`));
  const setSearchOptionsParamsState = useSetRecoilState(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );

  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  const [open, setOpen] = useState(false);
  const [minPriceValue, setMinPriceValue] = useState<number | string>(0);
  const [maxPriceValue, setMaxPriceValue] = useState<number | string>(0);
  const [checked, setChecked] = useState(false);

  const checkApplyRecommendPriceRef = useRef(false);

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

  const handleChangeSwitch = () => {
    logEvent(attrKeys.products.selectIdFilter, {
      name: attrProperty.name.filterModal,
      att: '시세이하'
    });

    const findIndex = selectedSearchOptions.findIndex(
      ({ id, codeId: currCodeId }) => id === idFilterIds.lowPrice && currCodeId === filterCodeIds.id
    );

    const newSelectedSearchOptions = (
      checked
        ? selectedSearchOptions.filter((_, index) => index !== findIndex)
        : selectedSearchOptions.concat({
            id: idFilterIds.lowPrice,
            codeId: filterCodeIds.id
          })
    ).filter(({ codeId: selectedCodeId }) => {
      return !(findIndex === -1 && selectedCodeId === filterCodeIds.price);
    });

    setSelectedSearchOptionsState(({ type }) => ({
      type,
      selectedSearchOptions: newSelectedSearchOptions
    }));
    setSearchParamsState(({ type, searchParams }) => {
      const newSearchParams = {
        type,
        searchParams: !checked
          ? {
              ...searchParams,
              idFilterIds: (searchParams.idFilterIds || []).concat(idFilterIds.lowPrice)
            }
          : {
              ...searchParams,
              idFilterIds: (searchParams.idFilterIds || []).filter(
                (idFilterId) => idFilterId !== idFilterIds.lowPrice
              )
            }
      };

      if (!checked) {
        delete newSearchParams.searchParams.minPrice;
        delete newSearchParams.searchParams.maxPrice;
      }

      return newSearchParams;
    });
    setSearchOptionsParamsState(({ type, searchParams }) => {
      const newSearchParams = {
        type,
        searchParams: !checked
          ? {
              ...searchParams,
              idFilterIds: (searchParams.idFilterIds || []).concat(idFilterIds.lowPrice)
            }
          : {
              ...searchParams,
              idFilterIds: (searchParams.idFilterIds || []).filter(
                (idFilterId) => idFilterId !== idFilterIds.lowPrice
              )
            }
      };

      if (!checked) {
        delete newSearchParams.searchParams.minPrice;
        delete newSearchParams.searchParams.maxPrice;
      }

      return newSearchParams;
    });
  };

  const handleClickApply = () => {
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

    logEvent(attrKeys.products.selectFilter, {
      name: attrProperty.name.productList,
      title: attrProperty.title.price,
      value: `${getTenThousandUnitPrice(applyMinPrice)}-${getTenThousandUnitPrice(applyMaxPrice)}`
    });

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
  };

  const handleClickRecommendApply = () => {
    checkApplyRecommendPriceRef.current = true;
    logEvent(attrKeys.products.clickRecommPrice, {
      name: attrProperty.name.filter
    });
    setOpen(false);
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
    if (checkApplyRecommendPriceRef.current) return;

    const selectedPriceFilterOption = selectedSearchOptions.find(
      (selectedSearchOption) => selectedSearchOption.codeId === codeId
    );

    if (minGoodPrice && maxGoodPrice && selectedPriceFilterOption && !open) {
      setOpen(
        minGoodPrice !== selectedPriceFilterOption.minPrice ||
          maxGoodPrice !== selectedPriceFilterOption.maxPrice
      );
    } else if (minGoodPrice && maxGoodPrice && !open) {
      setOpen(true);
    }
  }, [minGoodPrice, maxGoodPrice, selectedSearchOptions, codeId, open]);

  useEffect(() => {
    if (open && activeTabCodeId === filterCodeIds.price) {
      logEvent(attrKeys.products.viewRecommPrice, {
        name: 'FILTER'
      });
    }
  }, [open, activeTabCodeId]);

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

  useEffect(() => {
    setChecked(
      selectedSearchOptions.some(
        ({ id, codeId: newCodeId }) => id === idFilterIds.lowPrice && newCodeId === filterCodeIds.id
      )
    );
  }, [selectedSearchOptions]);

  useEffect(() => {
    if (activeTabCodeId === filterCodeIds.price) {
      setSearchOptionsParamsState(({ type }) => ({
        type,
        searchParams: convertSearchParams(selectedSearchOptions, {
          baseSearchParams
        })
      }));
    }
  }, [setSearchOptionsParamsState, activeTabCodeId, baseSearchParams, selectedSearchOptions]);

  return (
    <>
      <Flexbox
        justifyContent="space-between"
        customStyle={{
          padding: 20
        }}
      >
        <div>
          <Typography variant="h4" weight="bold">
            시세이하만 보기
          </Typography>
          <Typography
            customStyle={{
              marginTop: 4
            }}
          >
            평균 보다 저렴한 매물을 만나보세요.
          </Typography>
        </div>
        <Switch size="large" onChange={handleChangeSwitch} checked={checked} />
      </Flexbox>
      <Gap height={8} />
      <Flexbox direction="vertical" customStyle={{ padding: 20 }}>
        <Typography
          weight="medium"
          customStyle={{
            color: checked ? common.ui80 : common.ui60
          }}
        >
          가격 범위
        </Typography>
        <Flexbox
          gap={8}
          alignment="center"
          customStyle={{
            marginTop: 8
          }}
        >
          <Input
            size="xlarge"
            unit="만원"
            type="number"
            data-type="minPrice"
            onChange={handleChange}
            value={minPriceValue}
            pattern="[0-9]*"
            inputMode="numeric"
            fullWidth
            disabled={checked}
            customStyle={{
              whiteSpace: 'nowrap'
            }}
            inputCustomStyle={{
              width: '100%'
            }}
          />
          <Typography
            variant="h3"
            customStyle={{
              color: common.ui60
            }}
          >
            ~
          </Typography>
          <Input
            size="xlarge"
            unit="만원"
            type="number"
            data-type="maxPrice"
            onChange={handleChange}
            value={maxPriceValue}
            pattern="[0-9]*"
            inputMode="numeric"
            fullWidth
            disabled={checked}
            customStyle={{
              whiteSpace: 'nowrap'
            }}
            inputCustomStyle={{
              width: '100%'
            }}
          />
          <Button
            variant="ghost"
            brandColor="black"
            size="xlarge"
            disabled={checked}
            onClick={handleClickApply}
            customStyle={{
              minWidth: 63
            }}
          >
            적용
          </Button>
        </Flexbox>
        {!checked && open && (
          <Flexbox
            gap={8}
            alignment="center"
            justifyContent="space-between"
            customStyle={{
              marginTop: 20
            }}
          >
            <Flexbox gap={8} alignment="center">
              <Label variant="solid" brandColor="blue" size="small" text="추천가격" />
              <Typography
                weight="medium"
                customStyle={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: common.ui60,
                  '& > span': {
                    color: primary.light
                  }
                }}
              >
                <span>
                  {commaNumber(getTenThousandUnitPrice(minGoodPrice))}~
                  {commaNumber(getTenThousandUnitPrice(maxGoodPrice))}
                  만원
                </span>
                으로 검색해 보세요.
              </Typography>
            </Flexbox>
            <Typography
              weight="medium"
              onClick={handleClickRecommendApply}
              customStyle={{
                whiteSpace: 'nowrap',
                textDecoration: 'underline',
                color: primary.light
              }}
            >
              적용하기
            </Typography>
          </Flexbox>
        )}
      </Flexbox>
    </>
  );
}

export default PriceTabPanel;
