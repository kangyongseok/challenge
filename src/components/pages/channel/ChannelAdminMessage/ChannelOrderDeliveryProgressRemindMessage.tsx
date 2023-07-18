import { useSetRecoilState } from 'recoil';
import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';
import { Box, Button, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import type { Order } from '@dto/order';

import { getOrderStatusText } from '@utils/common';

import { channelDialogStateFamily } from '@recoil/channel';
import useSession from '@hooks/useSession';

interface ChannelOrderDeliveryProgressRemindMessageProps {
  message: AdminMessage;
  order?: Order | null;
  onClickOrderDetail: () => void;
}

function ChannelOrderDeliveryProgressRemindMessage({
  message: { data, createdAt },
  order,
  onClickOrderDetail
}: ChannelOrderDeliveryProgressRemindMessageProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const setOpenState = useSetRecoilState(channelDialogStateFamily('purchaseConfirm'));

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
  );
}

export default ChannelOrderDeliveryProgressRemindMessage;
