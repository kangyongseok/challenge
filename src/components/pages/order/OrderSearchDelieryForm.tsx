import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@mrcamelhub/camel-ui';

import { fetchOrder } from '@api/order';

import queryKeys from '@constants/queryKeys';

function OrderSearchDelieryForm() {
  const { query } = useRouter();

  const { data: { orderDelivery } = {} } = useQuery(
    queryKeys.orders.order(Number(query.id)),
    () => fetchOrder(Number(query.id)),
    {
      enabled: !!query.id
    }
  );

  return (
    <form action="http://info.sweettracker.co.kr/tracking/5" method="post">
      <input type="hidden" id="t_key" name="t_key" value="oUmDGhMFamBdY7XDlEcpbQ" />
      <input type="hidden" name="t_code" id="t_code" value={orderDelivery?.deliveryCode} />
      <input type="hidden" name="t_invoice" id="t_invoice" value={orderDelivery?.contents} />
      <Button
        fullWidth
        brandColor="black"
        variant="solid"
        size="xlarge"
        customStyle={{ marginTop: 20 }}
        type="submit"
      >
        배송조회
      </Button>
    </form>
  );
}

export default OrderSearchDelieryForm;
