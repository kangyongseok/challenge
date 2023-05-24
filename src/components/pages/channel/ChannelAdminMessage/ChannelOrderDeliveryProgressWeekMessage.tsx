import { useSetRecoilState } from 'recoil';
import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';
import { Box, Button, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

import OrderSearchDelieryForm from '@components/pages/order/OrderSearchDelieryForm';

import type { Order } from '@dto/order';

import { getOrderStatusText } from '@utils/common';

import { channelDialogStateFamily } from '@recoil/channel';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ChannelOrderDeliveryWaitMessageProps {
  message: AdminMessage;
  order?: Order | null;
  isSeller: boolean;
}

function ChannelOrderDeliveryProgressWeekMessage({
  message: { data, createdAt },
  order,
  isSeller
}: ChannelOrderDeliveryWaitMessageProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();
  const setOpenState = useSetRecoilState(channelDialogStateFamily('purchaseConfirm'));

  if (data && accessUser?.userId !== Number(JSON.parse(data)?.userId)) return null;

  const parcel = 1;
  const isParcel = order?.orderDelivery?.type === parcel;

  if (!isSeller) {
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
            배송확인
          </Typography>
          <Typography customStyle={{ marginTop: 8 }}>
            구매한 매물을 받으셨나요?
            <br />
            매물을 잘 받으셨다면 구매확정 버튼을 눌러주세요.
          </Typography>
          {isParcel && (
            <Flexbox>
              <OrderSearchDelieryForm
                id={order.id}
                customButton={
                  <Button
                    fullWidth
                    size="medium"
                    variant="ghost"
                    brandColor="black"
                    customStyle={{ marginTop: 20 }}
                    type="submit"
                  >
                    배송조회
                  </Button>
                }
              />
              {getOrderStatusText({ status: order?.status, result: order?.result }) ===
                '거래중' && (
                <Button
                  brandColor="black"
                  variant="solid"
                  fullWidth
                  onClick={() =>
                    setOpenState((prevState) => ({
                      ...prevState,
                      open: true
                    }))
                  }
                  customStyle={{
                    marginTop: 20
                  }}
                >
                  구매확정
                </Button>
              )}
            </Flexbox>
          )}
          {getOrderStatusText({ status: order?.status, result: order?.result }) === '거래중' &&
            !isParcel && (
              <Button
                brandColor="black"
                variant="solid"
                fullWidth
                onClick={() =>
                  setOpenState((prevState) => ({
                    ...prevState,
                    open: true
                  }))
                }
                customStyle={{
                  marginTop: 20
                }}
              >
                구매확정
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
  return <Box />;
}

export default ChannelOrderDeliveryProgressWeekMessage;
