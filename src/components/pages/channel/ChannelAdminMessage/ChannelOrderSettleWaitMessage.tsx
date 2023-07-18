import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useMutation
} from '@tanstack/react-query';
import type { AdminMessage } from '@sendbird/chat/message';
import { Box, Button, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import type { Order } from '@dto/order';
import type { ChannelDetail } from '@dto/channel';

import { putProductUpdateStatus } from '@api/product';

import useSession from '@hooks/useSession';

interface ChannelOrderSettleWaitMessageProps {
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
  onClickOrderDetail: () => void;
}

function ChannelOrderSettleWaitMessage({
  message: { data, createdAt },
  order,
  productId,
  targetUserId,
  targetUserName,
  hasUserReview,
  isSeller,
  refetchChannel,
  onClickOrderDetail
}: ChannelOrderSettleWaitMessageProps) {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useSession();

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
              isTargetUserSeller: !isSeller,
              orderId: order?.id,
              channelId: order?.channelId
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
          borderRadius: 20,
          overflow: 'hidden'
        }}
      >
        {order?.type === 2 && (
          <Typography
            variant="body3"
            weight="bold"
            color="primary-light"
            customStyle={{
              marginBottom: 4
            }}
          >
            카멜 구매대행
          </Typography>
        )}
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
        <Flexbox
          alignment="center"
          gap={4}
          onClick={onClickOrderDetail}
          customStyle={{
            margin: '20px -20px -20px',
            padding: '12px 20px',
            backgroundColor: common.bg02
          }}
        >
          <Icon name="FileFilled" color="primary-light" />
          <Typography weight="medium" color="primary-light">
            주문상세보기
          </Typography>
        </Flexbox>
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
