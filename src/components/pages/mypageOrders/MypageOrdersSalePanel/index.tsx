import { useEffect } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { CheckboxGroup, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { NewProductListCardSkeleton } from '@components/UI/molecules';
import { MypageOrdersCard } from '@components/pages/mypageOrders';

import { logEvent } from '@library/amplitude';

import { fetchUserAccounts } from '@api/user';
import { fetchOrderSearch } from '@api/order';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/formats';

import { mypageOrdersIsConfirmedState } from '@recoil/mypageOrders';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useDetectScrollFloorTrigger from '@hooks/useDetectScrollFloorTrigger';

function MypageOrdersSalePanel() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { triggered } = useDetectScrollFloorTrigger();

  const [isConfirmed, setIsConfirmedState] = useRecoilState(mypageOrdersIsConfirmedState);

  const { data: accessUser } = useQueryAccessUser();

  const {
    data: { pages = [] } = {},
    isInitialLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useInfiniteQuery(
    queryKeys.orders.orderSearch({
      type: 1,
      isConfirmed,
      page: 0
    }),
    ({ pageParam = 0 }) =>
      fetchOrderSearch({
        type: 1,
        isConfirmed,
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

  const { data: userAccounts = [], isLoading } = useQuery(
    queryKeys.users.userAccounts(),
    () => fetchUserAccounts(),
    {
      enabled: !!accessUser,
      refetchOnMount: true
    }
  );

  const orders = pages.map(({ content = [] }) => content).flat();
  const { totalElements } = pages[pages.length - 1] || {};

  const handleChange = () => {
    logEvent(attrKeys.mypage.CLICK_FILTER, {
      name: attrProperty.name.ORDER_LIST,
      title: attrProperty.title.SETTLE_COMPLETE
    });

    setIsConfirmedState(!isConfirmed);
  };

  useEffect(() => {
    if (triggered && !isFetchingNextPage && hasNextPage) fetchNextPage().then();
  }, [fetchNextPage, triggered, hasNextPage, isFetchingNextPage]);

  return (
    <>
      {!isLoading && userAccounts.length === 0 && (
        <Flexbox
          gap={4}
          alignment="center"
          onClick={() => router.push('/mypage/settings/account')}
          customStyle={{
            width: '100%',
            padding: '12px 20px',
            backgroundColor: common.bg02
          }}
        >
          <Icon name="BangCircleFilled" width={16} height={16} color="primary-light" />
          <Typography variant="body2">정산계좌를 등록해주세요.</Typography>
        </Flexbox>
      )}
      <Flexbox
        component="section"
        justifyContent="space-between"
        customStyle={{
          padding: 20
        }}
      >
        <Typography weight="medium">전체 {commaNumber(totalElements || 0)}개</Typography>
        <CheckboxGroup text="정산내역만 보기" onChange={handleChange} checked={isConfirmed} />
      </Flexbox>
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
            <MypageOrdersCard key={`mypage-order-${order.id}`} order={order} type={1} />
          ))}
      </Flexbox>
    </>
  );
}

export default MypageOrdersSalePanel;
