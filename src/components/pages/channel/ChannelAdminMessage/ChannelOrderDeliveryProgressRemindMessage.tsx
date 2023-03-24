import { useSetRecoilState } from 'recoil';
import { Box, Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';

import type { Order } from '@dto/order';

import { getOrderStatusText } from '@utils/common';

import { channelDialogStateFamily } from '@recoil/channel';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ChannelOrderDeliveryProgressRemindMessageProps {
  message: AdminMessage;
  order?: Order | null;
}

function ChannelOrderDeliveryProgressRemindMessage({
  message: { data, createdAt },
  order
}: ChannelOrderDeliveryProgressRemindMessageProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const setOpenState = useSetRecoilState(channelDialogStateFamily('purchaseConfirm'));

  const { data: accessUser } = useQueryAccessUser();

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
        <Typography variant="h4" weight="bold">
          배송확인
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8
          }}
        >
          구매한 매물을 받으셨나요?
          <br />
          매물을 잘 받으셨다면 구매확정 버튼을 눌러주세요.
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

export default ChannelOrderDeliveryProgressRemindMessage;
