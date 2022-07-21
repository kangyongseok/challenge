import { useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import type { UseMutateFunction, UseQueryResult } from 'react-query';
import { useRouter } from 'next/router';

import type { ProductDetail, ProductParams } from '@dto/product';

import { postProductsAdd, postProductsRemove } from '@api/user';
import { fetchProduct } from '@api/product';

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
    query: { id, redirect, source = PRODUCT_SOURCE.DIRECT }
  } = useRouter();
  const deviceId = useRecoilValue(deviceIdState);
  const productId = Number(id);
  const [params, setParams] = useState<ProductParams>({
    productId,
    deviceId,
    isLogging: true,
    source: typeof source !== 'undefined' ? (source as string) : PRODUCT_SOURCE.DIRECT
  });

  useQuery(queryKeys.products.productLogging(params), () => fetchProduct(params), {
    enabled: !!params.deviceId
  });

  const queryResult = useQuery(
    queryKeys.products.product({ productId: params.productId }),
    async () => {
      const resultProduct = await fetchProduct(params);

      resultProduct.product.viewCount += 1;

      return resultProduct;
    },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
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
            refetchActive: true
          });
        }
      }
    }
  );
  const { mutate: mutatePostProductsAdd } = useMutation(postProductsAdd, {
    onSuccess: () => {
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
