import { useEffect, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import type { Swiper as SwiperClass } from 'swiper';
import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, ThemeProvider, Typography, dark } from 'mrcamel-ui';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import { AppIntro01, AppIntro02, AppIntro03, AppIntro04 } from '@components/pages/appIntro';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { IS_FOR_ALARM_FIRST_VISIT } from '@constants/localStorage';
import { IOS_SAFE_AREA_TOP } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent, isExtendedLayoutIOSVersion } from '@utils/common';

import { prevChannelAlarmPopup } from '@recoil/common';

function AppIntroStep() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const setPrevChannelAlarmPopup = useSetRecoilState(prevChannelAlarmPopup);

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

  useEffect(() => {
    if (checkAgent.isIOSApp()) {
      LocalStorage.set(IS_FOR_ALARM_FIRST_VISIT, true);
      setPrevChannelAlarmPopup(true);
    }
  }, [setPrevChannelAlarmPopup]);

  return (
    <ThemeProvider theme="dark">
      <GeneralTemplate hideAppDownloadBanner>
        <Login
          variant="h4"
          weight="bold"
          onClick={handleClick}
          isHeight={isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : 0}
        >
          로그인
        </Login>
        <StyledWrap currentStep={currentStep}>
          <Swiper pagination modules={[Pagination]} onSlideChange={handleChange}>
            <SwiperSlide>
              <SwiperContents alignment="center" justifyContent="center" direction="vertical">
                <AppIntro01 />
              </SwiperContents>
            </SwiperSlide>
            <SwiperSlide>
              <SwiperContents alignment="center" justifyContent="center" direction="vertical">
                <AppIntro02 animationStart={currentStep === 1} />
              </SwiperContents>
            </SwiperSlide>
            <SwiperSlide>
              <SwiperContents alignment="center" justifyContent="center" direction="vertical">
                <AppIntro03 animationStart={currentStep === 2} />
              </SwiperContents>
            </SwiperSlide>
            <SwiperSlide>
              <SwiperContents alignment="center" justifyContent="center" direction="vertical">
                <AppIntro04 animationStart={currentStep === 3} />
              </SwiperContents>
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

const Login = styled(Typography)<{ isHeight: number | typeof IOS_SAFE_AREA_TOP }>`
  position: absolute;
  top: ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : 0};
  right: 0;
  color: ${dark.palette.common.ui60};
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  padding: 32px;
`;

const SwiperContents = styled(Flexbox)`
  height: 100vh;
  height: calc((var(--vh, 1vh) * 100));
`;

export default AppIntroStep;
