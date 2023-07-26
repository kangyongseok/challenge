import { useEffect } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  Button,
  CheckboxGroup,
  Flexbox,
  Icon,
  Image,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';

import OsAlarmDialog from '@components/UI/organisms/OsAlarmDialog';
import { MyShopAppDownloadDialog } from '@components/UI/organisms';
import { NewProductListCardSkeleton } from '@components/UI/molecules';
import { Empty } from '@components/UI/atoms';
import { MypageOrdersCard } from '@components/pages/mypageOrders';

import { logEvent } from '@library/amplitude';

import { fetchUserAccounts } from '@api/user';
import { fetchOrderSearch } from '@api/order';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/formats';
import { getImageResizePath } from '@utils/common';

import { mypageOrdersIsConfirmedState } from '@recoil/mypageOrders';
import useSession from '@hooks/useSession';
import useMoveCamelSeller from '@hooks/useMoveCamelSeller';
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

  const { isLoggedIn } = useSession();
  const { handleMoveCamelSeller, openOsAlarmDialog, handleCloseOsAlarmDialog } = useMoveCamelSeller(
    {
      attributes: {
        name: attrProperty.name.ORDER_LIST,
        title: attrProperty.title.MYPAGE_ORDER,
        source: 'ORDER'
      }
    }
  );

  const {
    data: { pages = [] } = {},
    isInitialLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    fetchStatus
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
      enabled: isLoggedIn,
      staleTime: 1 * 60 * 1000
    }
  );

  const { data: userAccounts = [], isLoading } = useQuery(
    queryKeys.users.userAccounts(),
    () => fetchUserAccounts(),
    {
      enabled: isLoggedIn,
      staleTime: 5 * 60 * 1000
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

  if (fetchStatus === 'idle' && pages[0].totalPages === 0 && !isConfirmed) {
    return (
      <>
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
              판매내역이 없어요
            </Typography>
            <Typography variant="h4" color="ui60">
              더 잘팔리는 카멜에서 판매를 시작해보세요!
            </Typography>
          </Flexbox>
          <Button variant="ghost" brandColor="gray" onClick={handleMoveCamelSeller} size="large">
            <Typography variant="h4" weight="medium">
              판매 등록하기
            </Typography>
          </Button>
        </Empty>
        <OsAlarmDialog open={openOsAlarmDialog} onClose={handleCloseOsAlarmDialog} />
        <MyShopAppDownloadDialog />
      </>
    );
  }

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
      {fetchStatus === 'idle' && pages[0].totalPages === 0 && isConfirmed && (
        <>
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
                정산내역이 없어요
              </Typography>
              <Typography variant="h4" color="ui60">
                더 잘팔리는 카멜에서 판매를 시작해보세요!
              </Typography>
            </Flexbox>
            <Button variant="ghost" brandColor="gray" onClick={handleMoveCamelSeller} size="large">
              <Typography variant="h4" weight="medium">
                판매 등록하기
              </Typography>
            </Button>
          </Empty>
          <OsAlarmDialog open={openOsAlarmDialog} onClose={handleCloseOsAlarmDialog} />
          <MyShopAppDownloadDialog />
        </>
      )}
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
