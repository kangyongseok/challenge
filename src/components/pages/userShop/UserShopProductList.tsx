import { useCallback, useEffect, useMemo } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import type {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters
} from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Box, Flexbox } from '@mrcamelhub/camel-ui';

import SelectTargetUserBottomSheet from '@components/UI/organisms/SelectTargetUserBottomSheet';
import NewProductListCardSkeleton from '@components/UI/molecules/Skeletons/NewProductListCardSkeleton';
import { NewProductListCard } from '@components/UI/molecules';

import type { UserInfo } from '@dto/user';
import type { ProductResult } from '@dto/product';

import LocalStorage from '@library/localStorage';

import { fetchUserProducts } from '@api/user';

import { productType } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { productStatusCode } from '@constants/product';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';

import type { SavedLegitDataProps } from '@typings/product';
import { userShopOpenStateFamily, userShopSelectedProductState } from '@recoil/userShop';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useDetectScrollFloorTrigger from '@hooks/useDetectScrollFloorTrigger';

import UserShopProductSoldOutConfirmBottomSheet from './UserShopProductSoldOutConfirmBottomSheet';
import UserShopProductManageBottomSheet from './UserShopProductManageBottomSheet';
import UserShopProductActionBanner from './UserShopProductActionBanner';
import UserShopEmpty from './UserShopEmpty';

interface UserShopProductListProps {
  tab: string;
  refreshInfoByUserId: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<UserInfo, unknown>>;
}

function UserShopProductList({ tab, refreshInfoByUserId }: UserShopProductListProps) {
  const { data: accessUser } = useQueryAccessUser();
  const getSavedLegitData: SavedLegitDataProps | null = LocalStorage.get(
    String(accessUser?.userId)
  );

  const { id: productId } = useRecoilValue(userShopSelectedProductState);

  const setUserShopSelectedProductState = useSetRecoilState(userShopSelectedProductState);
  const setOpenState = useSetRecoilState(userShopOpenStateFamily('manage'));

  const { triggered } = useDetectScrollFloorTrigger();

  const userProductsParams = useMemo(
    () => ({
      page: 0,
      status: tab === '0' ? [Number(tab || 0), 4, 8, 20, 21] : [1]
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
      useChat: product.sellerType !== productType.collection
    };
  };

  const handleUpdateProductStatus = useCallback(async () => {
    await refreshInfoByUserId();
    await refetchUserProducts();
  }, [refetchUserProducts, refreshInfoByUserId]);

  const handleClickManageProduct = useCallback(
    (product: ProductResult) => {
      setUserShopSelectedProductState(product);
      setOpenState(({ type: stateType }) => ({
        type: stateType,
        open: true
      }));
    },
    [setOpenState, setUserShopSelectedProductState]
  );

  useEffect(() => {
    if (triggered && !isFetchingNextPage && hasNextPage) fetchNextPage().then();
  }, [fetchNextPage, triggered, hasNextPage, isFetchingNextPage]);

  return !isLoading && contents.length === 0 ? (
    <UserShopEmpty tab={tab} />
  ) : (
    <>
      <Flexbox direction="vertical" component="section" gap={32} customStyle={{ padding: 20 }}>
        {isLoading ? (
          <Flexbox direction="vertical" gap={32}>
            {Array.from(new Array(6), (_, index) => (
              <NewProductListCardSkeleton key={`product-list-card-skeleton-${index}`} />
            ))}
          </Flexbox>
        ) : (
          contents.map((product, index) => {
            const shopBannerList = product.labels?.filter((label) => label.codeId === 17);
            const isSale = product.status === productStatusCode.forSale;
            // 카멜에서 수정/삭제 등이 가능한 매물 (카멜에서 업로드한 매물 포함)
            // TODO 너무 헷갈린다.. 네이밍도 어렵고.. 추후 보완
            const isTransferred =
              (product.productSeller?.type === 0 && product.productSeller?.site.id === 34) ||
              product.productSeller.type === 4 ||
              product.productSeller.type === 3;
            const isSavedLegitRequest =
              getSavedLegitData?.savedLegitRequest?.state?.productId === product.id;

            return (
              <Box key={`user-shop-product-list-${product.id}`}>
                <NewProductListCard
                  variant="listA"
                  product={product}
                  attributes={handleProductAtt(product, index)}
                  hidePlatformLogo={isTransferred}
                  hideLabel
                  hideWishButton
                  showShopManageButton
                  onClickManageProduct={() => handleClickManageProduct(product)}
                />
                {(!!shopBannerList?.length || isSavedLegitRequest) &&
                  (isSale || !isTransferred) && (
                    <UserShopProductActionBanner
                      labelId={isSavedLegitRequest ? 0 : shopBannerList[0].id}
                      productId={contents[index].id}
                      savedLegitData={getSavedLegitData?.savedLegitRequest?.state}
                      synonyms={shopBannerList[0]?.synonyms || ''}
                      attributes={handleProductAtt(contents[index], index)}
                    />
                  )}
              </Box>
            );
          })
        )}
      </Flexbox>
      <UserShopProductManageBottomSheet refetchData={handleUpdateProductStatus} />
      {!!productId && <SelectTargetUserBottomSheet productId={productId} />}
      <UserShopProductSoldOutConfirmBottomSheet />
    </>
  );
}

export default UserShopProductList;
