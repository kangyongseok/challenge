import { MouseEvent, useEffect, useRef } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { Box, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { ProductTitle, TopButton } from '@components/UI/molecules';

import type { SearchAiProductParams } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchBaseInfo } from '@api/personal';

import queryKeys from '@constants/queryKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import getCenterScrollLeft from '@utils/getCenterScrollLeft';

import { currentSlideState, searchParamsState } from '@recoil/personalProductCuration';
import { deviceIdState, showAppDownloadBannerState } from '@recoil/common';
import useScrollTrigger from '@hooks/useScrollTrigger';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function HomeAiCategories() {
  const [currentSlide, setCurrentSlideState] = useRecoilState(currentSlideState);
  const deviceId = useRecoilValue(deviceIdState);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const setSearchParamsState = useSetRecoilState(searchParamsState);
  const { data: accessUser } = useQueryAccessUser();
  const { data: baseInfo } = useQuery(queryKeys.personals.baseInfo(deviceId), () =>
    fetchBaseInfo(deviceId)
  );

  const aiCategoryMenuRef = useRef<HTMLDivElement | null>(null);
  const aiCategoryRefs = useRef<HTMLDivElement[] | null[]>([]);
  const prevCurrentSlideRef = useRef(-1);
  const infoRef = useRef<HTMLDivElement | null>(null);

  const triggered = useScrollTrigger({ ref: infoRef });

  const handleClickAiCategory = (e: MouseEvent<HTMLDivElement>) => {
    logEvent(attrKeys.home.CLICK_PERSONAL_TAG, {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.PERSONAL,
      index: Number(e.currentTarget.dataset.index) + 1,
      tag: e.currentTarget.dataset.tagName
    });

    const dataIndex = Number(e.currentTarget.getAttribute('data-index') || 0);

    setCurrentSlideState(dataIndex);

    if (infoRef.current) {
      const { scrollY } = window;
      const { top } = infoRef.current.getBoundingClientRect();
      window.scrollTo(
        0,
        scrollY + top - 26 - (showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0)
      );
    }
  };

  useEffect(() => {
    const { aiCategories = [] } = baseInfo || {};
    if (aiCategories.length) {
      const brandId = Number(aiCategories[currentSlide].brand?.id);
      const categoryId = Number(aiCategories[currentSlide].category.id);
      const { searchTag } = aiCategories[currentSlide];

      if (currentSlide !== prevCurrentSlideRef.current) {
        const newSearchAiProductParams: SearchAiProductParams = {
          size: 30,
          brandIds: Number.isNaN(brandId) ? undefined : [brandId],
          categoryIds: Number.isNaN(categoryId) ? undefined : [categoryId],
          page: 0
        };

        const { brandIds: newBrandIds = [], categoryIds: newCategoryIds = [] } =
          newSearchAiProductParams;

        if (!newBrandIds.filter((id) => id).length) delete newSearchAiProductParams.brandIds;
        if (!newCategoryIds.filter((id) => id).length) delete newSearchAiProductParams.categoryIds;

        if (
          searchTag &&
          !newSearchAiProductParams.brandIds &&
          !newSearchAiProductParams.categoryIds
        )
          newSearchAiProductParams.keyword = searchTag;

        setSearchParamsState(newSearchAiProductParams);
      }
      prevCurrentSlideRef.current = currentSlide;
    }
  }, [setSearchParamsState, baseInfo, currentSlide]);

  useEffect(() => {
    if (aiCategoryMenuRef.current) {
      const aiCategoryRef = aiCategoryRefs.current[currentSlide];

      if (!aiCategoryRef) return;

      const { scrollWidth, clientWidth } = aiCategoryMenuRef.current;
      const { offsetLeft: targetOffsetLeft, clientWidth: targetClientWidth } = aiCategoryRef;

      aiCategoryMenuRef.current.scrollTo({
        left: getCenterScrollLeft({
          scrollWidth,
          clientWidth,
          targetOffsetLeft,
          targetClientWidth
        }),
        behavior: 'smooth'
      });
    }
  }, [currentSlide]);

  return (
    <>
      <Box ref={infoRef} customStyle={{ marginTop: 46 }}>
        <ProductTitle
          title={`${accessUser?.userName ? accessUser.userName : '회원'}님을 위한 실시간 추천 매물`}
          description="카멜이 전국에서 꿀매물만 모아왔어요."
        />
      </Box>
      <AiCategoryMenu ref={aiCategoryMenuRef} showAppDownloadBanner={showAppDownloadBanner}>
        {baseInfo?.aiCategories.map(({ viewTag, brand, category }, index) => {
          const isActive = currentSlide === index;
          return (
            <AiCategory
              key={`aiCategory-${viewTag}-${(brand || {}).id || 0}-${(category || {}).id || 0}`}
              ref={(ref) => {
                if (ref) {
                  aiCategoryRefs.current[index] = ref;
                }
              }}
              isActive={isActive}
              variant="body1"
              weight={isActive ? 'bold' : 'medium'}
              data-index={index}
              data-tag-name={viewTag}
              onClick={handleClickAiCategory}
            >{`#${viewTag}`}</AiCategory>
          );
        })}
      </AiCategoryMenu>
      <TopButton
        show={triggered}
        customStyle={{
          bottom: 136
        }}
        name="MAIN"
      />
    </>
  );
}

const AiCategoryMenu = styled.div<{ showAppDownloadBanner: boolean }>`
  position: sticky;
  width: calc(100% + 40px);
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? 80 + APP_DOWNLOAD_BANNER_HEIGHT : 80}px;
  margin: 8px -20px 0;
  padding: 0 20px;
  border-bottom: ${({
    theme: {
      palette: { common }
    }
  }) => `1px solid ${common.grey['90']}`};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.white};
  z-index: 2;
  overflow-x: auto;
  white-space: nowrap;

  & > div {
    margin-right: 20px;
    &:last-child {
      margin-right: 0;
    }
  }
`;

const AiCategory = styled(Typography)<{ isActive: boolean }>`
  display: inline-block;
  min-width: fit-content;
  color: ${({
    theme: {
      palette: { common }
    },
    isActive
  }) => common.grey[isActive ? '20' : '60']};
  padding: 8px 0;
  cursor: pointer;

  & :after {
    content: ${({ isActive }) => isActive && ''};
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${({
      theme: {
        palette: { common }
      }
    }) => common.grey['20']};
  }
`;

export default HomeAiCategories;
