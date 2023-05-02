import { useCallback, useEffect, useRef, useState } from 'react';
import type { UIEvent } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import {
  BottomSheet,
  Box,
  Button,
  Flexbox,
  Icon,
  Skeleton,
  Typography,
  useTheme
} from 'mrcamel-ui';
import { isEmpty } from 'lodash-es';
import styled from '@emotion/styled';

import type { RecentSearchParams } from '@dto/product';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';

import {
  camelSellerBooleanStateFamily,
  camelSellerDialogStateFamily,
  camelSellerModifiedPriceState,
  camelSellerRecentPriceCardTabNumState,
  camelSellerTempSaveDataState
} from '@recoil/camelSeller';
import useQuerySearchHistory from '@hooks/useQuerySearchHistory';
import useDebounce from '@hooks/useDebounce';

import RecentBottomSheetEmptyResult from './RecentBottomSheetEmptyResult';
import CamelSellerProductCard from './CamelSellerProductCard';
import CamelSellerFilter from './CamelSellerFilter';

function CamelSellerRecentBottomSheet() {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const { beforePopState, push, asPath } = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [viewRecentPriceList, setViewRecentPriceList] = useRecoilState(
    camelSellerDialogStateFamily('recentPrice')
  );
  const [open, setOpen] = useState(false);
  const [fetchData, setFetchData] = useState<RecentSearchParams>({});
  const resetFilter = useSetRecoilState(camelSellerBooleanStateFamily('filterReset'));
  const setCamelSellerModifiedPriceState = useSetRecoilState(camelSellerModifiedPriceState);
  const recentPriceCardTabNum = useRecoilValue(camelSellerRecentPriceCardTabNumState);
  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);

  const debouncedOpen = useDebounce(open, 300);
  const {
    infinitQuery: { pages, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage, status }
  } = useQuerySearchHistory({ fetchData, type: 'infinit' });

  const lastPage = pages[pages.length - 1];
  const {
    productTotal = 0,
    avgPrice = 0,
    avgLatency = 0,
    minLatencyPrice = 0,
    minLatency = 0
  } = lastPage?.searchOptions || {};

  const handleClickFilterReset = useCallback(() => {
    if (tempData) {
      setFetchData({
        brandIds: tempData.brandIds,
        categoryIds: tempData.category.id ? [tempData.category.id] : [],
        keyword: tempData.title,
        conditionIds: [],
        colorIds: [],
        sizeIds: [],
        order: 'postedAllDesc'
      });
    }
    resetFilter(({ type }) => ({ type, isState: true }));
  }, [tempData, resetFilter]);

  const handleClickFilterSelect = ({ type, id }: { type: string; id: number }) => {
    setFetchData((props) => ({
      ...props,
      [type]: id ? [id] : []
    }));
  };

  const handleClickFilterResetButton = () => {
    logEvent(attrKeys.camelSeller.CLICK_RESET, {
      name: attrProperty.name.MARKET_PRICE,
      title: attrProperty.title.PRODUCT_LIST
    });
    handleClickFilterReset();
  };

  const handleScroll = useCallback(
    async (e: UIEvent<HTMLDivElement>) => {
      const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;

      const isFloor = scrollTop + clientHeight >= scrollHeight;

      if (hasNextPage && !isFetchingNextPage && isFloor) await fetchNextPage();
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const handleClose = () => {
    setViewRecentPriceList(({ type }) => ({ type, open: false }));
    handleClickFilterReset();
  };

  const handleClick = (price: number, title: string) => () => {
    logEvent(attrKeys.camelSeller.CLICK_MARKET_PRICE, {
      name: attrProperty.name.MARKET_PRICE,
      title,
      price
    });

    setTempData({
      ...tempData,
      price
    });
    setCamelSellerModifiedPriceState(price);
    setViewRecentPriceList(({ type }) => ({ type, open: false }));
  };

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
  }, [beforePopState, push, viewRecentPriceList.open]);

  useEffect(() => {
    if (viewRecentPriceList.open) {
      logEvent(attrKeys.camelSeller.VIEW_MARKET_PRICE, {
        name: attrProperty.name.PRODUCT_MAIN
      });
    }
  }, [viewRecentPriceList.open]);

  useEffect(() => {
    if (viewRecentPriceList.open) {
      let newKeyword = tempData.title;
      if (!newKeyword && tempData.brand.name && tempData.category.name) {
        newKeyword = `${tempData.brand.name} ${tempData.category.name}`;
      }
      setFetchData({
        brandIds: tempData.brandIds || [],
        categoryIds: tempData.category.id ? [tempData.category.id] : [],
        subParentIds: tempData.category.subParentId ? [tempData.category.subParentId] : [],
        keyword: newKeyword,
        conditionIds: tempData.condition.id ? [tempData.condition.id] : [],
        categorySizeIds: tempData.categorySizeIds,
        order: 'postedAllDesc' // updatedDesc
      });
    }
  }, [
    tempData.brandIds,
    tempData.category.id,
    tempData.category.subParentId,
    tempData.condition.id,
    tempData.categorySizeIds,
    tempData.brand.name,
    tempData.category.name,
    tempData.size.id,
    viewRecentPriceList.open,
    tempData.title
  ]);

  useEffect(() => {
    if (debouncedOpen && dialogRef.current && recentPriceCardTabNum && !isLoading) {
      const { children } = dialogRef.current;
      const { children: contentChildren } = children[0];
      const { id } = recentPriceCardTabNum;

      Array.from(contentChildren[0].getElementsByClassName(`recent-product-${id}`)).forEach(
        (element) => {
          contentChildren[0].scrollTo({
            top: ((element as HTMLDivElement).offsetTop || 0) - 160, // -Header
            behavior: 'smooth'
          });
        }
      );
    }
  }, [debouncedOpen, recentPriceCardTabNum, isLoading]);

  useEffect(() => {
    setOpen(viewRecentPriceList.open);
  }, [viewRecentPriceList.open]);

  useEffect(() => {
    if (viewRecentPriceList.open) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.removeAttribute('style');
    }
  }, [viewRecentPriceList.open]);

  return (
    <BottomSheet
      ref={dialogRef}
      fullScreen
      open={viewRecentPriceList.open}
      onClose={handleClose}
      onScroll={handleScroll}
      disableSwipeable
    >
      <FilterHeaderFix>
        <Typography>{`${
          pages[0]?.baseSearchOptions?.searchKeyword ||
          `${tempData.brand.name} ${tempData.category.name}`
        }`}</Typography>
        <Flexbox justifyContent="space-between" alignment="center" customStyle={{ marginTop: 8 }}>
          <Typography weight="bold" variant="h2">
            최근 실거래가
          </Typography>
          <Typography customStyle={{ color: common.ui60 }}>최근 6개월 기준</Typography>
        </Flexbox>
        <CamelSellerFilter
          onClick={handleClickFilterSelect}
          onClickReset={handleClickFilterReset}
          fetchData={fetchData}
          baseSearchInfinitData={pages[0]?.baseSearchOptions || null}
          searchInfinitData={pages[0]?.searchOptions || null}
        />
      </FilterHeaderFix>
      {(status === 'error' || (!isLoading && !lastPage)) && (
        <RecentBottomSheetEmptyResult
          title={tempData.quoteTitle || `${tempData.brand.name} ${tempData.category.name}`}
        />
      )}
      <Flexbox
        direction="vertical"
        gap={20}
        customStyle={{ marginTop: 160, padding: '0 20px 20px' }}
      >
        {isLoading && (
          <>
            <Skeleton width="100%" height={125} round={8} disableAspectRatio />
            <Skeleton width="100%" height={125} round={8} disableAspectRatio />
          </>
        )}
        {isLoading &&
          Array.from({ length: 8 }, (_, i) => i + 1).map((value) => (
            <Flexbox gap={16} key={`skeleton-card-${value}`}>
              <Box
                customStyle={{
                  minWidth: 100
                }}
              >
                <Skeleton ratio="5:6" round={8} />
              </Box>
              <Box>
                <Flexbox gap={4} alignment="baseline">
                  <Skeleton width={70} height={24} round={8} disableAspectRatio />
                  <Skeleton width={70} height={16} round={8} disableAspectRatio />
                </Flexbox>
                <Skeleton
                  width={80}
                  height={12}
                  round={8}
                  disableAspectRatio
                  customStyle={{
                    marginTop: 8
                  }}
                />
                <Skeleton
                  width={112}
                  height={36}
                  round={8}
                  disableAspectRatio
                  customStyle={{
                    marginTop: 12
                  }}
                />
              </Box>
            </Flexbox>
          ))}
        {!isLoading && productTotal > 5 && (
          <>
            {!!avgPrice && (
              <Box
                customStyle={{
                  padding: 20,
                  borderRadius: 8,
                  backgroundColor: common.bg02
                }}
              >
                <Flexbox gap={20} alignment="center" justifyContent="space-between">
                  <Flexbox direction="vertical" gap={4}>
                    <Typography
                      variant="body2"
                      weight="medium"
                      customStyle={{
                        color: primary.light
                      }}
                    >
                      최근 실거래가의 평균이에요.
                    </Typography>
                    <Flexbox gap={4} alignment="baseline">
                      <Typography variant="h3" weight="bold">
                        {getTenThousandUnitPrice(avgPrice)}만원
                      </Typography>
                      <Typography
                        variant="body2"
                        customStyle={{
                          color: common.ui60
                        }}
                      >
                        예상 판매기간 {avgLatency}일
                      </Typography>
                    </Flexbox>
                  </Flexbox>
                  <Button
                    variant="solid"
                    brandColor="white"
                    onClick={handleClick(avgPrice, 'LAST_PRICE')}
                    customStyle={{
                      whiteSpace: 'nowrap'
                    }}
                  >
                    이 가격으로 판매
                  </Button>
                </Flexbox>
                <Box
                  customStyle={{
                    height: 1,
                    margin: '12px 0',
                    backgroundColor: common.line01
                  }}
                />
                <Flexbox gap={4}>
                  <Icon name="BangCircleFilled" width={16} height={16} color="ui60" />
                  <Typography
                    variant="body2"
                    customStyle={{
                      color: common.ui60
                    }}
                  >
                    적당한 가격을 원한다면 이 가격으로 판매해보세요.
                  </Typography>
                </Flexbox>
              </Box>
            )}
            {!!minLatencyPrice && (
              <Box
                customStyle={{
                  padding: 20,
                  borderRadius: 8,
                  backgroundColor: common.bg02
                }}
              >
                <Flexbox gap={20} alignment="center" justifyContent="space-between">
                  <Flexbox direction="vertical" gap={4}>
                    <Typography
                      variant="body2"
                      weight="medium"
                      customStyle={{
                        color: primary.light
                      }}
                    >
                      가장 빨리 팔리는 가격이에요!
                    </Typography>
                    <Flexbox gap={4} alignment="baseline">
                      <Typography variant="h3" weight="bold">
                        {getTenThousandUnitPrice(minLatencyPrice)}
                        만원
                      </Typography>
                      <Typography
                        variant="body2"
                        customStyle={{
                          color: common.ui60
                        }}
                      >
                        예상 판매기간 {minLatency}일
                      </Typography>
                    </Flexbox>
                  </Flexbox>
                  <Button
                    variant="solid"
                    brandColor="white"
                    onClick={handleClick(minLatencyPrice, 'FAST_PRICE')}
                    customStyle={{
                      whiteSpace: 'nowrap'
                    }}
                  >
                    이 가격으로 판매
                  </Button>
                </Flexbox>
                <Box
                  customStyle={{
                    height: 1,
                    margin: '12px 0',
                    backgroundColor: common.line01
                  }}
                />
                <Flexbox gap={4}>
                  <Icon name="BangCircleFilled" width={16} height={16} color="ui60" />
                  <Typography
                    variant="body2"
                    customStyle={{
                      color: common.ui60
                    }}
                  >
                    구매자가 가장 만족스러워하는 가격이에요.
                  </Typography>
                </Flexbox>
              </Box>
            )}
          </>
        )}
        {!isLoading &&
          pages.map(({ page }) => {
            return page?.content?.map((item) => (
              <CamelSellerProductCard data={item} key={`product-card-${item.id}`} />
            ));
          })}
        {isFetchingNextPage &&
          Array.from({ length: 8 }, (_, i) => i + 1).map((value) => (
            <Flexbox gap={16} key={`next-skeleton-card-${value}`}>
              <Box
                customStyle={{
                  minWidth: 100
                }}
              >
                <Skeleton ratio="5:6" round={8} />
              </Box>
              <Box>
                <Flexbox gap={4} alignment="baseline">
                  <Skeleton width={70} height={24} round={8} disableAspectRatio />
                  <Skeleton width={70} height={16} round={8} disableAspectRatio />
                </Flexbox>
                <Skeleton
                  width={80}
                  height={12}
                  round={8}
                  disableAspectRatio
                  customStyle={{
                    marginTop: 8
                  }}
                />
                <Skeleton
                  width={112}
                  height={36}
                  round={8}
                  disableAspectRatio
                  customStyle={{
                    marginTop: 12
                  }}
                />
              </Box>
            </Flexbox>
          ))}
      </Flexbox>
      {!isLoading &&
        !hasNextPage &&
        (!isEmpty(fetchData.sizeIds) || !isEmpty(fetchData.conditionIds)) && (
          <Box
            customStyle={{
              margin: '32px 0',
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" weight="medium">
              더 많은 매물정보를 보고싶으세요?
            </Typography>
            <Typography
              customStyle={{
                marginTop: 4
              }}
            >
              필터를 재설정해서 더 많은 매물을 볼 수 있어요.
            </Typography>
            <Button
              variant="ghost"
              brandColor="black"
              onClick={handleClickFilterResetButton}
              customStyle={{
                margin: '20px auto 0'
              }}
            >
              필터 초기화
            </Button>
          </Box>
        )}
    </BottomSheet>
  );
}

const FilterHeaderFix = styled.div`
  padding: 32px 20px 20px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  max-height: 160px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  z-index: ${({ theme: { zIndex } }) => zIndex.dialog};
  border-radius: 16px 16px 0 0;
`;

export default CamelSellerRecentBottomSheet;
