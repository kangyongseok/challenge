import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useQuery
} from '@tanstack/react-query';
import type { AdminMessage } from '@sendbird/chat/message';

import type { Order } from '@dto/order';
import type { ChannelDetail } from '@dto/channel';

import { fetchUserAccounts } from '@api/user';

import queryKeys from '@constants/queryKeys';

import { commaNumber } from '@utils/formats';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ChannelSettlementCompleteMessageProps {
  message: AdminMessage;
  order?: Order | null;
  productId: number;
  targetUserId: number;
  targetUserName: string;
  hasUserReview: boolean;
  isSeller: boolean;
  refetchChannel: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ChannelDetail, unknown>>;
}

function ChannelOrderSettleCompleteMessage({
  message: { data, createdAt },
  order,
  productId,
  targetUserId,
  targetUserName,
  hasUserReview,
  isSeller,
  refetchChannel
}: ChannelSettlementCompleteMessageProps) {
  const router = useRouter();

  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  const { data: userAccounts = [], isLoading } = useQuery(
    queryKeys.users.userAccounts(),
    () => fetchUserAccounts(),
    {
      enabled: !!accessUser
    }
  );

  if (
    (data && accessUser?.userId !== Number(JSON.parse(data)?.userId)) ||
    !userAccounts.length ||
    isLoading
  )
    return null;

  const handleClick = async () => {
    await refetchChannel();
    router.push({
      pathname: '/user/reviews/form',
      query: {
        productId,
        targetUserName,
        targetUserId,
        isTargetUserSeller: !isSeller
      }
    });
  };

  return (
    <Flexbox
      gap={4}
      alignment="flex-end"
      customStyle={{
        margin: '20px 0'
      }}
    >
      <Box
        customStyle={{
          flexGrow: 1,
          maxWidth: 265,
          padding: 20,
          border: `1px solid ${common.line01}`,
          borderRadius: 20
        }}
      >
        <Typography variant="h4" weight="bold">
          정산완료
        </Typography>
        {!hasUserReview ? (
          <Typography
            customStyle={{
              marginTop: 8
            }}
          >
            정산계좌로 판매대금이 입금되었어요.
            <br />
            <br />
            {targetUserName}님과 거래는 어떠셨나요? 거래후기도 남겨주세요.
          </Typography>
        ) : (
          <Typography
            customStyle={{
              marginTop: 8
            }}
          >
            정산계좌로 판매대금이 입금되었어요.
          </Typography>
        )}
        <Box
          customStyle={{
            width: '100%',
            height: 1,
            margin: '20px 0',
            backgroundColor: common.line01
          }}
        />
        <Flexbox direction="vertical" gap={4}>
          <Flexbox justifyContent="space-between">
            <Typography
              variant="body2"
              customStyle={{
                color: common.ui60
              }}
            >
              판매금액
            </Typography>
            <Typography variant="body2">{commaNumber(order?.price || 0)}원</Typography>
          </Flexbox>
          <Flexbox justifyContent="space-between">
            <Typography
              variant="body2"
              customStyle={{
                color: common.ui60
              }}
            >
              정산은행
            </Typography>
            <Typography variant="body2">{userAccounts[0]?.accountHolder}</Typography>
          </Flexbox>
          <Flexbox justifyContent="space-between">
            <Typography
              variant="body2"
              customStyle={{
                color: common.ui60
              }}
            >
              정산계좌
            </Typography>
            <Typography variant="body2">{userAccounts[0]?.accountNumber}</Typography>
          </Flexbox>
        </Flexbox>
        <Flexbox
          justifyContent="space-between"
          customStyle={{
            marginTop: 11
          }}
        >
          <Typography variant="body2">정산금액</Typography>
          <Typography
            weight="medium"
            customStyle={{
              color: secondary.red.light
            }}
          >
            {commaNumber(order?.price || 0)}원
          </Typography>
        </Flexbox>
        {!hasUserReview && (
          <Button
            variant="ghost"
            brandColor="black"
            fullWidth
            onClick={handleClick}
            customStyle={{
              marginTop: 20
            }}
          >
            후기 작성하기
          </Button>
        )}
      </Box>
      <Typography
        variant="small2"
        customStyle={{
          color: common.ui60
        }}
      >
        {dayjs(createdAt).format('A hh:mm')}
      </Typography>
    </Flexbox>
  );
}

export default ChannelOrderSettleCompleteMessage;
