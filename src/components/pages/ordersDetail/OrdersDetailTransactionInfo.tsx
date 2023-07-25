import { useRouter } from 'next/router';
import { Flexbox, Typography } from '@mrcamelhub/camel-ui';

import { Gap } from '@components/UI/atoms';

import useQueryOrder from '@hooks/useQueryOrder';
import useOrderStatus from '@hooks/useOrderStatus';

function OrdersDetailTransactionInfo() {
  const router = useRouter();
  const { id } = router.query;

  const { data, data: { id: orderId, additionalInfo } = {} } = useQueryOrder({ id: Number(id) });
  const orderStatus = useOrderStatus({ order: data });

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
          거래정보
        </Typography>
        <Flexbox direction="vertical" gap={4}>
          <Flexbox justifyContent="space-between" alignment="center">
            <Typography color="ui60">거래방법</Typography>
            <Typography>{orderStatus.transactionMethod}</Typography>
          </Flexbox>
          <Flexbox justifyContent="space-between" alignment="center">
            <Typography color="ui60">주문번호</Typography>
            <Typography>{orderId}</Typography>
          </Flexbox>
          {orderStatus.orderDate && (
            <Flexbox justifyContent="space-between" alignment="center">
              <Typography color="ui60">주문일시</Typography>
              <Typography>{orderStatus.orderDate}</Typography>
            </Flexbox>
          )}
          {orderStatus.transactionMethod !== '카멜 구매대행' && (
            <Flexbox justifyContent="space-between" alignment="center">
              <Typography color="ui60">{!orderStatus.isSeller ? '판매자' : '구매자'}</Typography>
              <Typography>
                {!orderStatus.isSeller ? additionalInfo?.sellerName : additionalInfo?.buyerName}
              </Typography>
            </Flexbox>
          )}
        </Flexbox>
      </Flexbox>
    </>
  );
}

export default OrdersDetailTransactionInfo;