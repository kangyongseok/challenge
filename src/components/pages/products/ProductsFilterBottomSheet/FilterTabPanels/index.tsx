import { useEffect, useMemo, useRef } from 'react';

// eslint-disable-next-line import/no-unresolved
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';

import { logEvent } from '@library/amplitude';

import { filterCodeIds, filterCodes } from '@constants/productsFilter';
import attrKeys from '@constants/attrKeys';

import convertSearchParams from '@utils/products/convertSearchParams';

import { ProductsVariant } from '@typings/products';
import {
  activeTabCodeIdState,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

import SizeTabPanel from './SizeTabPanel';
import PriceTabPanel from './PriceTabPanel';
import PlatformTabPanel from './PlatformTabPanel';
import LineTabPanel from './LineTabPanel';
import DetailOptionTabPanel from './DetailOptionTabPanel';
import CategoryTabPanel from './CategoryTabPanel';
import BrandTabPanel from './BrandTabPanel';

interface FilterTabPanelsProps {
  variant: ProductsVariant;
}

const { category, size, brand, line, platform, price, detailOption } = filterCodeIds;

function FilterTabPanels({ variant }: FilterTabPanelsProps) {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const [activeTabCodeId, setActiveTabCodeIdState] = useRecoilState(activeTabCodeIdState);
  const { searchParams: baseSearchParams } = useRecoilValue(
    searchParamsStateFamily(`base-${atomParam}`)
  );
  const { selectedSearchOptions } = useRecoilValue(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );
  const setSearchOptionsParamsState = useSetRecoilState(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );

  const swiperRef = useRef<SwiperClass | null>(null);

  const activeSlide = useMemo(
    () => filterCodes[variant].findIndex((filterCode) => filterCode.codeId === activeTabCodeId),
    [variant, activeTabCodeId]
  );

  const handleSlideChange = (swiper: SwiperClass) => {
    if (selectedSearchOptions.length) {
      const { slides, activeIndex } = swiper;
      const dataCodeId = Number(slides[activeIndex].getAttribute('data-code-id') || 0);

      setSearchOptionsParamsState(({ type }) => ({
        type,
        searchParams: convertSearchParams(selectedSearchOptions, {
          baseSearchParams,
          excludeCodeId: dataCodeId
        })
      }));
    }
  };

  const handleSlideChangeTransitionEnd = (swiper: SwiperClass) => {
    const { slides, activeIndex, touches } = swiper;

    if (touches.diff) {
      const { keyword } = router.query;

      const eventProperties = {
        index: swiper.activeIndex,
        keyword
      };

      if (variant !== 'search') delete eventProperties.keyword;

      logEvent(attrKeys.products.SWIPE_X_FILTER, eventProperties);
    }

    const dataCodeId = Number(slides[activeIndex].getAttribute('data-code-id') || -1);

    setActiveTabCodeIdState(dataCodeId);
  };

  useEffect(() => {
    if (swiperRef.current) {
      const { activeIndex } = swiperRef.current;

      if (activeIndex !== activeSlide) {
        swiperRef.current.slideTo(activeSlide);
      }
    }
  }, [activeSlide]);

  return (
    <Swiper
      onInit={(swiper) => {
        swiperRef.current = swiper;
      }}
      onSlideChange={handleSlideChange}
      onSlideChangeTransitionEnd={handleSlideChangeTransitionEnd}
      initialSlide={activeSlide}
      style={{
        height: '100%'
      }}
    >
      {(variant === 'search' || variant === 'camel') && (
        <SwiperSlide data-code-id={category}>
          <CategoryTabPanel />
        </SwiperSlide>
      )}
      {variant !== 'brands' && (
        <SwiperSlide data-code-id={brand}>
          <BrandTabPanel />
        </SwiperSlide>
      )}
      <SwiperSlide data-code-id={size}>
        <SizeTabPanel />
      </SwiperSlide>
      <SwiperSlide data-code-id={price}>
        <PriceTabPanel />
      </SwiperSlide>
      <SwiperSlide data-code-id={platform}>
        <PlatformTabPanel />
      </SwiperSlide>
      <SwiperSlide data-code-id={line}>
        <LineTabPanel />
      </SwiperSlide>
      <SwiperSlide data-code-id={detailOption}>
        <DetailOptionTabPanel />
      </SwiperSlide>
    </Swiper>
  );
}

export default FilterTabPanels;
