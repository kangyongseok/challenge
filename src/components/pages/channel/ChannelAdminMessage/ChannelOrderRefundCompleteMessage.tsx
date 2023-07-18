import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';
import { Box, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

import type { Order } from '@dto/order';

import { commaNumber } from '@utils/formats';

import useSession from '@hooks/useSession';

interface ChannelOrderRefundCompleteMessageProps {
  message: AdminMessage;
  order?: Order | null;
}

function ChannelOrderRefundCompleteMessage({
  message: { data, createdAt },
  order
}: ChannelOrderRefundCompleteMessageProps) {
  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();

  const { data: accessUser } = useSession();

  if (data && accessUser?.userId !== Number(JSON.parse(data)?.userId)) return null;

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
          환불완료
        </Typography>
        {order?.orderPayments[0]?.method === 0 ? (
          <Flexbox
            direction="vertical"
            gap={8}
            customStyle={{
              marginTop: 8
            }}
          >
            <Typography>거래가 취소되어 결제한 방법으로 환불되었어요.</Typography>
            <Typography>카드사에 따라 영업일 기준 2일까지 소요될 수 있어요.</Typography>
          </Flexbox>
        ) : (
          <Typography
            customStyle={{
              marginTop: 8
            }}
          >
            등록된 정산계좌로 환불되었어요.
          </Typography>
        )}
        {order?.reason ? (
          <Box
            customStyle={{
              width: '100%',
              margin: '20px 0',
              padding: 8,
              borderRadius: 8,
              backgroundColor: common.bg02
            }}
          >
            <Typography variant="body2" color="ui60">
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
        ) : (
          <Box
            customStyle={{
              width: '100%',
              height: 1,
              margin: '20px 0',
              backgroundColor: common.line01
            }}
          />
        )}
        <Flexbox direction="vertical" gap={4}>
          <Flexbox justifyContent="space-between">
            <Typography variant="body2" color="ui60">
              가격
            </Typography>
            <Typography variant="body2">{commaNumber(order?.price || 0)}원</Typography>
          </Flexbox>
          {order?.orderFees.length ? (
            order?.orderFees.map((orderFee) => (
              <Flexbox justifyContent="space-between" key={`order-fee${orderFee.name}`}>
                <Typography
                  variant="body2"
                  customStyle={{
                    color: common.ui60
                  }}
                >
                  {orderFee.name}
                </Typography>
                <Typography variant="body2">{commaNumber(orderFee.totalFee || 0)}원</Typography>
              </Flexbox>
            ))
          ) : (
            <Flexbox justifyContent="space-between">
              <Typography
                variant="body2"
                customStyle={{
                  color: common.ui60
                }}
              >
                안전결제수수료
              </Typography>
              <Typography variant="body2">{commaNumber(order?.fee || 0)}원</Typography>
            </Flexbox>
          )}
          <Flexbox justifyContent="space-between">
            <Typography variant="body2" color="ui60">
              환불방법
            </Typography>
            <Typography variant="body2">
              {order?.orderPayments[0].method === 0
                ? order?.orderPayments[0].agencyName
                : '계좌입금'}
            </Typography>
          </Flexbox>
        </Flexbox>
        <Flexbox
          justifyContent="space-between"
          customStyle={{
            marginTop: 11
          }}
        >
          <Typography variant="body2">환불금액</Typography>
          <Typography
            weight="medium"
            customStyle={{
              color: secondary.red.light
            }}
          >
            {commaNumber(order?.totalPrice || 0)}원
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

export default ChannelOrderRefundCompleteMessage;
