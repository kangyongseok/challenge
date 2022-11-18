import { useCallback, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

// import { useQuery } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Flexbox } from 'mrcamel-ui';
import { filter, find, sortBy } from 'lodash-es';
import styled from '@emotion/styled';

import { DropDownSelect } from '@components/UI/molecules';

import type { ProductSearchOption, SiteUrl } from '@dto/product';
import type { CommonCode } from '@dto/common';

import { logEvent } from '@library/amplitude';

import { globalSizeGroupId } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { FilterDropItem, GroupSize } from '@typings/camelSeller';
import { camelSellerBooleanStateFamily, camelSellerTempSaveDataState } from '@recoil/camelSeller';

// import { fetchSearchHistory } from '@api/product';

// import queryKeys from '@constants/queryKeys';

function CamelSellerFilter({
  baseSearchOptions,
  searchOptions,
  onClick
}: {
  baseSearchOptions: ProductSearchOption | undefined;
  searchOptions: ProductSearchOption | undefined;
  onClick: (parameters: { type: string; id: number }) => void;
}) {
  const [filterType, setFilterType] = useState('');
  const [colors, setColors] = useState<FilterDropItem[]>([]);
  const [platforms, setPlatforms] = useState<FilterDropItem[]>([]);
  const [sizes, setSizes] = useState<FilterDropItem[]>([]);
  const [conditionIds, setCondtionIds] = useState<FilterDropItem[]>([]);
  const [groupSize, setGroupSize] = useState<GroupSize[]>([]);
  // const [camelSeller, setCamelSeller] = useState<CamelSellerLocalStorage>();
  const [isResetFilter, setResetFilter] = useRecoilState(
    camelSellerBooleanStateFamily('filterReset')
  );
  const [selectColorId, setColor] = useState(0);
  const [selectSizeId, setSize] = useState(0);
  const [selectPlatform, setPlatform] = useState(0);
  const [selectCondition, setCondition] = useState(0);
  // const [selectStatus, setStatus] = useState();
  const tempData = useRecoilValue(camelSellerTempSaveDataState);
  // const submitData = useRecoilValue(camelSellerSubmitState);

  // const { data: searchHistory } = useQuery(
  //   queryKeys.products.searchHistory(),
  //   () => fetchSearchHistory()
  //   // {
  //   //   enabled: false
  //   // }
  // );
  useEffect(() => {
    if (!selectColorId) {
      setColor(tempData.color.id);
    }
    if (!selectSizeId) {
      setSize(tempData.size.id);
    }
    if (!selectCondition) {
      setCondition(tempData.condition.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempData]);

  useEffect(() => {
    // setCamelSeller(LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage);
    document.querySelector('#sheet-root')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.parentNode) {
        if (!target.dataset.dropFilter || (target.parentNode as HTMLElement).dataset.dropFilter) {
          setFilterType('');
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isResetFilter.isState) {
      setColor(0);
      setSize(0);
      setPlatform(0);
      setCondition(0);
      setResetFilter(({ type }) => ({ type, isState: false }));
    }
  }, [isResetFilter, setResetFilter]);

  const countParser = useCallback(
    (type: 'colors' | 'conditions' | 'sizes' | 'siteUrls') => {
      if (baseSearchOptions && searchOptions) {
        return baseSearchOptions[type].map((item) => {
          const findSearchOption = find(searchOptions[type], { id: item.id }) as
            | CommonCode
            | SiteUrl;
          if (findSearchOption) {
            return {
              ...item,
              count: findSearchOption?.count
            };
          }
          return {
            ...item,
            count: 0
          };
        });
      }
      return [];
    },
    [baseSearchOptions, searchOptions]
  );

  const setFilterItem = useCallback(() => {
    if (countParser('colors').length) {
      setColors(
        countParser('colors').map((color) => ({
          ...getDefaultObject(color)
        }))
      );
    }

    if (countParser('conditions').length) {
      setCondtionIds(
        countParser('conditions').map((condi) => ({
          ...getDefaultObject(condi)
        }))
      );
    }

    if (countParser('sizes').length) {
      setSizes(
        (countParser('sizes') as CommonCode[]).map((size) => ({
          ...getDefaultObject(size),
          groupId: size.groupId
        }))
      );
    }

    if (countParser('siteUrls')) {
      setPlatforms(
        (countParser('siteUrls') as SiteUrl[]).map((platform) => ({
          ...getDefaultObject(platform),
          hasImage: platform.hasImage
        }))
      );
    }
  }, [countParser]);

  const getDefaultObject = (item: CommonCode | SiteUrl) => {
    return {
      name: item.name,
      id: item.id,
      count: item.count
    };
  };

  useEffect(() => {
    setFilterItem();
  }, [setFilterItem]);

  const sizeGroup = useCallback(() => {
    const ukSize = filter(sizes, { groupId: 4 });
    const euSize = filter(sizes, { groupId: 5 });
    const globalSize = sizes.filter((size) => {
      if (globalSizeGroupId.includes(size.groupId as number)) {
        return size;
      }
      return '';
    });
    return { ukSize, euSize, globalSize };
  }, [sizes]);

  useEffect(() => {
    const { globalSize, ukSize, euSize } = sizeGroup();
    setGroupSize([
      { label: '글로벌 사이즈', data: sortBy(globalSize, 'count').reverse() },
      { label: 'UK', data: sortBy(ukSize, 'count').reverse() },
      { label: 'EU', data: sortBy(euSize, 'count').reverse() }
    ]);
  }, [sizeGroup]);

  const getTypeKey = (type: string) => {
    switch (type) {
      case 'size':
        return 'sizeIds';
      case 'color':
        return 'colorIds';
      case 'platform':
        return 'siteUrlIds';
      case 'condition':
        return 'conditionIds';
      default:
        return '';
    }
  };

  const handleClickFilterButton = (type: string) => {
    setFilterType(type);
  };

  const handleClickSelect = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { type, item } = target.dataset;
    const selectItem = item ? JSON.parse(item as string) : { id: 0 };
    logEvent(attrKeys.camelSeller.SELECT_FILTER, {
      name: attrProperty.name.MARKET_PRICE,
      title: type?.toUpperCase(),
      att: selectItem.name
    });

    if (type) {
      onClick({ type: getTypeKey(type), id: Number(selectItem?.id) });
      if (type === 'size') {
        setSize(Number(selectItem?.id));
      }
      if (type === 'color') {
        setColor(Number(selectItem?.id));
      }
      if (type === 'platform') {
        setPlatform(Number(selectItem?.id));
      }
      if (type === 'condition') {
        setCondition(Number(selectItem?.id));
      }
      setFilterType('');
    }
  };

  const parseCondition = (name: string) => {
    if (name === 'N') return '새상품';
    if (name === 'S') return '새상품급';
    if (name === 'A') return '상태 좋음';
    if (name === 'B') return '상태 보통';
    if (name === 'C') return '상태 나쁨';
    return '';
  };

  const result = conditionIds.map((cond) => ({
    ...cond,
    name: parseCondition(cond.name)
  }));

  return (
    <DropDownStyledWrap gap={8} isFilterType={!!filterType}>
      <DropDownSelect
        title="상태"
        type="condition"
        lists={result}
        currnetType={filterType}
        selectValue={selectCondition || 'all'}
        onClick={handleClickFilterButton}
        onClickSelect={handleClickSelect}
      />
      <DropDownSelect
        groupSelect
        title="사이즈"
        type="size"
        lists={sizes}
        groupSize={groupSize}
        currnetType={filterType}
        selectValue={selectSizeId || 'all'}
        onClick={handleClickFilterButton}
        onClickSelect={handleClickSelect}
        allCount={baseSearchOptions?.productTotal}
      />
      <DropDownSelect
        title="색상"
        type="color"
        lists={colors}
        currnetType={filterType}
        selectValue={selectColorId || 'all'}
        right={-70}
        onClick={handleClickFilterButton}
        onClickSelect={handleClickSelect}
        allCount={baseSearchOptions?.productTotal}
      />
      <DropDownSelect
        title="플랫폼"
        type="platform"
        lists={platforms}
        currnetType={filterType}
        selectValue={selectPlatform || 'all'}
        right={0}
        onClick={handleClickFilterButton}
        onClickSelect={handleClickSelect}
        allCount={baseSearchOptions?.productTotal}
      />
    </DropDownStyledWrap>
  );
}

const DropDownStyledWrap = styled(Flexbox)<{ isFilterType: boolean }>`
  margin: 12px 0 ${({ isFilterType }) => (isFilterType ? -331 : 0)}px;
  overflow-x: auto;
  padding: 0 20px ${({ isFilterType }) => (isFilterType ? 331 : 0)}px 0;
`;

export default CamelSellerFilter;
