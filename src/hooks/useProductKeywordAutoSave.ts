import { useCallback, useEffect } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';

import type { ProductKeywordSourceType } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { fetchProductKeywords, postProductKeyword } from '@api/user';
import { fetchSearchOptions } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { filterCodeIds, orderFilterOptions } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { ProductsVariant } from '@typings/products';
import { productsKeywordAutoSaveTriggerState } from '@recoil/productsKeyword';
import { filterOperationInfoSelector, searchParamsStateFamily } from '@recoil/productsFilter';
import { homeSelectedTabStateFamily } from '@recoil/home';
import { deviceIdState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function useProductKeywordAutoSave(variant: ProductsVariant) {
  const router = useRouter();

  const toastStack = useToastStack();

  const queryClient = useQueryClient();
  const atomParam = router.asPath.split('?')[0];
  const { selectedSearchOptionsHistory } = useRecoilValue(filterOperationInfoSelector);
  const deviceId = useRecoilValue(deviceIdState);
  const { searchParams } = useRecoilValue(searchParamsStateFamily(`search-${atomParam}`));
  const { searchParams: searchOptionsParams } = useRecoilValue(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const [productsKeywordAutoSaveTrigger, setProductsKeywordAutoSaveTrigger] = useRecoilState(
    productsKeywordAutoSaveTriggerState
  );
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
      toastStack({
        children: '홈에서 바로 볼 수 있게 검색 목록을 저장했어요!'
      });
      setProductsKeywordAutoSaveTrigger(false);
      queryClient.invalidateQueries(queryKeys.products.searchOptions(searchOptionsParams));
      resetProductKeyword();
      queryClient.invalidateQueries(queryKeys.users.userProductKeywords());
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
        selectedSearchOptionsHistory.length > 0 &&
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

        const isOnlyGender =
          selectedSearchOptionsHistory.filter(({ codeId }) => codeId !== filterCodeIds.gender)
            .length === 0;

        // 브랜드 매물 목록의 경우 성별이 기본으로 설정되어 있으므로 필터가 성별만 선택되어 있는 경우 자동 저장을 하지 않음
        // 단, 남성/여성 성별 필터 모두를 선택했거나, 로그인된 유저의 성별과 다른 성별 필터가 적용되어 있는 경우는 제외
        if (variant === 'brands' && isOnlyGender && selectedSearchOptionsHistory.length === 1) {
          return;
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
        productsKeywordAutoSaveTrigger &&
        selectedSearchOptionsHistory.length > 0
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
      selectedSearchOptionsHistory,
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
