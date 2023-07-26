import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import type { PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';

import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductOrderAppUpdateDialog,
  ProductOrderCard,
  ProductOrderCardOverDialog,
  ProductOrderConfirm,
  ProductOrderDeliveryInfo,
  ProductOrderHeader,
  ProductOrderPaymentInfo,
  ProductOrderPaymentMethod,
  ProductOrderPurchasingInfo
} from '@components/pages/productOrder';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrKeys from '@constants/attrKeys';

import getOrderType from '@utils/common/getOrderType';

function ProductOrder() {
  const router = useRouter();
  const { type = 0 } = router.query;

  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<ReturnType<
    PaymentWidgetInstance['renderPaymentMethods']
  > | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const { source } =
      SessionStorage.get<{ source?: string }>(
        sessionStorageKeys.productDetailOrderEventProperties
      ) || {};

    logEvent(attrKeys.productOrder.VIEW_ORDER_PAYMENT, {
      source,
      type: getOrderType(Number(type) as 0 | 1 | 2)
    });
  }, [router.isReady, type]);

  return (
    <>
      <GeneralTemplate header={<ProductOrderHeader />} disablePadding hideAppDownloadBanner>
        <ProductOrderPurchasingInfo />
        <ProductOrderCard />
        <ProductOrderDeliveryInfo />
        <Gap height={8} />
        <ProductOrderPaymentInfo />
        <Gap height={8} />
        <ProductOrderPaymentMethod
          paymentWidgetRef={paymentWidgetRef}
          paymentMethodsWidgetRef={paymentMethodsWidgetRef}
        />
        <Gap height={8} />
        <ProductOrderConfirm paymentWidgetRef={paymentWidgetRef} />
      </GeneralTemplate>
      <ProductOrderCardOverDialog />
      <ProductOrderAppUpdateDialog />
    </>
  );
}

export default ProductOrder;
