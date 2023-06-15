import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useRef } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Grid, Icon, Input, useTheme } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import { doubleCon } from '@constants/consonant';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { parseWordToConsonant } from '@utils/brands';

import {
  brandFilterOptionsSelector,
  productsFilterActionStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

import FilterSorter from '../FilterSorter';
import FilterOptionNavigation from '../FilterOptionNavigation';
import FilterOption from '../FilterOption';

function BrandTabPanel() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const brands = useRecoilValue(brandFilterOptionsSelector);
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );
  const [{ filterValue, sortValue }, setProductsFilterActionStateFamily] = useRecoilState(
    productsFilterActionStateFamily(`brand-${atomParam}`)
  );

  const scrollElementRef = useRef<HTMLDivElement>(null);

  const navigationConsonants = useMemo(
    () =>
      Array.from(new Set(brands.map((brand) => parseWordToConsonant(brand.name))))
        .filter((consonant) => !doubleCon.includes(consonant))
        .sort((a, b) => a.localeCompare(b)),
    [brands]
  );

  const handleClick = (newCodeId: number, newId: number) => () => {
    const selectedSearchOptionIndex = selectedSearchOptions.findIndex(
      ({ codeId, id }) => codeId === newCodeId && id === newId
    );

    if (selectedSearchOptionIndex > -1) {
      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: selectedSearchOptions.filter(
          (_, index) => index !== selectedSearchOptionIndex
        )
      }));
    } else {
      const selectedBrandIndex = brands.findIndex(({ id }) => id === newId);
      const selectedBrand = brands[selectedBrandIndex];

      if (selectedBrand) {
        logEvent(attrKeys.products.selectFilter, {
          name: attrProperty.name.productList,
          title: attrProperty.title.brand,
          index: selectedBrandIndex,
          count: selectedBrand.count,
          value: selectedBrand.name
        });

        setSelectedSearchOptionsState(({ type }) => ({
          type,
          selectedSearchOptions: selectedSearchOptions.concat(selectedBrand)
        }));
      }
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    setProductsFilterActionStateFamily(({ type }) => ({
      type,
      sortValue,
      filterValue: event.currentTarget.value
    }));

  const handleChangeFilterSorter = (value: string) => {
    logEvent(attrKeys.products.selectSort, {
      name: attrProperty.name.filter,
      title: attrProperty.title.brand,
      order: value === 'default' ? 'POPULAR' : 'NAME'
    });
    setProductsFilterActionStateFamily(({ type }) => ({
      type,
      filterValue: '',
      sortValue: value as 'default' | 'asc'
    }));
  };

  const handleClickInput = () => {
    logEvent(attrKeys.products.CLICK_BRAND_SEARCH, {
      name: 'FILTER'
    });
  };

  useEffect(() => {
    if (scrollElementRef.current) scrollElementRef.current?.scrollTo(0, 0);
  }, [sortValue]);

  useEffect(() => {
    return () => {
      setProductsFilterActionStateFamily(({ type }) => ({
        type,
        sortValue: 'default',
        filterValue: ''
      }));
    };
  }, [setProductsFilterActionStateFamily]);

  return (
    <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
      <Box
        customStyle={{
          padding: '20px 20px 8px'
        }}
      >
        <Input
          fullWidth
          size="large"
          startAdornment={<Icon name="SearchOutlined" size="medium" />}
          endAdornment={
            filterValue && (
              <Icon
                name="DeleteCircleFilled"
                width={18}
                height={18}
                color={common.ui80}
                onClick={() =>
                  setProductsFilterActionStateFamily(({ type }) => ({
                    type,
                    sortValue,
                    filterValue: ''
                  }))
                }
              />
            )
          }
          value={filterValue}
          onClick={handleClickInput}
          onChange={handleChange}
          placeholder="브랜드명을 입력하세요."
        />
        <FilterSorter
          options={[
            {
              name: '매물순',
              value: 'default'
            },
            {
              name: '가나다순',
              value: 'asc'
            }
          ]}
          value={sortValue || 'default'}
          onChange={handleChangeFilterSorter}
          customStyle={{
            marginTop: 8
          }}
        />
      </Box>
      <Flexbox
        justifyContent="space-between"
        customStyle={{ padding: '0 20px', overflow: 'hidden' }}
      >
        <Grid
          ref={scrollElementRef}
          container
          columnGap={8}
          customStyle={{
            overflowY: 'auto'
          }}
        >
          {brands.map(({ id, codeId, consonant, count, checked, name }) => (
            <Grid
              key={`brand-filter-option-${id}`}
              item
              xs={2}
              customStyle={{
                height: 'fit-content'
              }}
            >
              <FilterOption
                data-consonant={`consonant-${consonant}`}
                count={count}
                checked={checked}
                onClick={handleClick(codeId, id)}
              >
                {name}
              </FilterOption>
            </Grid>
          ))}
        </Grid>
        {!filterValue && sortValue === 'asc' && (
          <FilterOptionNavigation
            scrollElement={scrollElementRef}
            consonants={navigationConsonants}
          />
        )}
      </Flexbox>
    </Flexbox>
  );
}

export default BrandTabPanel;
