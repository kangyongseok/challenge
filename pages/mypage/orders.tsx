import { useEffect } from 'react';

import { useRouter } from 'next/router';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  MypageOrdersBuyPanel,
  MypageOrdersHeader,
  MypageOrdersPurchaseConfirmDialog,
  MypageOrdersSalePanel,
  MypageOrdersTabGroup
} from '@components/pages/mypageOrders';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

function MypageOrders() {
  const router = useRouter();
  const { tab = 'buy' } = router.query;

  useEffect(() => {
    logEvent(attrKeys.mypage.VIEW_ORDER_LIST, {
      title: tab === 'buy' ? 'BUYING' : 'SELLING'
    });
  }, [tab]);

  return (
    <>
      <GeneralTemplate header={<MypageOrdersHeader />} disablePadding>
        <MypageOrdersTabGroup />
        {tab === 'buy' && <MypageOrdersBuyPanel />}
        {tab === 'sale' && <MypageOrdersSalePanel />}
      </GeneralTemplate>
      <MypageOrdersPurchaseConfirmDialog />
    </>
  );
}

export default MypageOrders;
