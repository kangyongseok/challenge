import { useEffect, useMemo } from 'react';

import { useRecoilValue } from 'recoil';
import { useInfiniteQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox } from 'mrcamel-ui';

import UserShopProductCardSkeleton from '@components/UI/molecules/Skeletons/UserShopProductCardSkeleton';

import { fetchUserProducts } from '@api/user';

import queryKeys from '@constants/queryKeys';

import { toastState } from '@recoil/common';

import UserShopProductCard from './UserShopProductCard';
import UserShopEmpty from './UserShopEmpty';

function UserShopProductList() {
  const router = useRouter();
  const { tab = '0' }: { tab?: string } = router.query;
  const setToastState = useRecoilValue(toastState);
  const params = useMemo(
    () => ({
      page: 0,
      status: tab === '0' ? [Number(tab || 0), 4] : [1]
    }),
    [tab]
  );

  const {
    data: { pages = [] } = {},
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery(
    queryKeys.users.products(params),
    ({ pageParam = 0 }) =>
      fetchUserProducts({
        ...params,
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

  const products = useMemo(() => pages.map(({ content }) => content).flat(), [pages]);

  useEffect(() => {
    const handleScroll = async () => {
      const { scrollHeight, scrollTop, clientHeight } = document.documentElement;

      const isFloor = scrollTop + clientHeight >= scrollHeight;

      if (hasNextPage && !isFetchingNextPage && isFloor) {
        await fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (setToastState.status) {
      refetch();
    }
  }, [setToastState, refetch]);

  return (
    <Flexbox component="section" direction="vertical" gap={20} customStyle={{ margin: '20px 0' }}>
      {!isLoading && products.length === 0 && <UserShopEmpty />}
      {isLoading &&
        Array.from({ length: 20 }).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <UserShopProductCardSkeleton key={`user-shop-product-skeleton-${index}`} />
        ))}
      {!isLoading &&
        products.map((product) => (
          <UserShopProductCard key={`user-shop-product-${product.id}`} product={product} />
        ))}
    </Flexbox>
  );
}

export default UserShopProductList;
