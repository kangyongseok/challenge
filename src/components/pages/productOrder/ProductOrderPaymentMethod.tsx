import { useEffect } from 'react';
import type { MutableRefObject } from 'react';

import { useRouter } from 'next/router';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import type { PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { Skeleton } from '@mrcamelhub/camel-ui';

import { getTenThousandUnitPrice } from '@utils/formats';

import useSession from '@hooks/useSession';
import useQueryProductOrder from '@hooks/useQueryProductOrder';

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
  const { id, includeLegit, type = 0 } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);

  const { isLoggedInWithSMS, data: accessUser } = useSession();

  const { data: { totalPrice = 0 } = {} } = useQueryProductOrder({
    productId,
    includeLegit: String(includeLegit),
    type: Number(type)
  });

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

  return (
    <div id="payment-widget">
      <Skeleton width="100%" height={175} disableAspectRatio />
    </div>
  );
}

export default ProductOrderPaymentMethod;
