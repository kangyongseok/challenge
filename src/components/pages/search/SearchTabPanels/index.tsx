import { useEffect, useRef, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';

import { logEvent } from '@library/amplitude';

import { fetchKeywordsSuggest } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  searchCategoryState,
  searchTabPanelsSwiperThresholdState,
  searchValueState
} from '@recoil/search';

import KeywordTabPanel from './KeywordTabPanel';
import CategoryTabPanel from './CategoryTabPanel';
import BrandTabPanel from './BrandTabPanel';

function SearchTabPanels() {
  const router = useRouter();
  const { tab = 'keyword' } = router.query;

  const [swiper, setSwiper] = useState<SwiperClass>();

  const threshold = useRecoilValue(searchTabPanelsSwiperThresholdState);
  const category = useRecoilValue(searchCategoryState);
  const value = useRecoilValue(searchValueState);
  const resetSearchTabPanelsSwiperThresholdState = useResetRecoilState(
    searchTabPanelsSwiperThresholdState
  );

  const isInit = useRef(false);
  const updateAutoHeightTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const startXRef = useRef(0);

  const { data = [] } = useQuery(
    queryKeys.products.keywordsSuggest(value),
    () => fetchKeywordsSuggest(value),
    {
      enabled: !!value
    }
  );

  const handleInitSwiper = (newSwiper: SwiperClass) => setSwiper(newSwiper);

  const handleSlideChange = ({ activeIndex }: SwiperClass) => {
    if (!router.isReady || !router.query.tab) return;

    let queryTab = String(router.query.tab);

    if (activeIndex === 0) {
      queryTab = 'brand';
    } else if (activeIndex === 2) {
      queryTab = 'category';
    }

    isInit.current = true;

    router
      .replace({
        pathname: '/search',
        query: {
          tab: queryTab
        }
      })
      .then(() => {
        resetSearchTabPanelsSwiperThresholdState();
        isInit.current = false;
      });
  };

  const handleSlideChangeTransitionEnd = ({ activeIndex, slides, touches }: SwiperClass) => {
    const newTab = slides[activeIndex].getAttribute('data-value');

    if (router.query.tab !== newTab && touches.startX !== startXRef.current) {
      startXRef.current = touches.startX;
      router
        .replace({
          pathname: '/search',
          query: {
            tab: newTab
          }
        })
        .then(() => resetSearchTabPanelsSwiperThresholdState());
    }
  };

  useEffect(() => {
    if (!router.isReady || !swiper || !tab || isInit.current) return;

    try {
      if (tab === 'brand') {
        swiper?.slideTo(0);
      } else if (tab === 'category') {
        swiper?.slideTo(2);
      } else {
        swiper?.slideTo(1);
      }
    } catch {
      logEvent(attrKeys.commonEvent.MINOR_SCRIPT_ERROR, {
        name: attrProperty.name.SEARCH,
        att: 'SLIDE_TO'
      });
    }
  }, [router.isReady, swiper, tab]);

  useEffect(() => {
    if (value && updateAutoHeightTimerRef.current) {
      clearTimeout(updateAutoHeightTimerRef.current);
    }
  }, [value]);

  useEffect(() => {
    if (updateAutoHeightTimerRef.current) {
      clearTimeout(updateAutoHeightTimerRef.current);
    }

    if (!swiper || (value && data && data.length > 0)) return;

    updateAutoHeightTimerRef.current = setTimeout(() => {
      try {
        if (swiper) swiper?.updateAutoHeight();
      } catch {
        logEvent(attrKeys.commonEvent.MINOR_SCRIPT_ERROR, {
          name: attrProperty.name.SEARCH,
          type: 'UPDATE_AUTO_HEIGHT'
        });
      }
    }, 100);
  }, [value, data, category, swiper]);

  useEffect(() => {
    return () => {
      if (updateAutoHeightTimerRef.current) {
        clearTimeout(updateAutoHeightTimerRef.current);
      }
    };
  }, []);

  if (value && data && data.length) return null;

  return (
    <Swiper
      tag="section"
      onInit={handleInitSwiper}
      onSlideChange={handleSlideChange}
      onSlideChangeTransitionEnd={handleSlideChangeTransitionEnd}
      threshold={threshold}
      autoHeight
      initialSlide={1}
      style={{
        width: '100%'
      }}
    >
      <SwiperSlide data-value="brand">
        <BrandTabPanel />
      </SwiperSlide>
      <SwiperSlide data-value="keyword">
        <KeywordTabPanel />
      </SwiperSlide>
      <SwiperSlide data-value="category">
        <CategoryTabPanel />
      </SwiperSlide>
    </Swiper>
  );
}

export default SearchTabPanels;
