import { useRouter } from 'next/router';
import { Flexbox, Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import { Gap } from '@components/UI/atoms';

import useOrdersDetail from '@hooks/useOrdersDetail';

function OrdersDetailCancelInfo() {
  const router = useRouter();
  const { id } = router.query;

  const {
    palette: { common }
  } = useTheme();

  const {
    data: { reason, cancelReasons: { request = '' } = {} } = {},
    orderStatus,
    isSeller
  } = useOrdersDetail({ id: Number(id) });

  if (
    !isSeller ||
    !reason ||
    !['결제취소', '환불대기', '환불진행', '환불완료', '배송준비 중 취소 요청'].includes(
      orderStatus.name
    )
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
          padding: '32px 20px 20px'
        }}
      >
        <Typography variant="h3" weight="bold">
          취소정보
        </Typography>
        <Flexbox
          direction="vertical"
          gap={8}
          customStyle={{
            padding: 12,
            backgroundColor: common.bg02,
            borderRadius: 8
          }}
        >
          <Typography variant="h4" color="ui60">
            취소사유
          </Typography>
          <Typography variant="h4">{reason || request}</Typography>
        </Flexbox>
      </Flexbox>
    </>
  );
}

export default OrdersDetailCancelInfo;
