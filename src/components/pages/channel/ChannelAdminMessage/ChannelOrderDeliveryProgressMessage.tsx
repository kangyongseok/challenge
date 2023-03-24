import { useSetRecoilState } from 'recoil';
import { Box, Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';

import type { Order } from '@dto/order';

import { getOrderStatusText } from '@utils/common/getOrderStatusText';

import { channelDialogStateFamily } from '@recoil/channel';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ChannelOrderDeliveryProgressMessageProps {
  message: AdminMessage;
  order?: Order | null;
  isSeller: boolean;
}

function ChannelOrderDeliveryProgressMessage({
  message: { data, createdAt },
  order,
  isSeller
}: ChannelOrderDeliveryProgressMessageProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const setOpenState = useSetRecoilState(channelDialogStateFamily('purchaseConfirm'));

  const { data: accessUser } = useQueryAccessUser();

  if (data && accessUser?.userId !== Number(JSON.parse(data)?.userId)) return null;

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
            배송중
          </Typography>
          <Typography
            customStyle={{
              marginTop: 8
            }}
          >
            택배를 보낸 뒤 구매자에게 송장번호를 꼭 알려주세요.
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
              받는 주소
            </Typography>
            <Flexbox
              gap={8}
              customStyle={{
                marginTop: 8
              }}
            >
              <Typography variant="body2">{order?.deliveryInfo?.name}</Typography>
              <Typography
                variant="body2"
                customStyle={{
                  color: common.ui60
                }}
              >
                {order?.deliveryInfo?.phone}
              </Typography>
            </Flexbox>
            <Typography
              variant="body2"
              customStyle={{
                marginTop: 4
              }}
            >
              {order?.deliveryInfo?.address}
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
          배송중
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8
          }}
        >
          판매자가 배송을 준비하고 있어요.
        </Typography>
        {getOrderStatusText({ status: order?.status, result: order?.result }) === '거래중' && (
          <Button
            variant="ghost"
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

export default ChannelOrderDeliveryProgressMessage;
