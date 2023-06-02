import { useEffect, useRef, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';

import { fetchKeywordsSuggest } from '@api/product';

import queryKeys from '@constants/queryKeys';

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

    router
      .replace({
        pathname: '/search',
        query: {
          tab: queryTab
        }
      })
      .then(() => resetSearchTabPanelsSwiperThresholdState());
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
    if (!router.isReady || !swiper || !tab) return;

    if (tab === 'brand') {
      swiper?.slideTo(0);
    } else if (tab === 'category') {
      swiper?.slideTo(2);
    } else {
      swiper?.slideTo(1);
    }
  }, [tab, router.isReady, swiper]);

  useEffect(() => {
    if (value && updateAutoHeightTimerRef.current) {
      clearTimeout(updateAutoHeightTimerRef.current);
    }
  }, [value]);

  useEffect(() => {
    if (!swiper) return;

    if (updateAutoHeightTimerRef.current) {
      clearTimeout(updateAutoHeightTimerRef.current);
    }

    updateAutoHeightTimerRef.current = setTimeout(() => {
      if (swiper) swiper?.updateAutoHeight();
    }, 100);
  }, [category, swiper]);

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
