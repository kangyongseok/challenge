import { useEffect, useRef, useState } from 'react';

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
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrKeys from '@constants/attrKeys';

import useQueryProduct from '@hooks/useQueryProduct';

function ProductOrder() {
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<ReturnType<
    PaymentWidgetInstance['renderPaymentMethods']
  > | null>(null);

  const [includeLegit, setIncludeLegit] = useState(false);

  const { data: { product } = {} } = useQueryProduct();
  const isAllOperatorType = [5, 6, 7].includes(product?.sellerType || 0);

  useEffect(() => {
    const { source } =
      SessionStorage.get<{ source?: string }>(
        sessionStorageKeys.productDetailOrderEventProperties
      ) || {};

    logEvent(attrKeys.productOrder.VIEW_ORDER_PAYMENT, {
      source,
      type: isAllOperatorType ? 'OPERATOR' : ''
    });
  }, [isAllOperatorType]);

  useEffect(() => {
    setIncludeLegit(LocalStorage.get('includeLegit') || false);
    return () => LocalStorage.remove('includeLegit');
  }, []);

  return (
    <>
      <GeneralTemplate header={<ProductOrderHeader />} disablePadding hideAppDownloadBanner>
        <ProductOrderPurchasingInfo />
        <ProductOrderCard includeLegit={includeLegit} />
        <Gap height={8} />
        <ProductOrderDeliveryInfo includeLegit={includeLegit} />
        <Gap height={8} />
        <ProductOrderPaymentInfo includeLegit={includeLegit} />
        <Gap height={8} />
        <ProductOrderPaymentMethod
          paymentWidgetRef={paymentWidgetRef}
          paymentMethodsWidgetRef={paymentMethodsWidgetRef}
          includeLegit={includeLegit}
        />
        <Gap height={8} />
        <ProductOrderConfirm paymentWidgetRef={paymentWidgetRef} includeLegit={includeLegit} />
      </GeneralTemplate>
      <ProductOrderCardOverDialog includeLegit={includeLegit} />
      <ProductOrderAppUpdateDialog />
    </>
  );
}

export default ProductOrder;
