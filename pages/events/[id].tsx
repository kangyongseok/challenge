import { useEffect, useMemo } from 'react';

import { useRouter } from 'next/router';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  EventBanner,
  EventFilter,
  EventHeader,
  EventMarketingAgree,
  EventProductList
} from '@components/pages/event';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

function Event() {
  const router = useRouter();
  const { id } = router.query;

  const attParser = useMemo(() => {
    if (String(id).split('-').includes('13')) {
      return 'QUICK';
    }
    if (String(id).split('-').includes('14')) {
      return 'LOWPRICE';
    }
    if (String(id).split('-').includes('16')) {
      return 'TOP_DEALS_PRODUCT';
    }
    return 'NUMBER_NULL';
  }, [id]);

  useEffect(() => {
    logEvent(attrKeys.events.VIEW_CRAZYWEEK, {
      att: attParser
    });
  }, [attParser, id]);

  return (
    <GeneralTemplate header={<EventHeader />}>
      <EventBanner />
      {String(id).split('-').includes('16') && <EventMarketingAgree />}
      <EventFilter />
      <EventProductList />
    </GeneralTemplate>
  );
}

export default Event;
