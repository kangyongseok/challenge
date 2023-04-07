import { useEffect, useRef } from 'react';

import type { PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';

import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductOrderBanner,
  ProductOrderCard,
  ProductOrderConfirm,
  ProductOrderDeliveryInfo,
  ProductOrderHeader,
  ProductOrderPaymentInfo,
  ProductOrderPaymentMethod
} from '@components/pages/productOrder';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrKeys from '@constants/attrKeys';

function ProductOrder() {
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<ReturnType<
    PaymentWidgetInstance['renderPaymentMethods']
  > | null>(null);

  useEffect(() => {
    const { source } =
      SessionStorage.get<{ source?: string }>(
        sessionStorageKeys.productDetailOrderEventProperties
      ) || {};

    logEvent(attrKeys.productOrder.VIEW_ORDER_PAYMENT, {
      source
    });
  }, []);

  return (
    <GeneralTemplate header={<ProductOrderHeader />} disablePadding hideAppDownloadBanner>
      <ProductOrderCard />
      <Gap height={8} />
      <ProductOrderDeliveryInfo />
      <Gap height={8} />
      <ProductOrderPaymentInfo />
      <ProductOrderBanner />
      <Gap height={8} />
      <ProductOrderPaymentMethod
        paymentWidgetRef={paymentWidgetRef}
        paymentMethodsWidgetRef={paymentMethodsWidgetRef}
      />
      <Gap height={8} />
      <ProductOrderConfirm paymentWidgetRef={paymentWidgetRef} />
    </GeneralTemplate>
  );
}

export default ProductOrder;
