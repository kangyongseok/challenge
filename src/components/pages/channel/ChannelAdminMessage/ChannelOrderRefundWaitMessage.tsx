import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';

import type { Order } from '@dto/order';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ChannelOrderRefundWaitMessageProps {
  message: AdminMessage;
  order?: Order | null;
  isSeller: boolean;
  targetUserName: string;
}

function ChannelOrderRefundWaitMessage({
  message: { data, createdAt },
  order,
  isSeller,
  targetUserName
}: ChannelOrderRefundWaitMessageProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  if (data && accessUser?.userId !== Number(JSON.parse(data)?.userId)) return null;

  if (isSeller && order?.reason) {
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
            거래취소
          </Typography>
          <Typography
            customStyle={{
              marginTop: 8
            }}
          >
            {targetUserName}님과의 거래가 취소되었어요.
          </Typography>
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
        <Typography variant="h4" weight="bold">
          거래취소
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8
          }}
        >
          {targetUserName}님과의 거래가 취소되었어요.
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

export default ChannelOrderRefundWaitMessage;
