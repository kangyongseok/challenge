import { useEffect } from 'react';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import { QuickFilter, QuickHeader, QuickProductList } from '@components/pages/quick';
// TODO 추후 오픈
// import { EventMarketingAgree } from '@components/pages/event';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

function QuickProducts() {
  useEffect(() => {
    logEvent(attrKeys.events.VIEW_FEATURED_PRODUCT_LIST);
  }, []);

  return (
    <GeneralTemplate header={<QuickHeader />}>
      {/* <EventMarketingAgree /> */}
      <QuickFilter />
      <QuickProductList />
    </GeneralTemplate>
  );
}

export default QuickProducts;
