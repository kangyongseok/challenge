import { useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseMutateFunction, UseQueryResult } from '@tanstack/react-query';

import type { ProductDetail, ProductParams } from '@dto/product';

import UserTraceRecord from '@library/userTraceRecord';
import SessionStorage from '@library/sessionStorage';

import { postProductsAdd, postProductsRemove } from '@api/user';
import { fetchProduct } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { PRODUCT_SOURCE } from '@constants/product';

import { deviceIdState } from '@recoil/common';

export type MetaInfoMutateParams = Partial<
  Record<'isAddViewCount' | 'isAddWish' | 'isRemoveWish' | 'isAddPurchaseCount', boolean>
>;

export type UseQueryProductResult = {
  mutatePostProductsAdd: () => void;
  mutatePostProductsRemove: () => void;
  mutateMetaInfo: UseMutateFunction<
    ProductDetail | undefined,
    unknown,
    MetaInfoMutateParams,
    unknown
  >;
} & UseQueryResult<ProductDetail, unknown>;

function useQueryProduct(): UseQueryProductResult {
  const queryClient = useQueryClient();
  const {
    query: { id, redirect }
  } = useRouter();
  const { source } =
    SessionStorage.get<{ source?: string }>(sessionStorageKeys.productDetailEventProperties) || {};
  const deviceId = useRecoilValue(deviceIdState);
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);
  const [params, setParams] = useState<ProductParams>({
    productId,
    deviceId,
    isLogging: true,
    source: source || PRODUCT_SOURCE.DIRECT
  });

  // useQuery(queryKeys.products.productLogging(params), () => fetchProduct(params), {
  //   enabled: !!params.deviceId
  // });

  const queryResult = useQuery(
    queryKeys.products.product({ productId: params.productId }),
    async () => {
      const resultProduct = await fetchProduct(params);

      resultProduct.product.viewCount += 1;

      return resultProduct;
    },
    {
      refetchOnMount: true,
      retry: 2,
      enabled: !!params.deviceId
    }
  );

  const { mutate: mutateMetaInfo } = useMutation(
    async ({
      isAddWish,
      isRemoveWish,
      isAddPurchaseCount,
      isAddViewCount
    }: MetaInfoMutateParams) => {
      const newData = queryResult.data;

      if (newData) {
        if (isAddViewCount) {
          newData.product.viewCount += 1;
        }

        if (isAddWish) {
          newData.wish = true;
          newData.product.wishCount += 1;
        }

        if (isRemoveWish) {
          newData.wish = false;
          newData.product.wishCount -= 1;
        }

        if (isAddPurchaseCount) {
          newData.product.purchaseCount += 1;
        }
      }

      return newData;
    },
    {
      onSuccess: (result) => {
        queryClient.setQueryData(
          queryKeys.products.product({ productId: params.productId }),
          result
        );
      },
      onSettled: (_, __, { isAddWish, isRemoveWish }) => {
        if (isAddWish || isRemoveWish) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.users.categoryWishes({ deviceId: params.deviceId }),
            refetchType: 'active'
          });
        }
      }
    }
  );
  const { mutate: mutatePostProductsAdd } = useMutation(postProductsAdd, {
    onSuccess: () => {
      UserTraceRecord.setExitWishChannel();
      mutateMetaInfo({ isAddWish: true });
    }
  });
  const { mutate: mutatePostProductsRemove } = useMutation(postProductsRemove, {
    onSuccess: () => {
      mutateMetaInfo({ isRemoveWish: true });
    }
  });

  useEffect(() => {
    const newParams = { ...params };

    if (params.productId !== productId) {
      newParams.productId = productId;
    }

    if (typeof redirect !== 'undefined' && params.redirect !== Boolean(redirect)) {
      newParams.redirect = Boolean(redirect);
    }

    if (typeof source !== 'undefined' && params.source !== source) {
      newParams.source = source as string;
    }

    if (deviceId !== params.deviceId) {
      newParams.deviceId = deviceId;
    }

    setParams(newParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, redirect, source, deviceId]);

  return {
    ...queryResult,
    mutatePostProductsAdd: () => {
      mutatePostProductsAdd({
        productId,
        deviceId: params.deviceId
      });
    },
    mutatePostProductsRemove: () => {
      mutatePostProductsRemove({
        productId,
        deviceId: params.deviceId
      });
    },
    mutateMetaInfo
  };
}

export default useQueryProduct;
