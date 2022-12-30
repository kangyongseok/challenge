import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useInfiniteQuery, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Button, Flexbox, Icon, Skeleton, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { DropDownSelect } from '@components/UI/molecules';

import { RecentSearchParams } from '@dto/product';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchProduct, fetchSearchHistory } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { SELLER_PROCESS_TYPE } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { deviceIdState } from '@recoil/common';
import {
  camelSellerBooleanStateFamily,
  camelSellerDialogStateFamily,
  camelSellerTempSaveDataState,
  recentPriceCardTabNumState
} from '@recoil/camelSeller';

import RecentBottomSheetEmptyResult from './RecentBottomSheetEmptyResult';
import CamelSellerProductCard from './CamelSellerProductCard';
import CamelSellerFilter from './CamelSellerFilter';

function CamelSellerRecentBottomSheet() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const { query, beforePopState, push, asPath } = useRouter();
  const observerRef = useRef<IntersectionObserver>();
  const targetRef = useRef(null);
  const deviceId = useRecoilValue(deviceIdState);
  const productId = Number(query.id || 0);
  const [viewRecentPriceList, setViewRecentPriceList] = useRecoilState(
    camelSellerDialogStateFamily('recentPrice')
  );
  const [fetchData, setFetchData] = useState<RecentSearchParams>({});
  const [filterType, setFilterType] = useState('');
  const [order, setOrder] = useState({ name: '최근 거래순', id: 'updatedDesc' });
  const resetFilter = useSetRecoilState(camelSellerBooleanStateFamily('filterReset'));
  const recentPriceCardTabNum = useRecoilValue(recentPriceCardTabNumState);
  const bottomSheetRef = useRef<HTMLDivElement>(null);
  const tempData = useRecoilValue(camelSellerTempSaveDataState);
  const { data: editData } = useQuery(
    queryKeys.products.sellerEditProducs({ productId, deviceId }),
    () => fetchProduct({ productId, deviceId }),
    {
      enabled: !!productId
    }
  );

  const {
    data: { pages = [] } = {},
    isSuccess,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery(
    queryKeys.products.searchHistory(fetchData),
    ({ pageParam = 0 }) => fetchSearchHistory({ ...fetchData, page: pageParam }),
    {
      getNextPageParam: (nextData) => {
        const { number = 0, totalPages = 0 } = nextData.page || {};
        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  useEffect(() => {
    if (viewRecentPriceList.open) {
      beforePopState(() => {
        setViewRecentPriceList(({ type }) => ({ type, open: false }));
        handleClickFilterReset();
        window.history.pushState(null, '', asPath);
        return false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beforePopState, push, query, viewRecentPriceList.open]);

  const intersectionObserver = (entries: IntersectionObserverEntry[], io: IntersectionObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        io.unobserve(entry.target);
        fetchNextPage();
      }
    });
  };

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    observerRef.current = new IntersectionObserver(intersectionObserver);
    if (targetRef.current) {
      observerRef.current.observe(targetRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages]);

  useEffect(() => {
    if (viewRecentPriceList.open) {
      logEvent(attrKeys.camelSeller.VIEW_MAKET_PRICE, {
        name: attrProperty.name.PRODUCT_MAIN
      });
    }
  }, [viewRecentPriceList]);

  const handleClickFilterReset = useCallback(() => {
    if (tempData) {
      const brandIds = () => {
        if (tempData.brand.id) return [tempData.brand.id];
        if (query.brandIds) {
          if (typeof query.brandIds === 'string') {
            return [Number(query.brandIds)];
          }
          return query.brandIds.map((id) => Number(id));
        }
        return [];
      };

      setFetchData({
        brandIds: brandIds(),
        categoryIds: [tempData.category.id || Number(query.categoryIds)],
        keyword: tempData.quoteTitle,
        conditionIds: [],
        colorIds: [],
        sizeIds: [],
        order: 'postedAllDesc'
      });
    }
    resetFilter(({ type }) => ({ type, isState: true }));
  }, [tempData, resetFilter, query.brandIds, query.categoryIds]);

  const getScrollTop = useCallback((index: number) => {
    if (index === 0) return 52;
    if (index === 1) return 2 * 90;
    if (index === 2) return 3 * 100;
    if (index === 3) return 4 * 105;
    if (index === 4) return 5 * 107;
    return 0;
  }, []);

  useEffect(() => {
    if (viewRecentPriceList.open && recentPriceCardTabNum) {
      setTimeout(() => {
        ((bottomSheetRef.current as HTMLElement).parentNode as HTMLElement).scrollTo({
          top: getScrollTop(recentPriceCardTabNum.index),
          behavior: 'smooth'
        });
      }, 500);
    }
  }, [getScrollTop, recentPriceCardTabNum, viewRecentPriceList]);

  const getKeyword = useCallback(() => {
    if (LocalStorage.get(SELLER_PROCESS_TYPE)) {
      return `${query.brandName} ${query.categoryName}`;
    }
    if (!tempData.quoteTitle) {
      return query.brandName;
    }
    return tempData.quoteTitle;
  }, [query.brandName, query.categoryName, tempData.quoteTitle]);

  useEffect(() => {
    if (viewRecentPriceList.open) {
      if (editData) {
        setFetchData({
          brandIds: [editData.product.brand.id].concat(
            editData.product?.productBrands?.map(({ brand }) => brand.id) || []
          ),
          categoryIds: [editData.product.category.id || 0],
          keyword: editData.product.quoteTitle,
          conditionIds: editData.product.labels?.map((label) => label.id),
          colorIds: editData.product.colors?.map((color) => color.id),
          sizeIds: editData.product.categorySizes?.map((size) => size.id),
          order: 'postedAllDesc' // updatedDesc
        });
      } else if (query.title) {
        setFetchData({
          brandIds:
            typeof query.brandIds === 'string'
              ? [Number(query.brandIds)]
              : (query.brandIds?.map((id) => Number(id)) as number[]),
          categoryIds: [Number(query.categoryIds)],
          keyword: getKeyword() as string,
          conditionIds: tempData.condition.id ? [tempData.condition.id] : [],
          colorIds: tempData.color.id ? [tempData.color.id] : [],
          sizeIds: tempData.size.id ? [tempData.size.id] : [],
          order: 'postedAllDesc' // updatedDesc
        });
      }
    }
  }, [
    editData,
    getKeyword,
    query.brandIds,
    query.brandName,
    query.categoryIds,
    query.categoryName,
    query.id,
    query.title,
    tempData.color.id,
    tempData.condition.id,
    tempData.quoteTitle,
    tempData.size.id,
    viewRecentPriceList.open
  ]);

  const handleClickFilterSelect = ({ type, id }: { type: string; id: number }) => {
    setFetchData((props) => ({
      ...props,
      [type]: id ? [id] : []
    }));
  };

  const handleClickFilterButton = (type: string) => {
    logEvent(attrKeys.camelSeller.CLICK_SORT, {
      name: attrProperty.name.MARKET_PRICE
    });

    setFilterType(type);
  };

  const handleClickSelect = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { item } = target.dataset;
    const selectItem = JSON.parse(item as string);
    logEvent(attrKeys.camelSeller.SELECT_SORT, {
      name: attrProperty.name.MARKET_PRICE
    });

    setFilterType('');
    setOrder(selectItem);
    setFetchData((props) => ({
      ...props,
      order: selectItem.id
    }));
  };

  const emptyList =
    status === 'error' || (isSuccess && pages[0]?.page && pages[0].page.content.length === 0);

  return (
    <BottomSheet
      open={viewRecentPriceList.open}
      onClose={() => {
        setViewRecentPriceList(({ type }) => ({ type, open: false }));
        handleClickFilterReset();
      }}
      customStyle={{ height: 'calc(100% - 56px)' }}
    >
      <FilterHeaderFix ref={bottomSheetRef}>
        <Flexbox>
          <Typography brandColor="primary" weight="bold" variant="h3">
            {getKeyword()}
            <Typography weight="bold" variant="h3" customStyle={{ display: 'inline-block' }}>
              의 최근 거래가
            </Typography>
          </Typography>
        </Flexbox>
        <CamelSellerFilter
          baseSearchOptions={pages[0]?.baseSearchOptions}
          searchOptions={pages[0]?.searchOptions}
          onClick={handleClickFilterSelect}
        />
      </FilterHeaderFix>
      <Flexbox
        justifyContent="space-between"
        alignment="center"
        customStyle={{ padding: '0 20px', marginTop: 116, height: 52 }}
      >
        <DropDownSelect
          disabledBorder
          disabledCount
          disabledBg
          title="최근 거래순"
          type="recent"
          lists={[
            { name: '최근 거래순', id: 'postedAllDesc' },
            { name: '높은 가격순', id: 'priceDesc' },
            { name: '낮은 가격순', id: 'priceAsc' }
          ]}
          currnetType={filterType}
          selectValue={order.id}
          onClick={handleClickFilterButton}
          onClickSelect={handleClickSelect}
        />
        <Button
          customStyle={{ border: 'none', padding: 0 }}
          startIcon={<Icon name="RotateOutlined" customStyle={{ marginRight: 4 }} />}
          onClick={() => {
            logEvent(attrKeys.camelSeller.CLICK_RESET, {
              name: attrProperty.name.MARKET_PRICE,
              title: attrProperty.title.TOP
            });
            handleClickFilterReset();
          }}
        >
          <Typography variant="body1">필터 재설정</Typography>
        </Button>
      </Flexbox>
      {!!emptyList && (
        <RecentBottomSheetEmptyResult
          title={(query.title as string) || editData?.product.title || ''}
        />
      )}
      <Flexbox direction="vertical" gap={20} customStyle={{ padding: '0 20px' }}>
        {isLoading &&
          Array.from({ length: 8 }, (_, i) => i + 1).map((value) => (
            <Flexbox gap={12} key={`skeleton-card-${value}`}>
              <Skeleton width={100} height={100} round={8} disableAspectRatio />
              <Flexbox direction="vertical" gap={5}>
                <Skeleton disableAspectRatio width={150} height={18} />
                <Skeleton disableAspectRatio width={100} height={15} />
                <Skeleton disableAspectRatio width={80} height={21} />
                <Skeleton disableAspectRatio width={80} height={21} />
              </Flexbox>
            </Flexbox>
          ))}
        {isSuccess &&
          pages.map(({ page }) => {
            return page?.content?.map((item) => (
              <CamelSellerProductCard
                data={item}
                key={`product-card-${item.id}`}
                isActive={recentPriceCardTabNum?.id === item.id}
              />
            ));
          })}
        {isFetchingNextPage &&
          Array.from({ length: 8 }, (_, i) => i + 1).map((value) => (
            <Flexbox gap={12} key={`skeleton-card-${value}`}>
              <Skeleton width={100} height={100} round={8} disableAspectRatio />
              <Flexbox direction="vertical" gap={5}>
                <Skeleton disableAspectRatio width={150} height={18} />
                <Skeleton disableAspectRatio width={100} height={15} />
                <Skeleton disableAspectRatio width={80} height={21} />
                <Skeleton disableAspectRatio width={80} height={20} />
              </Flexbox>
            </Flexbox>
          ))}
      </Flexbox>
      {isSuccess && ((pages[0]?.page && pages[0].page.content.length !== 0) || !pages[0]) && (
        <Flexbox
          customStyle={{ margin: '36px 0' }}
          alignment="center"
          justifyContent="center"
          direction="vertical"
          ref={targetRef}
        >
          <Typography weight="medium">더 많은 매물을 보고싶으세요?</Typography>
          <Typography variant="small1" customStyle={{ color: common.ui60 }}>
            필터를 재설정해서 더 많은 매물을 볼 수 있어요.
          </Typography>
          <Button
            customStyle={{ marginTop: 20 }}
            size="small"
            onClick={() => {
              logEvent(attrKeys.camelSeller.CLICK_RESET, {
                name: attrProperty.name.MARKET_PRICE,
                title: attrProperty.title.PRODUCT_LIST
              });
              handleClickFilterReset();
            }}
          >
            필터 재설정하기
          </Button>
        </Flexbox>
      )}
    </BottomSheet>
  );
}

const FilterHeaderFix = styled.div`
  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
  padding: 20px 0 20px 20px;
  position: fixed;
  top: 20px;
  left: 0;
  width: 100%;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  z-index: ${({ theme: { zIndex } }) => zIndex.dialog};
`;

export default CamelSellerRecentBottomSheet;
