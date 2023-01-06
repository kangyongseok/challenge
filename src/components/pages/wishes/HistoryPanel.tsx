import { Fragment, useMemo, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Dialog,
  Flexbox,
  Icon,
  Skeleton,
  Toast,
  Typography,
  useTheme
} from 'mrcamel-ui';
import { entries, groupBy } from 'lodash-es';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import { ProductWishesCardSkeleton, TopButton } from '@components/UI/molecules';

import type { UserHistory } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { deleteWishRecent } from '@api/userHistory';
import { fetchUserHistory } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

import WishesNotice from './WishesNotice';
import HistoryDateItem from './HistoryDateItem';

function HistoryPanel() {
  const router = useRouter();
  const { hiddenTab } = router.query;
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const queryClient = useQueryClient();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openSuccessToast, setOpenSuccessToast] = useState(false);
  const { data: accessUser } = useQueryAccessUser();
  const { data, isLoading } = useQuery(
    queryKeys.users.userHistory(0),
    () => fetchUserHistory({ page: 0 }),
    {
      enabled: !!accessUser,
      refetchOnMount: true
    }
  );
  const { mutate: deleteMutate } = useMutation(deleteWishRecent, {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.users.userHistory(0));
      setOpenDeleteDialog(false);
      setOpenSuccessToast(true);
    }
  });

  const historiesGroupedByDate = useMemo(() => {
    if (!data) return [];

    return entries(
      groupBy(data.content, (userHistory: UserHistory) =>
        dayjs(userHistory.dateTime).format('YYYY.M.D')
      )
    ).sort(([a], [b]) => {
      return dayjs(b).diff(a);
    });
  }, [data]);

  const handleClickAllDelete = () => {
    logEvent(attrKeys.wishes.CLICK_DELETERECENT_BUTTON, {
      name: attrProperty.name.recentList
    });

    setOpenDeleteDialog(true);
  };

  const handleClickDeleteCancel = () => {
    logEvent(attrKeys.wishes.CLICK_CLOSE, {
      name: attrProperty.name.deleteRecentPopup
    });
    setOpenDeleteDialog(false);
  };

  const handleClickDeleteSubmit = () => {
    logEvent(attrKeys.wishes.CLICK_DELETERECENT, {
      name: attrProperty.name.deleteRecentPopup
    });
    deleteMutate();
  };

  if (isLoading) {
    return (
      <>
        <Flexbox
          alignment="center"
          justifyContent="space-between"
          customStyle={{
            margin: '20px 0 32px'
          }}
        >
          <Typography customStyle={{ color: common.ui60 }}>최근 100일간 활동내역입니다.</Typography>
          <Skeleton width={80.66} height={32} round={8} disableAspectRatio />
        </Flexbox>
        <Skeleton
          width={74}
          height={20}
          round={8}
          disableAspectRatio
          customStyle={{ marginBottom: 20 }}
        />
        <TimeLineWrap direction="vertical" gap={20}>
          {Array.from({ length: 3 }).map((_, index) => (
            <ProductWishesCardSkeleton
              // eslint-disable-next-line react/no-array-index-key
              key={`group-1-use-history-product-card-skeleton-${index}`}
              isRound
            />
          ))}
          <Flexbox alignment="center" gap={24}>
            <Skeleton
              width="48px"
              height="28px"
              disableAspectRatio
              customStyle={{ borderRadius: 24 }}
            />
            <Skeleton
              width="100%"
              maxWidth="120px"
              height="20px"
              disableAspectRatio
              customStyle={{ borderRadius: 24 }}
            />
          </Flexbox>
          <ProductWishesCardSkeleton isRound />
          <ProductWishesCardSkeleton isRound />
        </TimeLineWrap>
        <Box
          customStyle={{
            borderTop: `8px solid ${common.ui98}`,
            marginLeft: -20,
            width: 'calc(100% + 40px)'
          }}
        />
        <Skeleton
          width={74}
          height={20}
          round={8}
          disableAspectRatio
          customStyle={{ margin: '39px 0 20px' }}
        />
        <TimeLineWrap direction="vertical" gap={20}>
          {Array.from({ length: 2 }).map((_, index) => (
            <ProductWishesCardSkeleton
              // eslint-disable-next-line react/no-array-index-key
              key={`group-2-use-history-product-card-skeleton-${index}`}
              isRound
            />
          ))}
          <Flexbox alignment="center" gap={24}>
            <Skeleton
              width="48px"
              height="28px"
              disableAspectRatio
              customStyle={{ borderRadius: 24 }}
            />
            <Skeleton
              width="100%"
              maxWidth="120px"
              height="20px"
              disableAspectRatio
              customStyle={{ borderRadius: 24 }}
            />
          </Flexbox>
          <ProductWishesCardSkeleton isRound />
          <ProductWishesCardSkeleton isRound />
          <Flexbox alignment="center" gap={24}>
            <Skeleton
              width="48px"
              height="28px"
              disableAspectRatio
              customStyle={{ borderRadius: 24 }}
            />
            <Skeleton
              width="100%"
              maxWidth="120px"
              height="20px"
              disableAspectRatio
              customStyle={{ borderRadius: 24 }}
            />
          </Flexbox>
          {Array.from({ length: 3 }).map((_, index) => (
            <ProductWishesCardSkeleton
              // eslint-disable-next-line react/no-array-index-key
              key={`group-3-use-history-product-card-skeleton-${index}`}
              isRound
            />
          ))}
        </TimeLineWrap>
        <Box
          customStyle={{
            borderTop: `8px solid ${common.ui98}`,
            marginLeft: -20,
            width: 'calc(100% + 40px)'
          }}
        />
      </>
    );
  }

  if (!data || !accessUser) {
    return (
      <WishesNotice
        imgName="login-img"
        moveTo="/login"
        message={
          <>
            <Typography weight="bold" variant="h2" customStyle={{ marginBottom: 8 }}>
              최근목록이 보이지 않나요?
            </Typography>
            <Typography>
              카멜에 로그인하면
              <br />
              다시 만날 수 있어요😘
            </Typography>
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
        imgName="recent-empty-img"
        moveTo="/search"
        message={
          <>
            <Typography weight="bold" variant="h2" customStyle={{ marginBottom: 8 }}>
              검색해보세요!
            </Typography>
            <Typography>
              대한민국 중고 플랫폼을 모두 모아
              <br />
              집사처럼 꿀매물 대신 찾아다 드릴게요😘
            </Typography>
          </>
        }
        buttonLabel="검색 시작하기"
        onClickLog={() => {
          logEvent(attrKeys.wishes.CLICK_SEARCHMODAL, {
            name: 'RECENT_LIST',
            att: 'CONTENT'
          });
        }}
      />
    );
  }

  return (
    <>
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        customStyle={{ margin: '20px 0 32px' }}
      >
        <Typography customStyle={{ color: common.ui60 }}>최근 100일간 활동내역입니다.</Typography>
        <Button
          size="small"
          startIcon={<Icon name="DeleteOutlined" />}
          onClick={handleClickAllDelete}
        >
          <Typography weight="medium" variant="small1">
            전체삭제
          </Typography>
        </Button>
      </Flexbox>
      {historiesGroupedByDate.map(([date, userHistories]: [string, UserHistory[]], idx: number) => (
        <Fragment key={`user-history-date-${date}`}>
          <HistoryDateItem date={date} userHistories={userHistories} />
          {idx !== historiesGroupedByDate.length - 1 && (
            <Box
              customStyle={{
                borderTop: `8px solid ${common.ui98}`,
                marginLeft: -20,
                width: 'calc(100% + 40px)',
                marginBottom: 20
              }}
            />
          )}
        </Fragment>
      ))}
      <Dialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
        }}
        customStyle={{ padding: 20, width: 300 }}
      >
        <Typography weight="medium" customStyle={{ marginBottom: 20, textAlign: 'center' }}>
          최근 활동내역을
          <br />
          모두 삭제하시겠습니까?
        </Typography>
        <Flexbox alignment="center" gap={7}>
          <Button
            size="large"
            fullWidth
            variant="ghost"
            brandColor="primary"
            onClick={handleClickDeleteCancel}
          >
            취소
          </Button>
          <Button
            size="large"
            fullWidth
            variant="solid"
            brandColor="primary"
            onClick={handleClickDeleteSubmit}
          >
            확인
          </Button>
        </Flexbox>
      </Dialog>
      <Toast open={openSuccessToast} onClose={() => setOpenSuccessToast(false)}>
        최근 활동내역을 모두 삭제했어요.
      </Toast>
      <TopButton show name="WISH_LIST" customStyle={{ bottom: hiddenTab === 'legit' ? 105 : 80 }} />
    </>
  );
}

const TimeLineWrap = styled(Flexbox)`
  padding: 0 0 32px 14px;
  border-left: 1px solid ${({ theme: { palette } }) => palette.common.ui90};
`;

export default HistoryPanel;
