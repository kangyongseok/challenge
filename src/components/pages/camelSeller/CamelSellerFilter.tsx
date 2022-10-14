import { useCallback, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

// import { useQuery } from 'react-query';
import { useRecoilState } from 'recoil';
import { Flexbox } from 'mrcamel-ui';
import { filter, sum } from 'lodash-es';

import { DropDownSelect } from '@components/UI/molecules';

import type { ProductSearchOption, SiteUrl } from '@dto/product';
import type { CommonCode } from '@dto/common';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { CamelSellerLocalStorage, FilterDropItem, GroupSize } from '@typings/camelSeller';
import { camelSellerBooleanStateFamily } from '@recoil/camelSeller';

// import { fetchSearchHistory } from '@api/product';

// import queryKeys from '@constants/queryKeys';

function CamelSellerFilter({
  data,
  onClick
}: {
  data: ProductSearchOption | undefined;
  onClick: (parameters: { type: string; id: number }) => void;
}) {
  const [filterType, setFilterType] = useState('');
  const [colors, setColors] = useState<FilterDropItem[]>([]);
  const [platforms, setPlatforms] = useState<FilterDropItem[]>([]);
  const [sizes, setSizes] = useState<FilterDropItem[]>([]);
  const [groupSize, setGroupSize] = useState<GroupSize[]>([]);
  const [camelSeller, setCamelSeller] = useState<CamelSellerLocalStorage>();
  const [isResetFilter, setResetFilter] = useRecoilState(
    camelSellerBooleanStateFamily('filterReset')
  );

  // const { data: searchHistory } = useQuery(
  //   queryKeys.products.searchHistory(),
  //   () => fetchSearchHistory()
  //   // {
  //   //   enabled: false
  //   // }
  // );
  useEffect(() => {
    setCamelSeller(LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage);
    document.querySelector('#sheet-root')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.dataset.dropFilter || (target.parentNode as HTMLElement).dataset.dropFilter) {
        setFilterType('');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isResetFilter.isState) {
      setCamelSeller((props) => ({
        ...(props as CamelSellerLocalStorage),
        size: undefined,
        color: undefined
      }));
      setResetFilter(({ type }) => ({ type, isState: false }));
    }
  }, [isResetFilter, setResetFilter]);

  const setFilterItem = useCallback(() => {
    if (data) {
      setColors(
        data.colors.map((color) => ({
          ...getDefaultObject(color)
        }))
      );

      setSizes(
        data.sizes.map((size) => ({
          ...getDefaultObject(size),
          groupId: size.groupId
        }))
      );

      setPlatforms(
        data.siteUrls.map((platform) => ({
          ...getDefaultObject(platform),
          hasImage: platform.hasImage
        }))
      );
    }
  }, [data]);

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
      if (size.groupId === 1 || size.groupId === 3 || size.groupId === 6) {
        return size;
      }
      return '';
    });
    return { ukSize, euSize, globalSize };
  }, [sizes]);

  useEffect(() => {
    const { globalSize, ukSize, euSize } = sizeGroup();
    setGroupSize([
      { label: '글로벌 사이즈', data: globalSize },
      { label: 'UK', data: ukSize },
      { label: 'EU', data: euSize }
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
    const selectItem = item ? JSON.parse(item as string) : '';
    logEvent(attrKeys.camelSeller.SELECT_FILTER, {
      name: attrProperty.name.MARKET_PRICE,
      title: type?.toUpperCase(),
      att: selectItem.name
    });

    if (type) {
      onClick({ type: getTypeKey(type), id: Number(selectItem?.id) });
      setCamelSeller((props) => ({
        ...(props as CamelSellerLocalStorage),
        [type]: selectItem
      }));
      setFilterType('');
    }
  };

  return (
    <Flexbox
      gap={8}
      customStyle={{ marginTop: 12, overflow: filterType ? 'none' : 'auto', paddingRight: 20 }}
    >
      <DropDownSelect
        title="상태"
        type="condition"
        lists={[
          { name: '새상품급', id: 1, count: 1000 },
          { name: '중고상품', id: 1, count: 900 },
          { name: '새상품', id: 1, count: 5000 }
        ]}
        currnetType={filterType}
        onClick={handleClickFilterButton}
        onClickSelect={handleClickSelect}
      />
      <DropDownSelect
        title="사이즈"
        type="size"
        lists={sizes}
        groupSize={groupSize}
        currnetType={filterType}
        selectValue={camelSeller?.size?.id || 'all'}
        onClick={handleClickFilterButton}
        onClickSelect={handleClickSelect}
        allCount={sum(sizes.map((size) => size.count))}
      />
      <DropDownSelect
        title="색상"
        type="color"
        lists={colors}
        currnetType={filterType}
        selectValue={camelSeller?.color?.id || 'all'}
        right={-70}
        onClick={handleClickFilterButton}
        onClickSelect={handleClickSelect}
        allCount={sum(colors.map((color) => color.count))}
      />
      <DropDownSelect
        title="플랫폼"
        type="platform"
        lists={platforms}
        currnetType={filterType}
        selectValue={camelSeller?.platform?.id || 'all'}
        right={0}
        onClick={handleClickFilterButton}
        onClickSelect={handleClickSelect}
      />
    </Flexbox>
  );
}

export default CamelSellerFilter;
