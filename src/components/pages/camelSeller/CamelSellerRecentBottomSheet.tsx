import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useInfiniteQuery } from 'react-query';
import { BottomSheet, Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { DropDownSelect } from '@components/UI/molecules';
import { Skeleton } from '@components/UI/atoms';

import { SearchParams } from '@dto/product';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchSearchHistory } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { CamelSellerLocalStorage } from '@typings/camelSeller';
import {
  camelSellerBooleanStateFamily,
  camelSellerDialogStateFamily,
  camelSellerEditState,
  camelSellerSubmitState,
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
  const [viewRecentPriceList, setViewRecentPriceList] = useRecoilState(
    camelSellerDialogStateFamily('recentPrice')
  );
  const [camelSeller, setCamelSeller] = useState<CamelSellerLocalStorage>();
  const [fetchData, setFetchData] = useState<SearchParams>({});
  const [filterType, setFilterType] = useState('');
  const [order, setOrder] = useState({ name: '최근 거래순', id: 'postedAllDesc' });
  const resetFilter = useSetRecoilState(camelSellerBooleanStateFamily('filterReset'));
  const recentPriceCardTabNum = useRecoilValue(recentPriceCardTabNumState);
  const submitState = useRecoilValue(camelSellerSubmitState);
  const editData = useRecoilValue(camelSellerEditState);
  const bottomSheetRef = useRef<HTMLDivElement>(null);

  const {
    data: { pages = [] } = {},
    isSuccess,
    isLoading,
    // fetchNextPage,
    isFetchingNextPage
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
    setCamelSeller(editData || (LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitState]);

  useEffect(() => {
    if (viewRecentPriceList.open) {
      logEvent(attrKeys.camelSeller.VIEW_MAKET_PRICE, {
        name: attrProperty.name.PRODUCT_MAIN
      });
    }
  }, [viewRecentPriceList]);

  const handleClickFilterReset = useCallback(() => {
    if (camelSeller) {
      setFetchData({
        brandIds: camelSeller.brand ? [camelSeller.brand.id] : [],
        categoryIds: camelSeller.category ? [camelSeller.category.id] : [],
        keyword: camelSeller.keyword,
        conditionIds: [],
        colorIds: [],
        sizeIds: [],
        order: 'postedAllDesc'
      });
    }
    resetFilter(({ type }) => ({ type, isState: true }));
  }, [camelSeller, resetFilter]);

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

  useEffect(() => {
    if (camelSeller && viewRecentPriceList.open) {
      setFetchData({
        brandIds: camelSeller.brand ? [camelSeller.brand.id] : [],
        categoryIds: camelSeller.category ? [camelSeller.category.id] : [],
        keyword: camelSeller.keyword,
        conditionIds: camelSeller.condition ? [camelSeller.condition.id] : [],
        colorIds: camelSeller.color ? [camelSeller.color.id] : [],
        sizeIds: camelSeller.size ? [camelSeller.size.id] : [],
        order: 'postedAllDesc'
      });
    }
  }, [camelSeller, viewRecentPriceList.open]);

  // useEffect(() => {
  //   if (inView) {
  //     fetchNextPage();
  //   }
  // }, [fetchNextPage, inView]);

  const handleClickFilterSelect = ({ type, id }: { type: string; id: number }) => {
    setFetchData((props) => ({
      ...props,
      [type]: [id]
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
    (isSuccess && pages[0]?.page && pages[0].page.content.length === 0) ||
    (isSuccess && !pages[0]?.page);

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
            {camelSeller?.keyword}
            <Typography weight="bold" variant="h3" customStyle={{ display: 'inline-block' }}>
              의 최근 거래가
            </Typography>
          </Typography>
        </Flexbox>
        <CamelSellerFilter data={pages[0]?.baseSearchOptions} onClick={handleClickFilterSelect} />
      </FilterHeaderFix>
      <Flexbox
        justifyContent="space-between"
        alignment="center"
        customStyle={{ padding: '0 20px', marginTop: 116, height: 52 }}
      >
        {!emptyList && (
          <>
            <DropDownSelect
              borderHidden
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
          </>
        )}
      </Flexbox>
      {!!emptyList && (
        <RecentBottomSheetEmptyResult camelSeller={camelSeller as CamelSellerLocalStorage} />
      )}
      <Flexbox direction="vertical" gap={20} customStyle={{ padding: '0 20px' }}>
        {isLoading &&
          Array.from({ length: 8 }, (_, i) => i + 1).map((value) => (
            <Flexbox gap={12} key={`skeleton-card-${value}`}>
              <Skeleton
                width="100px"
                height="100px"
                customStyle={{ borderRadius: 8 }}
                disableAspectRatio
              />
              <Flexbox direction="vertical" gap={5}>
                <Skeleton disableAspectRatio width="150px" height="18px" />
                <Skeleton disableAspectRatio width="100px" height="15px" />
                <Skeleton disableAspectRatio width="80px" height="21px" />
                <Skeleton disableAspectRatio width="80px" height="20px" />
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
              <Skeleton
                width="100px"
                height="100px"
                customStyle={{ borderRadius: 8 }}
                disableAspectRatio
              />
              <Flexbox direction="vertical" gap={5}>
                <Skeleton disableAspectRatio width="150px" height="18px" />
                <Skeleton disableAspectRatio width="100px" height="15px" />
                <Skeleton disableAspectRatio width="80px" height="21px" />
                <Skeleton disableAspectRatio width="80px" height="20px" />
              </Flexbox>
            </Flexbox>
          ))}
      </Flexbox>
      {isSuccess && pages[0]?.page && pages[0].page.content.length !== 0 && (
        <Flexbox
          customStyle={{ margin: '36px 0' }}
          alignment="center"
          justifyContent="center"
          direction="vertical"
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
