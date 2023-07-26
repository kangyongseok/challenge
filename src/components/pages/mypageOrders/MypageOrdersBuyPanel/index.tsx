import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Button, Flexbox, Image, Typography } from '@mrcamelhub/camel-ui';

import { NewProductListCardSkeleton } from '@components/UI/molecules';
import { Empty } from '@components/UI/atoms';
import { MypageOrdersCard } from '@components/pages/mypageOrders';

import { fetchOrderSearch } from '@api/order';

import queryKeys from '@constants/queryKeys';

import { commaNumber } from '@utils/formats';
import { getImageResizePath } from '@utils/common';

import useSession from '@hooks/useSession';
import useDetectScrollFloorTrigger from '@hooks/useDetectScrollFloorTrigger';

function MypageOrdersBuyPanel() {
  const router = useRouter();
  const { triggered } = useDetectScrollFloorTrigger();

  const { isLoggedIn } = useSession();

  const {
    data: { pages = [] } = {},
    isInitialLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    fetchStatus
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
      enabled: isLoggedIn,
      staleTime: 5 * 60 * 1000
    }
  );

  const orders = pages.map(({ content = [] }) => content).flat();
  const { totalElements } = pages[pages.length - 1] || {};

  const handleClickProductsList = () => {
    router.push('/products');
  };

  useEffect(() => {
    if (triggered && !isFetchingNextPage && hasNextPage) fetchNextPage().then();
  }, [fetchNextPage, triggered, hasNextPage, isFetchingNextPage]);

  if (fetchStatus === 'idle' && pages[0].totalPages === 0) {
    return (
      <Empty>
        <Image
          src={getImageResizePath({
            imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/empty_paper.png`,
            w: 52
          })}
          alt="empty img"
          width={52}
          height={52}
          disableAspectRatio
          disableSkeleton
        />
        <Flexbox direction="vertical" alignment="center" justifyContent="center" gap={8}>
          <Typography variant="h3" weight="bold" color="ui60">
            구매내역이 없어요
          </Typography>
          <Typography variant="h4" color="ui60">
            카멜에서 마음에 드는 매물을 찾아보세요
          </Typography>
        </Flexbox>
        <Button variant="ghost" brandColor="gray" onClick={handleClickProductsList} size="large">
          <Typography variant="h4" weight="medium">
            매물 보러가기
          </Typography>
        </Button>
      </Empty>
    );
  }

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
