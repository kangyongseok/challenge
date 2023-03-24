import { useEffect } from 'react';

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
      <ProductOrderPaymentMethod />
      <Gap height={8} />
      <ProductOrderConfirm />
    </GeneralTemplate>
  );
}

export default ProductOrder;
