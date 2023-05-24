import { FormEvent, useState } from 'react';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, Flexbox, Icon } from '@mrcamelhub/camel-ui';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';

import { fetchOrder } from '@api/order';

import queryKeys from '@constants/queryKeys';

function OrderSearchDelieryForm({
  customButton,
  id
}: {
  customButton?: ReactJSXElement;
  id?: number;
}) {
  const { query } = useRouter();
  const [open, setOpen] = useState(false);

  const { data: { orderDelivery } = {} } = useQuery(
    queryKeys.orders.order(id || Number(query.id)),
    () => fetchOrder(id || Number(query.id)),
    {
      enabled: !!id || !!query.id
    }
  );

  const handleSubmitDeliverySearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setOpen(true);
  };

  return (
    <>
      <form onSubmit={handleSubmitDeliverySearch} style={{ width: '100%' }}>
        {customButton || (
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
        )}
      </form>
      {open && (
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
          <Flexbox
            customStyle={{ height: 40, width: '100%', padding: '0 10px' }}
            alignment="center"
          >
            <Icon
              name="CloseOutlined"
              onClick={() => setOpen(false)}
              customStyle={{ marginLeft: 'auto' }}
            />
          </Flexbox>
          <iframe
            id="Smart Delivery Search Frame"
            title="스마트 택배 배송조회"
            style={{ width: '100%', height: 'calc(100% - 40px)' }}
            src={`https://info.sweettracker.co.kr/tracking/5?t_key=oUmDGhMFamBdY7XDlEcpbQ&t_code=${orderDelivery?.deliveryCode}&t_invoice=${orderDelivery?.contents}`}
          />
        </Box>
      )}
    </>
  );
}

export default OrderSearchDelieryForm;
