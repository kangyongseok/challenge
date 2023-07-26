import { useState } from 'react';

import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';
import Toast from '@mrcamelhub/camel-ui-toast';
import { Box, Button, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import type { Order } from '@dto/order';

import { commaNumber } from '@utils/formats';
import { copyToClipboard } from '@utils/common';

import useSession from '@hooks/useSession';

interface ChannelOrderPaymentProgressMessageProps {
  message: AdminMessage;
  order?: Order | null;
  onClickOrderDetail: () => void;
}

function ChannelOrderPaymentProgressMessage({
  message: { data, createdAt },
  order,
  onClickOrderDetail
}: ChannelOrderPaymentProgressMessageProps) {
  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();

  const [open, setOpen] = useState(false);

  const { data: accessUser } = useSession();

  if (data && accessUser?.userId !== Number(JSON.parse(data)?.userId)) return null;

  const handleClick = () => {
    if (!order?.orderPayments[0]?.data) return;

    copyToClipboard(order?.orderPayments[0]?.data);
    setOpen(true);
  };

  return (
    <>
      <Flexbox
        gap={4}
        alignment="flex-end"
        customStyle={{
          margin: '20px 0'
        }}
      >
        <Box
          customStyle={{
            flex: 1,
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
            입금요청
          </Typography>
          <Typography
            customStyle={{
              marginTop: 8
            }}
          >
            {dayjs(order?.orderPayments[0]?.dateExpired).format('MM월 DD일(ddd) HH:mm')}까지
            결제금액을 입금해주세요.
            <br />
            {order?.type === 2
              ? '미입금 시 결제 및 구매대행 요청이 취소됩니다.'
              : '미입금시 주문이 취소됩니다.'}
          </Typography>
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
              <Typography
                variant="body2"
                customStyle={{
                  color: common.ui60
                }}
              >
                결제방법
              </Typography>
              <Typography variant="body2">무통장입금</Typography>
            </Flexbox>
            <Flexbox justifyContent="space-between">
              <Typography
                variant="body2"
                customStyle={{
                  color: common.ui60
                }}
              >
                입금은행
              </Typography>
              <Typography variant="body2">{order?.orderPayments[0]?.agencyName}</Typography>
            </Flexbox>
            <Flexbox justifyContent="space-between">
              <Typography
                variant="body2"
                customStyle={{
                  color: common.ui60
                }}
              >
                계좌번호
              </Typography>
              <Typography variant="body2">{order?.orderPayments[0]?.data}</Typography>
            </Flexbox>
            <Flexbox justifyContent="space-between">
              <Typography
                variant="body2"
                customStyle={{
                  color: common.ui60
                }}
              >
                입금기한
              </Typography>
              <Typography variant="body2">
                {dayjs(order?.orderPayments[0]?.dateExpired).format('MM. DD.')}
              </Typography>
            </Flexbox>
          </Flexbox>
          <Flexbox
            justifyContent="space-between"
            customStyle={{
              marginTop: 11
            }}
          >
            <Typography variant="body2">입금예정금액</Typography>
            <Typography
              weight="medium"
              customStyle={{
                color: secondary.red.light
              }}
            >
              {commaNumber(order?.totalPrice || 0)}원
            </Typography>
          </Flexbox>
          <Button
            variant="ghost"
            brandColor="black"
            fullWidth
            onClick={handleClick}
            customStyle={{
              marginTop: 21
            }}
          >
            계좌번호 복사
          </Button>
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
      <Toast open={open} onClose={() => setOpen(false)}>
        계좌번호가 복사되었어요.
      </Toast>
    </>
  );
}

export default ChannelOrderPaymentProgressMessage;
