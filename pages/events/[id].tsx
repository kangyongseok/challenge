import { useEffect } from 'react';

import { useRouter } from 'next/router';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import EventDogHoneyMain from '@components/pages/eventDogHoney/EventDogHoneyMain';
import {
  EventBanner,
  EventFilter,
  EventHeader,
  EventMarketingAgree,
  EventProductList
} from '@components/pages/event';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function Event() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    if (String(id).endsWith('17')) {
      logEvent(attrKeys.events.VIEW_EVENT_DETAIL, {
        name: attrProperty.name.EVENT_DETAIL,
        title: '2301_DOG_HONEY'
      });

      return;
    }

    const getAtt = () => {
      if (String(id).split('-').includes('13')) {
        return 'QUICK';
      }
      if (String(id).split('-').includes('14')) {
        return 'LOWPRICE';
      }
      if (String(id).split('-').includes('15')) {
        return 'GENERAL_SELLER';
      }
      if (String(id).split('-').includes('16')) {
        return 'TOP_DEALS_PRODUCT';
      }

      return 'NUMBER_NULL';
    };

    logEvent(attrKeys.events.VIEW_CRAZYWEEK, {
      att: getAtt()
    });
  }, [id, router.isReady]);

  return String(id).endsWith('17') ? (
    <EventDogHoneyMain />
  ) : (
    <GeneralTemplate header={<EventHeader />}>
      <EventBanner />
      {String(id).split('-').includes('16') && <EventMarketingAgree />}
      <EventFilter />
      <EventProductList />
    </GeneralTemplate>
  );
}

export default Event;
