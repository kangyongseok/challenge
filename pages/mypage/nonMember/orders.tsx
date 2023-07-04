import { useEffect } from 'react';

import { useRouter } from 'next/router';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  NonMemberOrdersHeader,
  NonMemberOrdersHistoryPanel,
  NonMemberOrdersTabGroup
} from '@components/pages/nonMemberOrders';
import { ChannelsMessagesPanel } from '@components/pages/channels';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function NonMemberOrders() {
  const router = useRouter();
  const { tab = 'history' } = router.query;

  useEffect(() => {
    logEvent(attrKeys.mypage.VIEW_NOLOGIN, {
      title: attrProperty.title.ORDER,
      att: tab === 'history' ? 'ORDER_LIST' : 'CHANNEL_LIST'
    });
  }, [tab]);

  return (
    <GeneralTemplate header={<NonMemberOrdersHeader />} disablePadding>
      <NonMemberOrdersTabGroup />
      {tab === 'history' && <NonMemberOrdersHistoryPanel />}
      {tab === 'inquiry' && <ChannelsMessagesPanel type={0} />}
    </GeneralTemplate>
  );
}

export default NonMemberOrders;
