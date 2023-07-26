import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import { Gap } from '@components/UI/atoms';

import { commaNumber } from '@utils/formats';

import { ordersDetailOpenCancelRequestWithdrawDialogState } from '@recoil/ordersDetail';
import useQueryOrder from '@hooks/useQueryOrder';
import useOrderStatus from '@hooks/useOrderStatus';

function OrdersDetailRefundInfo() {
  const router = useRouter();
  const { id } = router.query;

  const {
    palette: { common }
  } = useTheme();

  const { data, data: { price = 0, totalPrice = 0, fee = 0, reason } = {} } = useQueryOrder({
    id: Number(id)
  });
  const orderStatus = useOrderStatus({ order: data });

  const setOpenCancelRequestWithdrawDialogState = useSetRecoilState(
    ordersDetailOpenCancelRequestWithdrawDialogState
  );

  if (
    orderStatus.isSeller ||
    ![
      '환불대기',
      '환불진행',
      '환불완료',
      '배송준비 중 취소 요청',
      '거래준비 중 취소 요청'
    ].includes(orderStatus.name)
  )
    return null;

  return (
    <>
      <Gap height={8} />
      <Flexbox
        component="section"
        direction="vertical"
        gap={20}
        customStyle={{
          padding: '32px 20px'
        }}
      >
        <Typography variant="h3" weight="bold">
          환불정보
        </Typography>
        <Flexbox direction="vertical" gap={4}>
          <Flexbox justifyContent="space-between" alignment="center">
            <Typography color="ui60">매물가격</Typography>
            <Typography>{commaNumber(price || 0)}원</Typography>
          </Flexbox>
          <Flexbox justifyContent="space-between" alignment="center">
            <Typography color="ui60">안전결제수수료</Typography>
            <Typography>{commaNumber(fee || 0)}원</Typography>
          </Flexbox>
          <Flexbox justifyContent="space-between" alignment="center">
            <Typography color="ui60">결제방법</Typography>
            <Typography>{orderStatus.paymentMethod}</Typography>
          </Flexbox>
          {reason && (
            <Box
              customStyle={{
                margin: '16px 0',
                padding: 12,
                backgroundColor: common.bg02,
                borderRadius: 8
              }}
            >
              <Typography variant="h4" color="ui60">
                취소사유
              </Typography>
              <Typography
                variant="h4"
                customStyle={{
                  marginTop: 8
                }}
              >
                {reason}
              </Typography>
            </Box>
          )}
          <Flexbox
            justifyContent="space-between"
            customStyle={{
              marginTop: 16
            }}
          >
            <Typography variant="h4" weight="medium">
              {['환불진행', '배송준비 중 취소 요청', '거래준비 중 취소 요청'].includes(
                orderStatus.name
              )
                ? '환불예정금액'
                : '환불금액'}
            </Typography>
            <Typography variant="h3" weight="bold" color="red-light">
              {commaNumber(totalPrice || 0)}원
            </Typography>
          </Flexbox>
        </Flexbox>
        {['배송준비 중 취소 요청', '거래준비 중 취소 요청'].includes(orderStatus.name) && (
          <Button
            variant="ghost"
            brandColor="black"
            size="large"
            fullWidth
            onClick={() => setOpenCancelRequestWithdrawDialogState(true)}
          >
            취소요청 철회
          </Button>
        )}
      </Flexbox>
    </>
  );
}

export default OrdersDetailRefundInfo;
