import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, MouseEvent } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Icon } from 'mrcamel-ui';
import debounce from 'lodash-es/debounce';
import styled from '@emotion/styled';

import SearchBar from '@components/UI/molecules/SearchBar';

import { logEvent } from '@library/amplitude';

import { fetchBrandsSuggestWithCollabo } from '@api/brand';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

interface BrandSearchModalProps {
  close: () => void;
}

/* eslint-disable no-useless-escape */
const koRegexp = /^[\w`.~!@#$%^&*|\\;:\/?]/;

export default function BrandSearchModal({ close }: BrandSearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const { data = [], refetch } = useQuery(
    queryKeys.brands.brandName(),
    () => fetchBrandsSuggestWithCollabo(searchValue),
    { enabled: false }
  );

  useEffect(() => {
    if (searchValue) {
      refetch();
    }
  }, [refetch, searchValue]);

  const handleModalClose = (e: MouseEvent<HTMLDivElement | SVGElement>) => {
    e.stopPropagation();
    const target = e.target as HTMLDivElement;
    if (target.dataset.back === 'back' || e.currentTarget.tagName === 'svg') {
      close();
    }
  };

  const handleChange = debounce((e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setSearchValue(target.value);
  }, 500);

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const dataSet = target.dataset;

    logEvent(attrKeys.brands.CLICK_AUTO, {
      name: 'BRAND_LIST',
      type: 'BRAND',
      keyword: dataSet.brandName,
      index: dataSet.index
    });

    router.push(`/products/brands/${dataSet.brandName}`);
  };

  const handleValueClear = () => {
    if (inputRef.current) {
      (inputRef.current.childNodes[0].childNodes[1] as HTMLInputElement).value = '';
    }
    setSearchValue('');
  };

  return (
    <Background data-back="back" onClick={handleModalClose}>
      <>
        <SearchBar
          fullWidth
          autoFocus
          isBottomBorderFixed
          placeholder="브랜드 검색"
          startIcon={<Icon name="ArrowLeftOutlined" color="black" onClick={handleModalClose} />}
          endIcon={
            <ClearIcon
              size="small"
              name="CloseOutlined"
              color="white"
              onClick={handleValueClear}
              isSearchValue={!!searchValue}
            />
          }
          ref={inputRef}
          onChange={handleChange}
        />
        {searchValue && data.length > 0 && (
          <BrandList>
            {data.map((brand, i) => {
              const name = koRegexp.test(searchValue) ? brand.nameEng.toUpperCase() : brand.name;
              return (
                <BrandItemLi
                  onClick={handleClick}
                  data-brand-ids={brand.brandIds}
                  data-collabo-ids={brand.collaboIds}
                  data-index={i + 1}
                  data-brand-name={name}
                  key={`brand-search-${name}`}
                >
                  {name}
                </BrandItemLi>
              );
            })}
          </BrandList>
        )}
      </>
    </Background>
  );
}

const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000000;
`;

const BrandList = styled.ul`
  background-color: white;
  padding: 70px 20px 0;
  overflow: auto;
  height: 100%;
`;

const BrandItemLi = styled.li`
  margin-bottom: 24px;
  font-size: ${({ theme: { typography } }) => typography.h4.size};
  color: ${({ theme: { palette } }) => palette.common.grey['20']};
  font-weight: 500;
`;

const ClearIcon = styled(Icon)<{ isSearchValue: boolean }>`
  display: ${({ isSearchValue }) => (isSearchValue ? 'block' : 'none')};
  background: ${({ theme: { palette } }) => palette.common.grey['80']};
  border-radius: 16px;
  min-width: 16px;
  height: 16px;
  padding: 3px;
`;
