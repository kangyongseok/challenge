import { useEffect, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import type { Swiper as SwiperClass } from 'swiper';
import { useRouter } from 'next/router';
import { ThemeProvider, Typography, dark } from 'mrcamel-ui';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import { AppIntro01, AppIntro02, AppIntro03, AppIntro04 } from '@components/pages/appIntro';

import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import { APP_TOP_STATUS_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

function AppIntroStep() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    ChannelTalk.hideChannelButton();
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }, []);

  const handleChange = (swiper: SwiperClass) => {
    const { activeIndex } = swiper;
    logEvent(attrKeys.intro.SWIPE_X_APPINTRO, {
      index: activeIndex
    });
    setCurrentStep(activeIndex);
  };

  const handleClick = () => {
    logEvent(attrKeys.intro.CLICK_LOGIN, {
      name: attrProperty.name.APP_INTRO,
      title: attrProperty.title.TOP
    });

    router.push('/login');
  };

  return (
    <ThemeProvider theme="dark">
      <GeneralTemplate hideAppDownloadBanner>
        <Login
          variant="h4"
          weight="bold"
          onClick={handleClick}
          isHeight={isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0}
        >
          로그인
        </Login>
        <StyledWrap currentStep={currentStep}>
          <Swiper pagination modules={[Pagination]} onSlideChange={handleChange}>
            <SwiperSlide>
              <AppIntro01 />
            </SwiperSlide>
            <SwiperSlide>
              <AppIntro02 animationStart={currentStep === 1} />
            </SwiperSlide>
            <SwiperSlide>
              <AppIntro03 animationStart={currentStep === 2} />
            </SwiperSlide>
            <SwiperSlide>
              <AppIntro04 animationStart={currentStep === 3} />
            </SwiperSlide>
          </Swiper>
        </StyledWrap>
      </GeneralTemplate>
    </ThemeProvider>
  );
}

const StyledWrap = styled.div<{ currentStep: number }>`
  margin-left: -20px;
  width: calc(100% + 40px);
  .swiper-pagination {
    bottom: ${({ currentStep }) => (currentStep !== 3 ? 30 : 0)}px;
    display: ${({ currentStep }) => (currentStep === 3 ? 'none' : 'block')};
  }
  .swiper-pagination-bullet {
    background: ${dark.palette.common.ui90};
    width: 6px;
    height: 6px;
    opacity: 1;
  }
  .swiper-pagination-bullet-active {
    width: 18px;
    border-radius: 9px;
    background: ${dark.palette.common.uiBlack};
  }
`;

const Login = styled(Typography)<{ isHeight: number }>`
  position: absolute;
  top: ${({ isHeight }) => isHeight}px;
  right: 0;
  color: ${dark.palette.common.ui60};
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  padding: 32px;
`;

export default AppIntroStep;
