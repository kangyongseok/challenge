import type { ChangeEvent, MouseEvent } from 'react';
import { useEffect, useMemo, useRef } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, CircleIconButton, Flexbox, Icon } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

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

  const brands = useRecoilValue(brandFilterOptionsSelector);
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );
  const [{ filterValue, sortValue }, setProductsFilterActionStateFamily] = useRecoilState(
    productsFilterActionStateFamily(`brand-${atomParam}`)
  );

  const scrollElementRef = useRef<HTMLDivElement | null>(null);

  const navigationConsonants = useMemo(
    () =>
      Array.from(new Set(brands.map((brand) => parseWordToConsonant(brand.name))))
        .filter((consonant) => !doubleCon.includes(consonant))
        .sort((a, b) => a.localeCompare(b)),
    [brands]
  );

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const dataCodeId = Number(e.currentTarget.getAttribute('data-code-id') || 0);
    const dataId = Number(e.currentTarget.getAttribute('data-id') || 0);

    const selectedSearchOptionIndex = selectedSearchOptions.findIndex(
      ({ codeId, id }) => codeId === dataCodeId && id === dataId
    );

    if (selectedSearchOptionIndex > -1) {
      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: selectedSearchOptions.filter(
          (_, index) => index !== selectedSearchOptionIndex
        )
      }));
    } else {
      const selectedBrandIndex = brands.findIndex(({ id }) => id === dataId);
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
      <BrandSearchBar hasFilterValue={!!filterValue}>
        <Icon name="SearchOutlined" color="primary" size="medium" />
        <input
          value={filterValue}
          onClick={handleClickInput}
          onChange={handleChange}
          placeholder="브랜드명을 입력하세요."
        />
        {filterValue && (
          <CircleIconButton
            iconName="CloseOutlined"
            customStyle={{
              width: 18,
              height: 18,
              marginBottom: 8
            }}
            onClick={() =>
              setProductsFilterActionStateFamily(({ type }) => ({
                type,
                sortValue,
                filterValue: ''
              }))
            }
          />
        )}
      </BrandSearchBar>
      {!filterValue && (
        <FilterSorter
          options={[
            {
              name: '인기순',
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
            margin: '20px 20px 16px'
          }}
        />
      )}
      <Flexbox
        justifyContent="space-between"
        customStyle={{ flex: 1, margin: '0 20px', overflow: 'hidden' }}
      >
        <Box ref={scrollElementRef} customStyle={{ flex: 1, overflowY: 'auto' }}>
          {brands.map(({ id, codeId, consonant, count, checked, name }) => (
            <FilterOption
              key={`brand-filter-option-${id}`}
              data-consonant={`consonant-${consonant}`}
              data-code-id={codeId}
              data-id={id}
              count={count}
              checked={checked}
              onClick={handleClick}
            >
              {name}
            </FilterOption>
          ))}
        </Box>
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

const BrandSearchBar = styled.div<{ hasFilterValue: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 20px 20px 0 20px;
  border-bottom: 1px solid ${({ theme: { palette } }) => palette.common.grey['40']};

  ${({ hasFilterValue }): CSSObject => (hasFilterValue ? { margin: 20 } : {})};

  & > input {
    flex-grow: 1;
    outline: 0;
    ${({
      theme: {
        typography: {
          body1: { size, weight, lineHeight, letterSpacing }
        }
      }
    }): CSSObject => ({
      fontSize: size,
      fontWeight: weight.medium,
      lineHeight,
      letterSpacing
    })};
  }
  & > svg,
  input {
    margin-bottom: 8px;
  }
`;

export default BrandTabPanel;
