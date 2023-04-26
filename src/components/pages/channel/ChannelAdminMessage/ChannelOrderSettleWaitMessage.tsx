import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useMutation
} from '@tanstack/react-query';
import type { AdminMessage } from '@sendbird/chat/message';

import type { ChannelDetail } from '@dto/channel';

import { putProductUpdateStatus } from '@api/product';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ChannelOrderSettleWaitMessageProps {
  message: AdminMessage;
  productId: number;
  targetUserId: number;
  targetUserName: string;
  hasUserReview: boolean;
  isSeller: boolean;
  refetchChannel: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ChannelDetail, unknown>>;
}

function ChannelOrderSettleWaitMessage({
  message: { data, createdAt },
  productId,
  targetUserId,
  targetUserName,
  hasUserReview,
  isSeller,
  refetchChannel
}: ChannelOrderSettleWaitMessageProps) {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  const { mutate } = useMutation(putProductUpdateStatus);

  if (data && accessUser?.userId !== Number(JSON.parse(data)?.userId)) return null;

  const handleClick = () => {
    mutate(
      { productId, status: 1, soldType: 1, targetUserId },
      {
        async onSuccess() {
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
        }
      }
    );
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
          거래완료
        </Typography>
        {!hasUserReview ? (
          <Typography
            customStyle={{
              marginTop: 8
            }}
          >
            {targetUserName}님과 거래는 어떠셨나요?
            <br />
            거래후기를 남겨주세요.
          </Typography>
        ) : (
          <Typography
            customStyle={{
              marginTop: 8
            }}
          >
            {targetUserName}님과 거래가 완료되었어요.
          </Typography>
        )}
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

export default ChannelOrderSettleWaitMessage;
