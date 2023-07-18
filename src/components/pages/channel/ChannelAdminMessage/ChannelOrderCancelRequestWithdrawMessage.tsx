import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';
import { Box, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import type { Order } from '@dto/order';

interface ChannelOrderCancelRequestWithdrawMessageProps {
  message: AdminMessage;
  order?: Order | null;
  isSeller: boolean;
  onClickOrderDetail: () => void;
}

function ChannelOrderCancelRequestWithdrawMessage({
  message: { createdAt },
  order,
  isSeller,
  onClickOrderDetail
}: ChannelOrderCancelRequestWithdrawMessageProps) {
  const {
    palette: { common }
  } = useTheme();

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
          취소요청 철회
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8
          }}
        >
          {isSeller ? '구매자가 취소요청을 철회했어요.' : '취소요청을 철회했어요.'}
        </Typography>
        {order?.cancelReasons?.response && (
          <Flexbox
            direction="vertical"
            gap={4}
            customStyle={{
              marginTop: 20,
              padding: 8,
              borderRadius: 8,
              backgroundColor: common.bg02
            }}
          >
            <Typography variant="body2" color="ui60">
              거절사유
            </Typography>
            <Typography variant="body2">{order?.cancelReasons?.response}</Typography>
          </Flexbox>
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
      <Typography variant="small2" color="ui60">
        {dayjs(createdAt).format('A hh:mm')}
      </Typography>
    </Flexbox>
  );
}

export default ChannelOrderCancelRequestWithdrawMessage;
