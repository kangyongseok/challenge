import { useSetRecoilState } from 'recoil';
import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';
import { Box, Button, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import OrderSearchDelieryForm from '@components/pages/order/OrderSearchDelieryForm';

import type { Order } from '@dto/order';

import { getOrderStatusText } from '@utils/common/getOrderStatusText';

import { channelDialogStateFamily } from '@recoil/channel';
import useSession from '@hooks/useSession';

interface ChannelOrderDeliveryProgressMessageProps {
  message: AdminMessage;
  order?: Order | null;
  isSeller: boolean;
  onClickOrderDetail: () => void;
}

function ChannelOrderDeliveryProgressMessage({
  message: { data, createdAt },
  order,
  isSeller,
  onClickOrderDetail
}: ChannelOrderDeliveryProgressMessageProps) {
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
            배송중
          </Typography>
          <Typography
            customStyle={{
              marginTop: 8
            }}
          >
            배송이 시작되었어요.
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
          배송중
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8
          }}
        >
          배송이 시작되었어요!
          <br />
          {isParcel
            ? '배송현황은 배송조회를 클릭하여 확인해주세요.'
            : '매물을 받으시면 구매확정 버튼을 눌러주세요.'}
        </Typography>
        {!isParcel && (
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
        {isParcel && (
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

export default ChannelOrderDeliveryProgressMessage;
