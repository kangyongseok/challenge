import { useEffect } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';
import { Flexbox } from '@mrcamelhub/camel-ui';

import { NewProductListCardSkeleton } from '@components/UI/molecules';
import { MypageOrdersCard } from '@components/pages/mypageOrders';

import { fetchOrderSearch } from '@api/order';

import queryKeys from '@constants/queryKeys';

import useSession from '@hooks/useSession';
import useDetectScrollFloorTrigger from '@hooks/useDetectScrollFloorTrigger';

function NonMemberOrdersHistoryPanel() {
  const { triggered } = useDetectScrollFloorTrigger();

  const { isLoggedInWithSMS } = useSession();

  const {
    data: { pages = [] } = {},
    isInitialLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useInfiniteQuery(
    queryKeys.orders.orderSearch({
      type: 0,
      isConfirmed: false,
      page: 0
    }),
    ({ pageParam = 0 }) =>
      fetchOrderSearch({
        type: 0,
        isConfirmed: false,
        page: pageParam
      }),
    {
      getNextPageParam: (data) => {
        const { number = 0, totalPages = 0 } = data || {};

        return number < totalPages - 1 ? number + 1 : undefined;
      },
      enabled: isLoggedInWithSMS,
      refetchOnMount: true
    }
  );

  const orders = pages.map(({ content = [] }) => content).flat();

  useEffect(() => {
    if (triggered && !isFetchingNextPage && hasNextPage) fetchNextPage().then();
  }, [fetchNextPage, triggered, hasNextPage, isFetchingNextPage]);

  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={20}
      customStyle={{
        padding: 20
      }}
    >
      {isInitialLoading &&
        Array.from({ length: 20 }).map((_, index) => (
          <NewProductListCardSkeleton
            // eslint-disable-next-line react/no-array-index-key
            key={`mypage-order-skeleton-${index}`}
            hideMetaInfo
            hideAreaInfo
          />
        ))}
      {!isInitialLoading &&
        orders.map((order) => <MypageOrdersCard key={`mypage-order-${order.id}`} order={order} />)}
    </Flexbox>
  );
}

export default NonMemberOrdersHistoryPanel;
