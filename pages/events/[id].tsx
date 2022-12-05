import { useEffect } from 'react';

import { useRouter } from 'next/router';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import { EventBanner, EventFilter, EventHeader, EventProductList } from '@components/pages/event';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

function Event() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    logEvent(attrKeys.events.VIEW_CRAZYWEEK, {
      att: String(id || '').includes('13') ? 'QUICK' : 'LOWPRICE'
    });
  }, [id]);

  return (
    <GeneralTemplate header={<EventHeader />}>
      <EventBanner />
      <EventFilter />
      <EventProductList />
    </GeneralTemplate>
  );
}

export default Event;
