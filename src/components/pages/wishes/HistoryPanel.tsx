import { Fragment, useMemo, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Box, Button, Dialog, Flexbox, Icon, Toast, Typography, useTheme } from 'mrcamel-ui';
import { entries, groupBy } from 'lodash-es';
import dayjs from 'dayjs';

import { ProductListCardSkeleton } from '@components/UI/molecules';
import { Skeleton } from '@components/UI/atoms';

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
        <Box
          customStyle={{
            margin: '30px 0 8px'
          }}
        >
          <Typography customStyle={{ color: common.ui60 }}>최근 100일간 활동내역입니다.</Typography>
        </Box>
        <Skeleton
          width="50px"
          height="18px"
          disableAspectRatio
          isRound
          customStyle={{ margin: '28px 0 20px' }}
        />
        <Flexbox direction="vertical" gap={20}>
          {Array.from({ length: 3 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <ProductListCardSkeleton key={`use-history-product-card-skeleton-${index}`} isRound />
          ))}
        </Flexbox>
        <Box
          customStyle={{
            marginTop: 12,
            borderTop: `1px solid ${common.ui90}`
          }}
        />
        <Skeleton
          width="50px"
          height="18px"
          disableAspectRatio
          isRound
          customStyle={{ margin: '20px 0' }}
        />
        <Flexbox direction="vertical" gap={20} customStyle={{ marginBottom: 12 }}>
          {Array.from({ length: 7 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <ProductListCardSkeleton key={`use-history-product-card-skeleton-${index}`} isRound />
          ))}
        </Flexbox>
      </>
    );
  }

  if (!data || !accessUser) {
    return (
      <WishesNotice
        imgName="wishes_login_img"
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
        imgName="rencet_empty_img"
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
        customStyle={{
          margin: '25px 0 8px'
        }}
      >
        <Typography customStyle={{ color: common.ui60 }}>최근 100일간 활동내역입니다.</Typography>
        <Button startIcon={<Icon name="DeleteOutlined" />} onClick={handleClickAllDelete}>
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
                width: 'calc(100% + 40px)'
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
            variant="contained"
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
    </>
  );
}

export default HistoryPanel;
