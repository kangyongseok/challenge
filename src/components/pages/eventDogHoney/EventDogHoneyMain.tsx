import { useCallback, useEffect } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';

import { TopButton } from '@components/UI/molecules';
import { PageHead } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import { logEvent } from '@library/amplitude';

import { EVENT_NEW_YEAR_FILTER_INFO_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  eventContentDogHoneyFilterOffsetTopState,
  eventContentDogHoneyFilterState,
  eventContentProductsParamsState
} from '@recoil/eventFilter';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';
import useQueryContents from '@hooks/useQueryContents';

import EventDogHoneyProductList from './EventDogHoneyProductList';
import EventDogHoneyInfo from './EventDogHoneyInfo';
import EventDogHoneyHeader from './EventDogHoneyHeader';
import EventDogHoneyFilter from './EventDogHoneyFilter';
import EventDogHoneyBanner from './EventDogHoneyBanner';

function EventDogHoneyMain() {
  const setEventContentProductsParamsState = useSetRecoilState(eventContentProductsParamsState);
  const eventContentDogHoneyFilter = useRecoilValue(eventContentDogHoneyFilterState);
  const eventContentDogHoneyFilterOffsetTop = useRecoilValue(
    eventContentDogHoneyFilterOffsetTopState
  );

  const { isLoading, data: { title: ogTitle, description: ogDescription } = {} } = useQueryContents(
    (successData) => {
      if (successData) {
        logEvent(attrKeys.events.LOAD_EVENT_DETAIL, {
          name: attrProperty.name.EVENT_DETAIL,
          title: '2301_DOG_HONEY',
          data: successData.models.map((model) => ({
            ...model,
            sort: eventContentDogHoneyFilter.selectedIndex + 1
          }))
        });
      }
    }
  );

  const reverseScrollTriggered = useReverseScrollTrigger();

  const handleMoveFixedInfo = useCallback(() => {
    window.scrollTo({
      top: eventContentDogHoneyFilterOffsetTop - EVENT_NEW_YEAR_FILTER_INFO_HEIGHT,
      left: 0
    });
  }, [eventContentDogHoneyFilterOffsetTop]);

  useEffect(() => {
    setEventContentProductsParamsState((currVal) => ({ ...currVal, id: 17 }));
  }, [setEventContentProductsParamsState]);

  return (
    <>
      <PageHead
        title={`${ogTitle} | 카멜 최저가 가격비교`}
        description={ogDescription}
        ogTitle={`${ogTitle} | 카멜 최저가 가격비교`}
        ogDescription={ogDescription}
        ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/home/main-banner-event01.png`}
      />
      <GeneralTemplate hideAppDownloadBanner header={<EventDogHoneyHeader />} disablePadding>
        <EventDogHoneyBanner />
        <EventDogHoneyFilter onMoveFixedInfo={handleMoveFixedInfo} />
        <EventDogHoneyInfo isLoading={isLoading} onMoveFixedInfo={handleMoveFixedInfo} />
        <EventDogHoneyProductList offsetTop={eventContentDogHoneyFilterOffsetTop} />
      </GeneralTemplate>
      <TopButton
        show={reverseScrollTriggered}
        customStyle={{
          bottom: 80,
          '& > button': {
            width: 48,
            height: 48
          }
        }}
      />
    </>
  );
}

export default EventDogHoneyMain;
