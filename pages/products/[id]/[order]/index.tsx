import { useEffect, useRef } from 'react';

import { useSetRecoilState } from 'recoil';
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

import { needUpdateSafePaymentIOSVersion } from '@utils/common';

import { dialogState } from '@recoil/common';

function ProductOrder() {
  const setDialogState = useSetRecoilState(dialogState);

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

  useEffect(() => {
    if (needUpdateSafePaymentIOSVersion()) {
      setDialogState({
        type: 'requiredAppUpdateForSafePayment',
        customStyleTitle: { minWidth: 269 },
        secondButtonAction: () => {
          if (
            window.webkit &&
            window.webkit.messageHandlers &&
            window.webkit.messageHandlers.callExecuteApp
          )
            window.webkit.messageHandlers.callExecuteApp.postMessage(
              'itms-apps://itunes.apple.com/app/id1541101835'
            );
        },
        disabledOnClose: true
      });
    }
  }, [setDialogState]);

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
