import { useEffect } from 'react';
import type { MutableRefObject } from 'react';

import { useRouter } from 'next/router';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import type { PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { useQuery } from '@tanstack/react-query';

import { fetchProductOrder } from '@api/order';

import queryKeys from '@constants/queryKeys';

import { getTenThousandUnitPrice } from '@utils/formats';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ProductOrderPaymentMethodProps {
  paymentWidgetRef: MutableRefObject<PaymentWidgetInstance | null>;
  paymentMethodsWidgetRef: MutableRefObject<ReturnType<
    PaymentWidgetInstance['renderPaymentMethods']
  > | null>;
}

function ProductOrderPaymentMethod({
  paymentWidgetRef,
  paymentMethodsWidgetRef
}: ProductOrderPaymentMethodProps) {
  const router = useRouter();
  const { id } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);

  const { data: accessUser } = useQueryAccessUser();

  const { data: { totalPrice = 0 } = {} } = useQuery(
    queryKeys.orders.productOrder({ productId, isCreated: true }),
    () => fetchProductOrder({ productId, isCreated: true }),
    {
      enabled: !!accessUser && !!productId,
      refetchOnMount: true
    }
  );

  useEffect(() => {
    if (!accessUser || !totalPrice || paymentWidgetRef.current || paymentMethodsWidgetRef.current)
      return;

    const loadTossPaymentWidget = async () => {
      const paymentWidget = await loadPaymentWidget(
        process.env.TOSS_PAYMENTS_CLIENT_KEY,
        String(accessUser?.userId)
      );
      const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
        '#payment-widget',
        totalPrice,
        {
          variantKey: getTenThousandUnitPrice(totalPrice) > 3500 ? 'account' : ''
        }
      );

      paymentWidgetRef.current = paymentWidget;
      paymentMethodsWidgetRef.current = paymentMethodsWidget;
    };

    loadTossPaymentWidget();
  }, [accessUser, paymentWidgetRef, paymentMethodsWidgetRef, totalPrice]);

  return <div id="payment-widget" />;
}

export default ProductOrderPaymentMethod;
