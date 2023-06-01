import { useCallback, useEffect } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ProductKeywordSourceType } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { fetchProductKeywords, postProductKeyword } from '@api/user';
import { fetchSearchOptions } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { orderFilterOptions } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { ProductsVariant } from '@typings/products';
import { productsKeywordAutoSaveTriggerState } from '@recoil/productsKeyword';
import { searchParamsStateFamily } from '@recoil/productsFilter';
import { deviceIdState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function useProductKeywordAutoSave(variant: ProductsVariant) {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const { data: accessUser } = useQueryAccessUser();
  const queryClient = useQueryClient();

  const deviceId = useRecoilValue(deviceIdState);
  const { searchParams } = useRecoilValue(searchParamsStateFamily(`search-${atomParam}`));
  const { searchParams: searchOptionsParams } = useRecoilValue(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const [productsKeywordAutoSaveTrigger, setProductsKeywordAutoSaveTrigger] = useRecoilState(
    productsKeywordAutoSaveTriggerState
  );

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
    async onSuccess() {
      logEvent(attrKeys.products.clickMyListAuto, {
        name: 'PRODUCT_LIST',
        att: 'SAVE'
      });
      setProductsKeywordAutoSaveTrigger(false);
      await queryClient.invalidateQueries(queryKeys.products.searchOptions(searchOptionsParams));
      await queryClient.invalidateQueries(queryKeys.users.userProductKeywords());
    }
  });
  const handleRouteChange = useCallback(
    (url: string) => {
      if (
        !!accessUser &&
        !isLoadingSearchOptions &&
        isFetchedSearchOptions &&
        !userProductKeyword &&
        productsKeywordAutoSaveTrigger &&
        url.indexOf('/products') === -1
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
    },
    [
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
    ]
  );

  useEffect(() => {
    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [handleRouteChange, router.events]);

  useEffect(() => {
    setProductsKeywordAutoSaveTrigger(true);
  }, [setProductsKeywordAutoSaveTrigger]);
}

export default useProductKeywordAutoSave;
