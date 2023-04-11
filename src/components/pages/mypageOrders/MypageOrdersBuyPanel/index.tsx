import { useEffect } from 'react';

import { Flexbox, Typography } from 'mrcamel-ui';
import { useInfiniteQuery } from '@tanstack/react-query';

import { NewProductListCardSkeleton } from '@components/UI/molecules';
import { MypageOrdersCard } from '@components/pages/mypageOrders';

import { fetchOrderSearch } from '@api/order';

import queryKeys from '@constants/queryKeys';

import { commaNumber } from '@utils/formats';

import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useDetectScrollFloorTrigger from '@hooks/useDetectScrollFloorTrigger';

function MypageOrdersBuyPanel() {
  const { triggered } = useDetectScrollFloorTrigger();

  const { data: accessUser } = useQueryAccessUser();

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
      enabled: !!accessUser,
      refetchOnMount: true
    }
  );

  const orders = pages.map(({ content = [] }) => content).flat();
  const { totalElements } = pages[pages.length - 1] || {};

  useEffect(() => {
    if (triggered && !isFetchingNextPage && hasNextPage) fetchNextPage().then();
  }, [fetchNextPage, triggered, hasNextPage, isFetchingNextPage]);

  return (
    <section>
      <Typography
        weight="medium"
        customStyle={{
          padding: 20
        }}
      >
        전체 {commaNumber(totalElements || 0)}개
      </Typography>
      <Flexbox
        direction="vertical"
        gap={20}
        customStyle={{
          padding: '0 20px 20px'
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
          orders.map((order) => (
            <MypageOrdersCard key={`mypage-order-${order.id}`} order={order} />
          ))}
      </Flexbox>
    </section>
  );
}

export default MypageOrdersBuyPanel;
