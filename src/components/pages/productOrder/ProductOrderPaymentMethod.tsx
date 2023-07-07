import { useEffect } from 'react';
import type { MutableRefObject } from 'react';

import { useRouter } from 'next/router';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import type { PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { useQuery } from '@tanstack/react-query';

import { fetchProductOrder } from '@api/order';

import queryKeys from '@constants/queryKeys';

import { getTenThousandUnitPrice } from '@utils/formats';

import useSession from '@hooks/useSession';

interface ProductOrderPaymentMethodProps {
  paymentWidgetRef: MutableRefObject<PaymentWidgetInstance | null>;
  paymentMethodsWidgetRef: MutableRefObject<ReturnType<
    PaymentWidgetInstance['renderPaymentMethods']
  > | null>;
  includeLegit: boolean;
}

function ProductOrderPaymentMethod({
  paymentWidgetRef,
  paymentMethodsWidgetRef,
  includeLegit
}: ProductOrderPaymentMethodProps) {
  const router = useRouter();
  const { id } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);

  const { isLoggedInWithSMS, data: accessUser } = useSession();

  const { data: { totalPrice = 0 } = {} } = useQuery(
    queryKeys.orders.productOrder({
      productId,
      isCreated: true,
      includeLegit
    }),
    () =>
      fetchProductOrder({
        productId,
        isCreated: true,
        includeLegit
      }),
    {
      enabled: isLoggedInWithSMS && !!productId,
      refetchOnMount: true
    }
  );

  useEffect(() => {
    if (
      !isLoggedInWithSMS ||
      !accessUser ||
      !totalPrice ||
      paymentWidgetRef.current ||
      paymentMethodsWidgetRef.current
    )
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
          variantKey: getTenThousandUnitPrice(totalPrice) > 3500 ? 'account' : undefined
        }
      );

      paymentWidgetRef.current = paymentWidget;
      paymentMethodsWidgetRef.current = paymentMethodsWidget;
    };

    loadTossPaymentWidget();
  }, [isLoggedInWithSMS, accessUser, paymentWidgetRef, paymentMethodsWidgetRef, totalPrice]);

  return <div id="payment-widget" />;
}

export default ProductOrderPaymentMethod;
