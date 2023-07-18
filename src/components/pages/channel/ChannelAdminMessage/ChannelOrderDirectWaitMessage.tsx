import { useSetRecoilState } from 'recoil';
import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';
import { Box, Button, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import type { Order } from '@dto/order';

import { getOrderStatusText } from '@utils/common';

import { channelDialogStateFamily } from '@recoil/channel';

interface ChannelOrderDirectWaitMessageProps {
  message: AdminMessage;
  order?: Order | null;
  isSeller: boolean;
  onClickOrderDetail: () => void;
}

function ChannelOrderDirectWaitMessage({
  message: { createdAt },
  order,
  isSeller,
  onClickOrderDetail
}: ChannelOrderDirectWaitMessageProps) {
  const {
    palette: { common }
  } = useTheme();

  const setOpenState = useSetRecoilState(channelDialogStateFamily('purchaseConfirm'));

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
          거래준비
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8
          }}
        >
          {isSeller
            ? '구매자와 직거래 후 구매확정 버튼 클릭을 요청해주세요.'
            : '판매자와 직거래 후 구매확정 버튼을 눌러주세요.'}
        </Typography>
        {!isSeller &&
          getOrderStatusText({
            status: order?.status,
            result: order?.result,
            hold: order?.hold,
            type: order?.type
          }) === '거래준비' && (
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

export default ChannelOrderDirectWaitMessage;
