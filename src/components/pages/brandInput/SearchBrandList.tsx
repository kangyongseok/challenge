import { MouseEvent } from 'react';

import { find } from 'lodash-es';
import { Checkbox, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import type { AllBrand } from '@dto/brand';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import type { SelectedHotBrand } from '@typings/brands';

interface SearchBrandListProps {
  data: AllBrand[];
  selectBrands: SelectedHotBrand[];
  setSelectBrands: (parameter: SelectedHotBrand[]) => void;
}

export default function SearchBrandList({
  data,
  setSelectBrands,
  selectBrands
}: SearchBrandListProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleChecked = (e: MouseEvent<HTMLLIElement>) => {
    const target = e.currentTarget as HTMLLIElement;

    const obj = {
      id: Number(target.dataset.brandId),
      name: target.dataset.brandName
    };

    if (find(selectBrands, { id: Number(target.dataset.brandId) })) {
      const filterResult = selectBrands.filter(
        (list) => list.id !== Number(target.dataset.brandId)
      );
      setSelectBrands(filterResult);
    } else {
      logEvent(attrKeys.userInput.SELECT_ITEM, {
        name: 'BRAND',
        title: 'SEARCH',
        att: target.dataset.brandName
      });
      setSelectBrands([...selectBrands, obj]);
    }
  };

  return (
    <SearchListArea isDisplay={!!(data.length > 0)}>
      {data.map((list) => {
        return (
          <SearchItem
            key={`search-list-${list.name}`}
            onClick={handleChecked}
            data-brand-id={list.id}
            data-brand-name={list.name}
            isDisplay={!!list.id}
          >
            <Checkbox
              customStyle={{
                background: find(selectBrands, { name: list.name }) ? common.ui20 : common.uiWhite,
                borderColor: find(selectBrands, { name: list.name }) ? common.ui20 : common.ui60
              }}
            />
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>
              <Typography>{list.name}</Typography>
            </label>
          </SearchItem>
        );
      })}
    </SearchListArea>
  );
}

const SearchListArea = styled.ul<{ isDisplay: boolean }>`
  border: 1px solid #cccccc;
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 28px 20px 0 20px;
  position: absolute;
  top: 145px;
  left: 20px;
  background: white;
  width: calc(100% - 40px);
  max-height: calc(100vh - 300px);
  overflow: auto;
  display: ${({ isDisplay }) => (isDisplay ? 'block' : 'none')};
`;

const SearchItem = styled.li<{ isDisplay: boolean }>`
  display: ${({ isDisplay }) => (isDisplay ? 'flex' : 'none')};
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
`;
