import { useCallback, useEffect } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';

import { TopButton } from '@components/UI/molecules';
import { PageHead } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import { EVENT_NEW_YEAR_FILTER_INFO_HEIGHT } from '@constants/common';

import {
  eventContentDogHoneyFilterOffsetTopState,
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
  const eventContentDogHoneyFilterOffsetTop = useRecoilValue(
    eventContentDogHoneyFilterOffsetTopState
  );

  const { isLoading, data: { title: ogTitle, description: ogDescription } = {} } =
    useQueryContents();

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
