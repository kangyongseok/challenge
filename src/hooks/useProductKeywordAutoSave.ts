import { useCallback, useEffect } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';

import { ProductKeywordSourceType } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { fetchProductKeywords, postProductKeyword } from '@api/user';
import { fetchSearchOptions } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { orderFilterOptions } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { ProductsVariant } from '@typings/products';
import { productsKeywordAutoSaveTriggerState } from '@recoil/productsKeyword';
import { searchParamsStateFamily } from '@recoil/productsFilter';
import { homeSelectedTabStateFamily } from '@recoil/home';
import { deviceIdState, toastState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function useProductKeywordAutoSave(variant: ProductsVariant) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const deviceId = useRecoilValue(deviceIdState);
  const { searchParams } = useRecoilValue(searchParamsStateFamily(`search-${atomParam}`));
  const { searchParams: searchOptionsParams } = useRecoilValue(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const [productsKeywordAutoSaveTrigger, setProductsKeywordAutoSaveTrigger] = useRecoilState(
    productsKeywordAutoSaveTriggerState
  );
  const setToastState = useSetRecoilState(toastState);
  const resetProductKeyword = useResetRecoilState(homeSelectedTabStateFamily('productKeyword'));

  const { data: accessUser } = useQueryAccessUser();
  const { data: { content: productKeywords = [] } = {} } = useQuery(
    queryKeys.users.userProductKeywords(),
    fetchProductKeywords,
    {
      enabled: !!accessUser
    }
  );
  const {
    data: { userProductKeyword } = {},
    isLoading: isLoadingSearchOptions,
    isFetched: isFetchedSearchOptions
  } = useQuery(
    queryKeys.products.searchOptions(searchOptionsParams),
    () => fetchSearchOptions(searchOptionsParams),
    {
      keepPreviousData: true,
      enabled: Object.keys(searchOptionsParams).length > 0,
      staleTime: 5 * 60 * 1000
    }
  );
  const { mutate } = useMutation(postProductKeyword, {
    onSuccess() {
      logEvent(attrKeys.products.clickMyListAuto, {
        name: 'PRODUCT_LIST',
        att: 'SAVE'
      });
      setToastState({ type: 'productsKeyword', status: 'autoSaved' });
      setProductsKeywordAutoSaveTrigger(false);
      queryClient.invalidateQueries(queryKeys.products.searchOptions(searchOptionsParams));
      resetProductKeyword();
      queryClient.invalidateQueries(queryKeys.users.userProductKeywords());
    }
  });
  const handleRouteChange = useCallback(() => {
    if (
      !!accessUser &&
      !isLoadingSearchOptions &&
      isFetchedSearchOptions &&
      !userProductKeyword &&
      productKeywords.length === 0 &&
      productsKeywordAutoSaveTrigger
    ) {
      logEvent(attrKeys.products.loadMyListSave, {
        name: attrProperty.productName.AUTO
      });

      let sourceType: ProductKeywordSourceType = 0;

      switch (variant) {
        case 'brands': {
          sourceType = 1;
          break;
        }
        case 'categories': {
          sourceType = 3;
          break;
        }
        case 'search':
        default:
          break;
      }

      mutate({
        productSearch: { ...searchParams, deviceId, order: orderFilterOptions[1].order },
        sourceType
      });
    }

    if (
      !!accessUser &&
      !isLoadingSearchOptions &&
      isFetchedSearchOptions &&
      productKeywords.length > 0 &&
      productsKeywordAutoSaveTrigger
    ) {
      setProductsKeywordAutoSaveTrigger(false);
    }
  }, [
    accessUser,
    deviceId,
    isFetchedSearchOptions,
    isLoadingSearchOptions,
    mutate,
    productKeywords.length,
    productsKeywordAutoSaveTrigger,
    searchParams,
    setProductsKeywordAutoSaveTrigger,
    userProductKeyword,
    variant
  ]);

  useEffect(() => {
    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [handleRouteChange, router.events]);
}

export default useProductKeywordAutoSave;
