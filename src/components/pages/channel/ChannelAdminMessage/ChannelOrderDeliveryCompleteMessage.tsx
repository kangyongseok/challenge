import { useSetRecoilState } from 'recoil';
import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';
import { Box, Button, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

import OrderSearchDelieryForm from '@components/pages/order/OrderSearchDelieryForm';

import type { Order } from '@dto/order';

import { getOrderStatusText } from '@utils/common/getOrderStatusText';

import { channelDialogStateFamily } from '@recoil/channel';
import useSession from '@hooks/useSession';

interface ChannelOrderDeliveryCompleteMessageProps {
  message: AdminMessage;
  order?: Order | null;
  isSeller: boolean;
}

function ChannelOrderDeliveryCompleteMessage({
  message: { data, createdAt },
  order,
  isSeller
}: ChannelOrderDeliveryCompleteMessageProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const setOpenState = useSetRecoilState(channelDialogStateFamily('purchaseConfirm'));

  const { data: accessUser } = useSession();

  if (data && accessUser?.userId !== Number(JSON.parse(data)?.userId)) return null;

  const parcel = 1;
  const isParcel = order?.orderDelivery?.type === parcel;

  const getTypeText = () => {
    switch (order?.orderDelivery?.type) {
      case 0:
        return order?.orderDelivery?.contents;
      case 2:
        return '퀵 서비스';
      case 3:
        return '용달';
      default:
        return '';
    }
  };

  if (isSeller) {
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
            배송완료
          </Typography>
          <Typography
            customStyle={{
              marginTop: 8
            }}
          >
            구매자가 구매확정하면 즉시 정산되며, {dayjs(order?.dateExpired).format('M월 D일(ddd)')}
            까지 구매확정하지 않아도 자동으로 정산됩니다.
            {isParcel && (
              <>
                <br />
                배송현황은 배송조회를 클릭하여 확인해주세요.
              </>
            )}
          </Typography>
          {isParcel ? (
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
          ) : (
            <Flexbox
              customStyle={{ background: common.bg02, padding: 8, borderRadius: 8, marginTop: 20 }}
              direction="vertical"
              gap={8}
            >
              <Typography variant="body2" color="ui60">
                배송방법
              </Typography>
              <Typography variant="body2">{getTypeText()}</Typography>
            </Flexbox>
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
          배송완료
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8
          }}
        >
          매물을 잘 받으셨다면 구매확정 버튼을 눌러주세요.
        </Typography>
        <Flexbox gap={8} alignment="center">
          <OrderSearchDelieryForm
            id={order?.id}
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
          {getOrderStatusText({ status: order?.status, result: order?.result }) === '거래중' && (
            <Button
              variant="solid"
              brandColor="black"
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

export default ChannelOrderDeliveryCompleteMessage;
