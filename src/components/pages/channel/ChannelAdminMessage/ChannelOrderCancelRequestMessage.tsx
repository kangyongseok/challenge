import { useSetRecoilState } from 'recoil';
import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';
import { Box, Button, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import type { Order } from '@dto/order';

import { commaNumber } from '@utils/formats';
import { getOrderStatusText } from '@utils/common';

import { channelDialogStateFamily } from '@recoil/channel';

interface ChannelOrderCancelMessageProps {
  message: AdminMessage;
  order?: Order | null;
  isSeller: boolean;
  onClickOrderDetail: () => void;
}

function ChannelOrderCancelRequestMessage({
  message: { createdAt },
  order,
  isSeller,
  onClickOrderDetail
}: ChannelOrderCancelMessageProps) {
  const {
    palette: { common }
  } = useTheme();

  const setOpenApproveState = useSetRecoilState(
    channelDialogStateFamily('orderCancelRequestApprove')
  );
  const setOpenRefuseState = useSetRecoilState(
    channelDialogStateFamily('orderCancelRequestRefuse')
  );

  if (isSeller)
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
            취소요청
          </Typography>
          <Typography
            customStyle={{
              marginTop: 8
            }}
          >
            구매자의 취소요청을 확인해주세요.
          </Typography>
          <Typography
            color="ui60"
            customStyle={{
              marginTop: 8
            }}
          >
            {dayjs(order?.dateExpired).format('MM월 DD일')}까지 미확인시 주문이 취소됩니다.
          </Typography>
          {order?.cancelReasons?.request && (
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
                취소사유
              </Typography>
              <Typography variant="body2">{order?.cancelReasons?.request}</Typography>
            </Flexbox>
          )}
          {getOrderStatusText({
            status: order?.status,
            result: order?.result,
            hold: order?.hold
          }) === '취소요청' && (
            <Flexbox
              gap={8}
              customStyle={{
                marginTop: 20
              }}
            >
              <Button
                variant="ghost"
                brandColor="black"
                fullWidth
                onClick={() =>
                  setOpenRefuseState((prevState) => ({
                    ...prevState,
                    open: true
                  }))
                }
              >
                거절
              </Button>
              <Button
                variant="solid"
                brandColor="black"
                fullWidth
                onClick={() =>
                  setOpenApproveState((prevState) => ({
                    ...prevState,
                    open: true
                  }))
                }
              >
                취소 승인
              </Button>
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
          취소요청
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8
          }}
        >
          판매자가 요청을 승인하면 결제한 방법으로 환불됩니다.
        </Typography>
        {order?.cancelReasons?.request && (
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
              취소사유
            </Typography>
            <Typography variant="body2">{order?.cancelReasons?.request}</Typography>
          </Flexbox>
        )}
        <Flexbox
          direction="vertical"
          gap={4}
          customStyle={{
            marginTop: 20
          }}
        >
          <Flexbox justifyContent="space-between">
            <Typography variant="body2" color="ui60">
              매물가격
            </Typography>
            <Typography variant="body2">{commaNumber(order?.price || 0)}원</Typography>
          </Flexbox>
          <Flexbox justifyContent="space-between">
            <Typography variant="body2" color="ui60">
              안전결제수수료
            </Typography>
            <Typography variant="body2">{commaNumber(order?.fee || 0)}원</Typography>
          </Flexbox>
          <Flexbox justifyContent="space-between">
            <Typography variant="body2" color="ui60">
              환불방법
            </Typography>
            <Typography variant="body2">
              {order?.orderPayments[0].method === 0
                ? order?.orderPayments[0].agencyName
                : '무통장입금'}
            </Typography>
          </Flexbox>
        </Flexbox>
        <Flexbox
          justifyContent="space-between"
          customStyle={{
            marginTop: 11
          }}
        >
          <Typography variant="body2">환불예정금액</Typography>
          <Typography weight="medium" color="red-light">
            {commaNumber(order?.totalPrice || 0)}원
          </Typography>
        </Flexbox>
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

export default ChannelOrderCancelRequestMessage;
