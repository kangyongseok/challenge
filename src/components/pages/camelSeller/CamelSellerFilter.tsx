import { useCallback, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { filter, find, sortBy } from 'lodash-es';
import { Button, Flexbox, Icon } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { DropDownSelect } from '@components/UI/molecules';

import type { ProductSearchOption, RecentSearchParams, SiteUrl } from '@dto/product';
import type { CommonCode, SizeCode } from '@dto/common';

import { logEvent } from '@library/amplitude';

import { globalSizeGroupId } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { FilterDropItem, GroupSize, SearchHistoryHookType } from '@typings/camelSeller';
import { camelSellerBooleanStateFamily, camelSellerTempSaveDataState } from '@recoil/camelSeller';
import useQuerySearchHistory from '@hooks/useQuerySearchHistory';

function CamelSellerFilter({
  onClick,
  onClickReset,
  fetchData,
  baseSearchInfinitData,
  searchInfinitData
}: {
  onClick: (parameters: { type: string; id: number }) => void;
  onClickReset: () => void;
  fetchData: RecentSearchParams;
  baseSearchInfinitData: ProductSearchOption | null;
  searchInfinitData: ProductSearchOption | null;
}) {
  const [filterType, setFilterType] = useState<SearchHistoryHookType>(null);
  const [sizes, setSizes] = useState<FilterDropItem[]>([]);
  const [conditionIds, setConditionIds] = useState<FilterDropItem[]>([]);
  const [groupSize, setGroupSize] = useState<GroupSize[]>([]);
  const [isResetFilter, setResetFilter] = useRecoilState(
    camelSellerBooleanStateFamily('filterReset')
  );
  const [selectSizeId, setSize] = useState(0);
  const [selectCondition, setCondition] = useState(0);
  const [baseSearchData, setBaseSearchData] = useState<ProductSearchOption | null>();
  const [searchData, setSearchData] = useState<ProductSearchOption | null>();
  const tempData = useRecoilValue(camelSellerTempSaveDataState);
  const { filterQuery: { baseSearchOptions, searchOptions } = {} } = useQuerySearchHistory({
    fetchData,
    type: filterType
  });

  useEffect(() => {
    setBaseSearchData(baseSearchOptions || baseSearchInfinitData);
    setSearchData(searchOptions || searchInfinitData);
  }, [baseSearchInfinitData, baseSearchOptions, searchInfinitData, searchOptions]);

  useEffect(() => {
    if (!selectSizeId) {
      setSize(tempData.size.categorySizeId || 0);
    }
    if (!selectCondition) {
      setCondition(tempData.condition.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempData]);

  useEffect(() => {
    document.querySelector('#sheet-root')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.parentNode) {
        if (!target.dataset.dropFilter || (target.parentNode as HTMLElement).dataset.dropFilter) {
          setFilterType(null);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isResetFilter.isState) {
      setSize(0);
      setCondition(0);
      setResetFilter(({ type }) => ({ type, isState: false }));
    }
  }, [isResetFilter, setResetFilter]);

  const countParser = useCallback(
    (type: 'conditions' | 'sizes') => {
      if (baseSearchData && searchData) {
        return baseSearchData[type].map((item) => {
          const findSearchOption = find(searchData[type], { id: item.id }) as CommonCode | SiteUrl;
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
    [baseSearchData, searchData]
  );

  const setFilterItem = useCallback(() => {
    if (countParser('conditions').length) {
      setConditionIds(
        countParser('conditions').map((condi) => ({
          ...getDefaultObject(condi)
        }))
      );
    }

    if (countParser('sizes').length) {
      setSizes(
        (countParser('sizes') as SizeCode[]).map((size) => ({
          ...getDefaultObject(size),
          id: size.categorySizeId,
          groupId: size.groupId
        }))
      );
    }
  }, [countParser]);

  const getDefaultObject = (item: (CommonCode | SiteUrl) & { synonyms?: string }) => {
    return {
      name: item.name,
      id: item.id,
      count: item.count,
      synonyms: item.synonyms
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
        return 'categorySizeIds';
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

  const handleClickFilterButton = (type: SearchHistoryHookType) => {
    setFilterType(type);
  };

  const handleClickSelect = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { type, item } = target.dataset;
    const selectItem = item ? JSON.parse(item as string) : { id: 0 };
    logEvent(attrKeys.camelSeller.SELECT_FILTER, {
      name: attrProperty.name.MARKET_PRICE,
      title: type?.toUpperCase(),
      att: selectItem.synonyms || selectItem.name
    });

    if (type) {
      onClick({ type: getTypeKey(type), id: Number(selectItem?.id) });
      if (type === 'size') {
        setSize(Number(selectItem?.id));
      }
      if (type === 'condition') {
        setCondition(Number(selectItem?.id));
      }
      setFilterType(null);
    }
  };

  const parseCondition = (name: string) => {
    if (name === 'N') return '새상품(미개봉)';
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
    <DropDownStyledWrap justifyContent="space-between" gap={8} isFilterType={!!filterType}>
      <Flexbox gap={8}>
        <DropDownSelect
          title="상태"
          type="condition"
          lists={result}
          currnetType={filterType}
          selectValue={selectCondition || 'all'}
          onClick={handleClickFilterButton}
          onClickSelect={handleClickSelect}
          allCount={searchOptions?.productTotal}
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
          allCount={searchOptions?.productTotal}
        />
      </Flexbox>
      <Button
        variant="inline"
        brandColor="black"
        startIcon={<Icon name="RotateOutlined" />}
        onClick={() => {
          logEvent(attrKeys.camelSeller.CLICK_RESET, {
            name: attrProperty.name.MARKET_PRICE,
            title: attrProperty.title.TOP
          });
          onClickReset();
        }}
        customStyle={{
          marginRight: -20,
          paddingLeft: 0,
          paddingRight: 0
        }}
      >
        필터 초기화
      </Button>
    </DropDownStyledWrap>
  );
}

const DropDownStyledWrap = styled(Flexbox)<{ isFilterType: boolean }>`
  margin: 12px 0 ${({ isFilterType }) => (isFilterType ? -331 : 0)}px;
  overflow-x: auto;
  padding: 0 20px ${({ isFilterType }) => (isFilterType ? 331 : 0)}px 0;
`;

export default CamelSellerFilter;
