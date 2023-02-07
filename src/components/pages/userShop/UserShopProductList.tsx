/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useEffect, useMemo } from 'react';

import { useRecoilValue } from 'recoil';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  List,
  WindowScroller
} from 'react-virtualized';
import type { Index, ListRowProps } from 'react-virtualized';
import { useRouter } from 'next/router';
import { Box, Flexbox } from 'mrcamel-ui';
import type {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters
} from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';

import SelectTargetUserBottomSheet from '@components/UI/organisms/SelectTargetUserBottomSheet';
import NewProductListCardSkeleton from '@components/UI/molecules/Skeletons/NewProductListCardSkeleton';
import { NewProductListCard } from '@components/UI/molecules';

import type { UserInfo } from '@dto/user';
import type { ProductResult } from '@dto/product';

import LocalStorage from '@library/localStorage';

import { fetchUserProducts } from '@api/user';

import { productSellerType } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { productStatusCode } from '@constants/product';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';

import type { SavedLegitDataProps } from '@typings/product';
import { userShopSelectedProductState } from '@recoil/userShop';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import UserShopProductSoldOutConfirmBottomSheet from './UserShopProductSoldOutConfirmBottomSheet';
import UserShopProductManageBottomSheet from './UserShopProductManageBottomSheet';
import UserShopProductActionBanner from './UserShopProductActionBanner';
import UserShopEmpty from './UserShopEmpty';

const cache = new CellMeasurerCache({
  fixedWidth: true
});

interface UserShopProductListProps {
  tab: string;
  refreshInfoByUserId: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<UserInfo, unknown>>;
}

function UserShopProductList({ tab, refreshInfoByUserId }: UserShopProductListProps) {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();
  const getSavedLegitData: SavedLegitDataProps | null = LocalStorage.get(
    String(accessUser?.userId)
  );
  const { id: productId } = useRecoilValue(userShopSelectedProductState);

  const userProductsParams = useMemo(
    () => ({
      page: 0,
      status: tab === '0' ? [Number(tab || 0), 4, 8] : [1]
    }),
    [tab]
  );

  const {
    data: { pages = [] } = {},
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch: refetchUserProducts
  } = useInfiniteQuery(
    queryKeys.users.products(userProductsParams),
    ({ pageParam = 0 }) =>
      fetchUserProducts({
        ...userProductsParams,
        page: pageParam
      }),
    {
      refetchOnMount: 'always',
      getNextPageParam: (data) => {
        const { number = 0, totalPages = 0 } = data || {};

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  const contents = useMemo(() => pages.flatMap(({ content }) => content), [pages]);

  const handleProductAtt = (product: ProductResult, i: number) => {
    return {
      name: attrProperty.name.USER_SHOP,
      title: attrProperty.title.PRODUCT,
      index: i + 1,
      id: product.id,
      brand: product.brand.name,
      category: product.category.name,
      parentCategory: FIRST_CATEGORIES[product.category.parentId as number],
      site: product.site.name,
      price: product.price,
      source: attrProperty.source.USER_SHOP_PRODUCT,
      sellerType: product.sellerType,
      productSellerId: product.productSeller.id,
      productSellerType: product.productSeller.type,
      productSellerAccount: product.productSeller.account,
      useChat: product.sellerType !== productSellerType.collection
    };
  };

  const loadMoreRows = async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    await fetchNextPage();
  };

  const handleResize = useCallback(() => {
    cache.clearAll();
  }, []);

  const rowRenderer = useCallback(
    ({ key, index, parent, style }: ListRowProps) => {
      const shopBannerList = contents[index].labels?.filter((label) => label.codeId === 17);
      const isSale = contents[index].status === productStatusCode.sale;
      const isSavedLegitRequest =
        getSavedLegitData?.savedLegitRequest?.state?.productId === contents[index].id;

      return (
        // @ts-ignore
        <CellMeasurer cache={cache} parent={parent} key={key} columnIndex={0} rowIndex={index}>
          {({ registerChild }) => (
            <Box
              ref={(ref) => {
                if (ref && registerChild) registerChild(ref);
              }}
              style={style}
            >
              <NewProductListCard
                key={`user-shop-product-list-${contents[index].id}`}
                variant="listA"
                product={contents[index]}
                attributes={handleProductAtt(contents[index], index)}
                hideLabel
                hideWishButton
                showShopManageButton
              />
              {(!!shopBannerList?.length || isSavedLegitRequest) && isSale ? (
                <UserShopProductActionBanner
                  labelId={isSavedLegitRequest ? 0 : shopBannerList[0].id}
                  productId={contents[index].id}
                  savedLegitData={getSavedLegitData?.savedLegitRequest?.state}
                  synonyms={shopBannerList[0]?.synonyms || ''}
                  attributes={handleProductAtt(contents[index], index)}
                />
              ) : (
                <Box customStyle={{ height: 32 }} />
              )}
            </Box>
          )}
        </CellMeasurer>
      );
    },
    [contents, getSavedLegitData?.savedLegitRequest]
  );

  useEffect(() => {
    cache.clearAll();
  }, [router, pages]);

  const handleUpdateProductStatus = useCallback(async () => {
    await refreshInfoByUserId();
    await refetchUserProducts();
    cache.clearAll();
  }, [refetchUserProducts, refreshInfoByUserId]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return !isLoading && contents.length === 0 ? (
    <UserShopEmpty tab={tab} />
  ) : (
    <Flexbox
      direction="vertical"
      component="section"
      gap={20}
      customStyle={{ padding: '20px 20px 100px 20px' }}
    >
      {isLoading ? (
        <Flexbox direction="vertical" gap={32}>
          {Array.from(new Array(6), (_, index) => (
            <NewProductListCardSkeleton key={`product-list-card-skeleton-${index}`} />
          ))}
        </Flexbox>
      ) : (
        // @ts-ignore
        <InfiniteLoader
          isRowLoaded={(params: Index) => !!contents[params.index]}
          loadMoreRows={loadMoreRows}
          rowCount={hasNextPage ? contents.length + 10 : contents.length}
        >
          {({ registerChild, onRowsRendered }) => (
            // @ts-ignore
            <WindowScroller>
              {({ height, isScrolling, scrollTop }) => (
                // @ts-ignore
                <AutoSizer disableHeight onResize={handleResize}>
                  {({ width }) => (
                    // @ts-ignore
                    <List
                      ref={registerChild}
                      onRowsRendered={onRowsRendered}
                      autoHeight
                      width={width}
                      height={height}
                      isScrolling={isScrolling}
                      scrollTop={scrollTop}
                      rowCount={contents.length}
                      rowHeight={cache.rowHeight}
                      rowRenderer={rowRenderer}
                      deferredMeasurementCache={cache}
                    />
                  )}
                </AutoSizer>
              )}
            </WindowScroller>
          )}
        </InfiniteLoader>
      )}
      <UserShopProductManageBottomSheet refetchData={handleUpdateProductStatus} />
      {!!productId && <SelectTargetUserBottomSheet productId={productId} />}
      <UserShopProductSoldOutConfirmBottomSheet />
    </Flexbox>
  );
}

export default UserShopProductList;
