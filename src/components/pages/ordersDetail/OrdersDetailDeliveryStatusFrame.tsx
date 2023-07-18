import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { find } from 'lodash-es';
import { useQuery } from '@tanstack/react-query';
import { Box, Flexbox, Icon } from '@mrcamelhub/camel-ui';

import { fetchCommonCodeDetails } from '@api/common';

import queryKeys from '@constants/queryKeys';

import { ordersDetailOpenDeliveryStatusFrameState } from '@recoil/ordersDetail';
import useQueryOrder from '@hooks/useQueryOrder';

function OrdersDetailDeliveryStatusFrame() {
  const router = useRouter();
  const { id } = router.query;

  const [open, setOpenState] = useRecoilState(ordersDetailOpenDeliveryStatusFrameState);

  const { data: { orderDelivery } = {} } = useQueryOrder({ id: Number(id) });

  const { data, isLoading } = useQuery(
    queryKeys.commons.codeDetails({ codeId: 22 }),
    () => fetchCommonCodeDetails({ codeId: 22 }),
    {
      refetchOnMount: true,
      enabled: open
    }
  );

  if (!open || !data || isLoading) return null;

  return (
    <Box
      customStyle={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        zIndex: 100
      }}
    >
      <Flexbox customStyle={{ height: 40, width: '100%', padding: '0 10px' }} alignment="center">
        <Icon
          name="CloseOutlined"
          onClick={() => setOpenState(false)}
          customStyle={{ marginLeft: 'auto' }}
        />
      </Flexbox>
      <iframe
        id="Smart Delivery Search Frame"
        title="스마트 택배 배송조회"
        style={{ width: '100%', height: 'calc(100% - 40px)' }}
        src={`https://info.sweettracker.co.kr/tracking/5?t_key=${
          find(data, { codeId: 22 })?.description || ''
        }&t_code=${orderDelivery?.deliveryCode}&t_invoice=${orderDelivery?.contents}`}
      />
    </Box>
  );
}

export default OrdersDetailDeliveryStatusFrame;
