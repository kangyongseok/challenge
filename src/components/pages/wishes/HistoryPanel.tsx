import { Fragment } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Alert, Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import { entries, groupBy } from 'lodash-es';
import dayjs from 'dayjs';

import { ProductListCardSkeleton } from '@components/UI/molecules';
import { Skeleton } from '@components/UI/atoms';

import type { UserHistory } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { fetchUserHistory } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

import WishesNotice from './WishesNotice';
import HistoryDateItem from './HistoryDateItem';

function HistoryPanel() {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();
  const { data, isLoading } = useQuery(
    queryKeys.users.userHistory(0),
    () => fetchUserHistory({ page: 0 }),
    {
      enabled: !!accessUser && router.isReady,
      refetchOnMount: true,
      keepPreviousData: true
    }
  );
  const {
    theme: { palette }
  } = useTheme();

  if (isLoading) {
    return (
      <>
        <Alert
          round="16"
          customStyle={{
            padding: '12px 24px',
            margin: '16px 0 8px'
          }}
        >
          <Typography variant="body2" color={palette.common.grey['20']}>
            최근 100일 동안의 활동 내역을 볼 수 있어요
          </Typography>
        </Alert>
        <Skeleton
          width="50px"
          height="18px"
          disableAspectRatio
          customStyle={{ margin: '28px 0 20px' }}
        />
        <Flexbox direction="vertical" gap={12}>
          {Array.from({ length: 3 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <ProductListCardSkeleton key={`use-history-product-card-skeleton-${index}`} />
          ))}
        </Flexbox>
        <Box
          customStyle={{
            marginTop: 12,
            borderTop: `1px solid ${palette.common.grey['90']}`
          }}
        />
        <Skeleton
          width="50px"
          height="18px"
          disableAspectRatio
          customStyle={{ margin: '20px 0' }}
        />
        <Flexbox direction="vertical" gap={12} customStyle={{ marginBottom: 12 }}>
          {Array.from({ length: 7 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <ProductListCardSkeleton key={`use-history-product-card-skeleton-${index}`} />
          ))}
        </Flexbox>
      </>
    );
  }

  if (!data || !accessUser) {
    return (
      <WishesNotice
        icon="🔍"
        moveTo="/login"
        message={
          <>
            최근 목록이 보이지 않나요?
            <br />
            로그인하면 다시 만날 수 있어요
          </>
        }
        buttonLabel="3초 로그인하기"
        onClickLog={() => {
          logEvent(attrKeys.wishes.CLICK_LOGIN, {
            name: 'RECENT_LIST'
          });
        }}
      />
    );
  }

  if (data.content.length === 0) {
    return (
      <WishesNotice
        icon="🔍"
        moveTo="/search"
        message={
          <>
            마음에 드는 명품을 검색해보세요
            <Typography
              customStyle={{
                paddingTop: 8
              }}
            >
              대한민국 중고 플랫폼을 모두 모은
              <br />
              새로운 매물 검색을 경험해보세요
            </Typography>
          </>
        }
        buttonLabel="매물검색 하러가기"
        onClickLog={() => {
          logEvent(attrKeys.wishes.CLICK_SEARCHMODAL, {
            name: 'RECENT_LIST',
            att: 'CONTENT'
          });
        }}
      />
    );
  }

  const historiesGroupedByDate = entries(
    groupBy(data.content, (userHistory: UserHistory) =>
      dayjs(userHistory.dateTime).format('YYYY.M.D')
    )
  ).sort(([a], [b]) => {
    return dayjs(b).diff(a);
  });

  return (
    <>
      <Alert
        round="16"
        customStyle={{
          padding: '12px 24px',
          marginTop: 16,
          marginBottom: 8
        }}
      >
        <Typography variant="body2" color={palette.common.grey['20']}>
          최근 100일 동안의 활동 내역을 볼 수 있어요
        </Typography>
      </Alert>
      {historiesGroupedByDate.map(([date, userHistories]: [string, UserHistory[]], idx: number) => (
        <Fragment key={`user-history-date-${date}`}>
          <HistoryDateItem date={date} userHistories={userHistories} />
          {idx !== historiesGroupedByDate.length - 1 && (
            <Box
              customStyle={{
                borderTop: `1px solid ${palette.common.grey['90']}`
              }}
            />
          )}
        </Fragment>
      ))}
    </>
  );
}

export default HistoryPanel;
