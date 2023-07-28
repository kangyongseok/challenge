import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';
import { Box, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

import type { Order } from '@dto/order';

import useSession from '@hooks/useSession';

interface ChannelOrderPaymentCancelMessageProps {
  message: AdminMessage;
  order?: Order | null;
  isSeller: boolean;
  targetUserName: string;
}

function ChannelOrderPaymentCancelMessage({
  message: { data, createdAt },
  order,
  isSeller,
  targetUserName
}: ChannelOrderPaymentCancelMessageProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useSession();

  if (data && accessUser?.userId !== Number(JSON.parse(data)?.userId)) return null;

  if (order?.reason) {
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
            거래취소
          </Typography>
          {isSeller ? (
            <Typography
              customStyle={{
                marginTop: 8,
                wordBreak: 'keep-all'
              }}
            >
              {targetUserName}님과의 거래가 취소되었어요.
            </Typography>
          ) : (
            <Typography
              customStyle={{
                marginTop: 8,
                wordBreak: 'keep-all'
              }}
            >
              {order?.orderPayments[0]?.method === 0 ? '카드결제' : '가상계좌 결제'}가 취소되었어요.
            </Typography>
          )}
          <Box
            customStyle={{
              width: '100%',
              marginTop: 20,
              padding: 8,
              borderRadius: 8,
              backgroundColor: common.bg02
            }}
          >
            <Typography
              variant="body2"
              customStyle={{
                color: common.ui60
              }}
            >
              사유
            </Typography>
            <Typography
              variant="body2"
              customStyle={{
                marginTop: 4
              }}
            >
              {order?.reason}
            </Typography>
          </Box>
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
          거래취소
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8,
            wordBreak: 'keep-all'
          }}
        >
          결제가 취소되었어요.
        </Typography>
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

export default ChannelOrderPaymentCancelMessage;
