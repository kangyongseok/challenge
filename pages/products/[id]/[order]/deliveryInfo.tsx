import { useEffect } from 'react';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductOrderDeliveryInfoForm,
  ProductOrderDeliveryInfoHeader
} from '@components/pages/productOrderDeliveryInfo';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

function ProductOrderDeliveryInfo() {
  useEffect(() => {
    logEvent(attrKeys.productOrder.VIEW_DELIVERY_MANAGE);
  }, []);

  return (
    <GeneralTemplate header={<ProductOrderDeliveryInfoHeader />} hideAppDownloadBanner>
      <ProductOrderDeliveryInfoForm />
    </GeneralTemplate>
  );
}

export default ProductOrderDeliveryInfo;
