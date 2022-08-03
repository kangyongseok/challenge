import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';
import { Box, CtaButton, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { TouchIcon } from '@components/UI/atoms';
import {
  MyPortfolioBottomSheet,
  MyPortfolioLanding01,
  MyPortfolioLanding02,
  MyPortfolioLanding03,
  MyPortfolioLanding04,
  MyPortfolioLanding05,
  MyPortfolioLanding06,
  MyPortfolioLanding07,
  MyPortfolioLanding08,
  MyPortfolioLanding09,
  MyPotyfolioDialog
} from '@components/pages/myPortfolio';

import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import checkAgent from '@utils/checkAgent';

let globalCurrentSection = 0;
const SECTION_PAGE_NUM = 9;

function MyPortfolio() {
  const router = useRouter();
  const {
    theme: { palette }
  } = useTheme();
  const [innerHeight, setInnerHeight] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [openReservation, setOpenReservation] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('down');
  const wheelRef = useRef(false);
  const touchRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const startTargetRef = useRef<number>();
  const isSmallHeight = innerHeight < 630;

  const windowAddEvent = useCallback(() => {
    window.addEventListener('wheel', scrollEventControl);
    window.addEventListener('touchstart', touchStartControl, false);
    window.addEventListener('touchmove', touchEventControl, false);
  }, []);

  const windowRemoveEvent = useCallback(() => {
    window.removeEventListener('wheel', scrollEventControl);
    window.removeEventListener('touchstart', touchStartControl, false);
    window.removeEventListener('touchmove', touchEventControl, false);
  }, []);

  const bodyStyleSet = () => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    setInnerHeight(document.body.clientHeight);
  };

  const bodyStyleInit = () => {
    document.body.style.overflow = 'initial';
    document.body.style.position = 'initial';
    setInnerHeight(document.body.clientHeight);
  };

  const toggleEvent = useCallback(() => {
    if (openReservation) {
      windowRemoveEvent();
    } else {
      windowAddEvent();
      timeoutRef.current = setTimeout(() => {
        bodyStyleSet();
      }, 1000);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [openReservation, windowRemoveEvent, windowAddEvent]);

  useEffect(() => {
    ChannelTalk.hideChannelButton();
    return () => {
      setInnerHeight(0);
      setCurrentSection(0);
      globalCurrentSection = 0;
    };
  }, []);

  useEffect(() => {
    logEvent(attrKeys.myPortfolio.VIEW_MYPORTFOLIO, {
      name: attrProperty.productName.MYPORTFOLIO,
      title: `STEP0${currentSection + 1}`
    });
  }, [currentSection]);

  useEffect(() => {
    ChannelTalk.hideChannelButton();
    toggleEvent();
  }, [openReservation, toggleEvent]);

  useEffect(() => {
    bodyStyleSet();
    windowAddEvent();
    return () => {
      bodyStyleInit();
      windowRemoveEvent();
    };
  }, [windowAddEvent, windowRemoveEvent]);

  const touchStartControl = (e: TouchEvent) => {
    startTargetRef.current = e.targetTouches[0].clientY;
  };

  const touchEventControl = (e: TouchEvent) => {
    if (!touchRef.current && startTargetRef.current) {
      touchRef.current = true;
      if (
        startTargetRef.current - e.targetTouches[0].clientY >= 5 &&
        globalCurrentSection < SECTION_PAGE_NUM - 1
      ) {
        globalCurrentSection += 1;
        setScrollDirection('down');
        setCurrentSection((section) => {
          return section + 1;
        });
      }
      if (startTargetRef.current - e.targetTouches[0].clientY < -5 && globalCurrentSection > 0) {
        globalCurrentSection -= 1;
        setScrollDirection('up');
        setCurrentSection((section) => section - 1);
      }
      setTimeout(() => {
        touchRef.current = false;
      }, 800);
    }
  };

  const scrollEventControl = (e: { deltaY: number }) => {
    if (!wheelRef.current) {
      wheelRef.current = true;
      if (e.deltaY > 0 && globalCurrentSection < SECTION_PAGE_NUM - 1) {
        globalCurrentSection += 1;
        setScrollDirection('down');
        setCurrentSection((section) => {
          return section + 1;
        });
      }
      if (e.deltaY < 0 && globalCurrentSection > 0) {
        globalCurrentSection -= 1;
        setScrollDirection('up');
        setCurrentSection((section) => section - 1);
      }
      setTimeout(() => {
        wheelRef.current = false;
      }, 1400);
    }
  };

  const handleClickReservation = () => {
    if (currentSection !== 0 && currentSection !== 8) {
      logEvent(attrKeys.myPortfolio.CLICK_RESERVATION, {
        name: attrProperty.productName.MYPORTFOLIO,
        title: attrProperty.productTitle.HEADER
      });
    } else {
      logEvent(attrKeys.myPortfolio.CLICK_RESERVATION, {
        name: attrProperty.productName.MYPORTFOLIO,
        title: `STEP0${currentSection + 1}`
      });
    }

    setOpenReservation(true);
  };
  const handleClose = () => {
    setOpenReservation(false);
  };

  const getBackgroundColor = () => {
    switch (currentSection) {
      case 0:
      case 1:
        return palette.common.black;
      case 2:
      case 3:
      case 5:
      case 7:
        return palette.common.grey['95'];
      default:
        return palette.common.white;
    }
  };

  const myPortfolioSectionData: {
    key: string;
    Component: ReactNode;
    width?: number;
  }[] = [
    {
      key: 'intro',
      Component: (
        <MyPortfolioLanding01 onClick={handleClickReservation} isSmallHeight={isSmallHeight} />
      )
    },
    {
      key: 'mapcount',
      Component: (
        <MyPortfolioLanding02 isSmallHeight={isSmallHeight} isAnimation={currentSection === 1} />
      )
    },
    {
      key: 'myproduct1',
      Component: (
        <MyPortfolioLanding03
          currentSection={currentSection}
          isSmallHeight={isSmallHeight}
          isHidden={currentSection === 3 || scrollDirection === 'up'}
        />
      )
    },
    {
      key: 'myproduct2',
      Component: <MyPortfolioLanding04 isAnimation={currentSection >= 3} />
    },
    { key: 'price', Component: <MyPortfolioLanding05 /> },
    { key: 'maxprice', Component: <MyPortfolioLanding06 /> },
    {
      key: 'favorit',
      Component: <MyPortfolioLanding07 />,
      width: 100
    },
    { key: 'sellprice', Component: <MyPortfolioLanding08 /> },
    {
      key: 'reservation',
      Component: (
        <MyPortfolioLanding09 onClick={handleClickReservation} isAnimation={currentSection === 8} />
      )
    }
  ];

  return (
    <>
      <LandingHeader
        isBorder={currentSection > 0}
        borderColor={currentSection === 1 ? palette.common.grey['20'] : palette.common.grey['90']}
        alignment="center"
        direction="horizontal"
        isHidden={SECTION_PAGE_NUM - 1 === currentSection}
        bgColor={getBackgroundColor()}
      >
        <Flexbox alignment="center">
          {checkAgent.isMobileApp() && (
            <LogoAnimationWrap currentSection={currentSection}>
              <TouchIcon
                name="ArrowLeftOutlined"
                onClick={() => {
                  logEvent(attrKeys.myPortfolio.CLICK_BACK, {
                    name: attrProperty.productName.MYPORTFOLIO
                  });
                  router.back();
                }}
                direction="left"
              />
            </LogoAnimationWrap>
          )}
          <Flexbox direction="vertical">
            <LogoAnimationWrap currentSection={currentSection}>
              <Icon
                name="LogoText_96_20"
                height={12}
                width={62}
                onClick={() => {
                  logEvent(attrKeys.myPortfolio.CLICK_LOGO, {
                    name: attrProperty.productName.MYPORTFOLIO
                  });
                  router.push('/');
                }}
              />
            </LogoAnimationWrap>
            <Box customStyle={{ marginLeft: 3 }}>
              {currentSection === 1 ? <GradationText /> : currentSection > 1 && <GradationText2 />}
            </Box>
          </Flexbox>
        </Flexbox>
        {currentSection > 0 && (
          <ReservationButton onClick={handleClickReservation} variant="contained">
            사전예약
          </ReservationButton>
        )}
      </LandingHeader>
      {(currentSection === 2 || currentSection === 3) &&
        (scrollDirection === 'down' || currentSection === 2 || scrollDirection === 'up') && (
          <FixedTitle isSmallHeight={isSmallHeight} currentSection={currentSection}>
            <Typography weight="bold" variant="h2" customStyle={{ width: 400, margin: '0 auto' }}>
              궁금했던 내 명품의 가치를
            </Typography>
            <Typography weight="bold" variant="h2" customStyle={{ width: 400, margin: '0 auto' }}>
              가장 먼저 알아보세요.
            </Typography>
          </FixedTitle>
        )}
      <StyledWrap innerHeight={innerHeight * currentSection} bgColor={getBackgroundColor()}>
        {myPortfolioSectionData.map(({ key, Component, width }) => (
          <Section contentsHeight={innerHeight} key={`section-landing-${key}`} sectionWidth={width}>
            {Component}
          </Section>
        ))}
      </StyledWrap>
      <MyPortfolioBottomSheet
        innerHeight={innerHeight}
        onClick={handleClose}
        openReservation={openReservation}
      />
      <MyPotyfolioDialog />
    </>
  );
}

const LandingHeader = styled(Flexbox)<{
  isBorder: boolean;
  isHidden: boolean;
  borderColor: string;
  bgColor: string;
}>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 66px;
  padding: 0 20px;
  z-index: 10;
  background: ${({ bgColor }) => bgColor};
  border-bottom: ${({ isBorder, borderColor }) =>
    isBorder && borderColor ? `1px solid ${borderColor}` : 'none'};
  display: ${({ isHidden }) => (isHidden ? 'none' : 'flex')};
  transition: all 0.3s;
`;

const FixedTitle = styled.div<{ isSmallHeight: boolean; currentSection: number }>`
  position: fixed;
  top: ${({ isSmallHeight }) => (isSmallHeight ? 80 : 117)}px;
  left: 0;
  width: 100%;
  z-index: 5;
  padding: 0 20px;
  animation: fadeIn 0.8s forwards;
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    90% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

const LogoAnimationWrap = styled.div<{ currentSection: number }>`
  svg {
    color: ${({ currentSection }) => (currentSection > 1 ? 'black' : 'white')};
    ${({ currentSection }): CSSObject =>
      currentSection === 2 ? { animation: 'colorChange 2s forwards' } : {}};
  }
  @keyframes colorChange {
    0% {
      color: white;
    }
    100% {
      color: black;
    }
  }
`;

const ReservationButton = styled(CtaButton)`
  min-width: 78px;
  height: 41px;
  margin-left: auto;
  background: linear-gradient(90deg, #1833ff 0%, #5800e5 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border-radius: 50px;
  color: white;
`;

const StyledWrap = styled.div<{ innerHeight: number; bgColor: string }>`
  transform: translate3d(0px, -${({ innerHeight }) => innerHeight && innerHeight}px, 0);
  transition: all 700ms ease 0s;
  width: 100vw;
  background: ${({ bgColor }) => bgColor};
`;

const Section = styled.section<{
  contentsHeight: number;
  bgColor?: string;
  sectionWidth?: number;
}>`
  max-width: ${({ sectionWidth }) => (sectionWidth ? `${sectionWidth}vw` : '440px')};
  margin: 0 auto;
  height: ${({ contentsHeight }) => `${contentsHeight}px` || '100vh'};
  overflow: hidden;
  padding-top: 65px;
`;

function GradationText() {
  return (
    <svg
      width="117"
      height="27"
      viewBox="0 0 137 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.8027 0.992188H11.1816L7.45508 7.17969L3.72852 0.992188H0.107422V14H3.48242V6.03711L6.98047 11.75H7.92969L11.4277 6.03711V14H14.8027V0.992188ZM23.9895 9.16602L28.7883 0.992188H25.0793L22.3195 6.37109L19.5598 0.992188H15.8332L20.6145 9.16602V14H23.9895V9.16602ZM39.6383 0.992188H34.5934V14H37.9684V10.0977H39.6383C42.8199 10.0977 44.9117 8.62109 44.9117 5.63281C44.9117 2.78516 43.066 0.992188 39.6383 0.992188ZM37.9684 7.25V3.96289H39.6383C40.8512 3.96289 41.5016 4.64844 41.5016 5.63281C41.5016 6.59961 40.8512 7.25 39.6383 7.25H37.9684ZM52.4813 0.763672C48.6316 0.763672 45.7313 3.68164 45.7313 7.49609C45.7313 11.3281 48.6316 14.2461 52.4813 14.2461C56.3309 14.2461 59.2488 11.3281 59.2488 7.49609C59.2488 3.68164 56.3309 0.763672 52.4813 0.763672ZM49.1063 7.49609C49.1063 5.50977 50.5477 4.05078 52.4813 4.05078C54.4324 4.05078 55.8738 5.50977 55.8738 7.49609C55.8738 9.48242 54.4324 10.9414 52.4813 10.9414C50.5477 10.9414 49.1063 9.48242 49.1063 7.49609ZM65.8164 9.60547L68.1719 14H71.8633L68.9277 8.9375C70.2285 8.30469 71.002 7.10938 71.002 5.42188C71.002 2.5918 69.1387 0.992188 65.7285 0.992188H60.7188V14H64.0938V9.62305H65.3242C65.5 9.62305 65.6582 9.62305 65.8164 9.60547ZM64.0938 6.88086V3.96289H65.7285C66.9766 3.96289 67.5918 4.50781 67.5918 5.42188C67.5918 6.37109 66.9766 6.88086 65.7285 6.88086H64.0938ZM81.8234 4.10352V0.992188H72.1379V4.10352H75.2844V14H78.6594V4.10352H81.8234ZM86.6332 3.96289H91.9066V0.992188H83.2758V14H86.6332V9.3418H91.3617V6.59961H86.6332V3.96289ZM99.652 0.763672C95.8023 0.763672 92.902 3.68164 92.902 7.49609C92.902 11.3281 95.8023 14.2461 99.652 14.2461C103.502 14.2461 106.42 11.3281 106.42 7.49609C106.42 3.68164 103.502 0.763672 99.652 0.763672ZM96.277 7.49609C96.277 5.50977 97.7184 4.05078 99.652 4.05078C101.603 4.05078 103.045 5.50977 103.045 7.49609C103.045 9.48242 101.603 10.9414 99.652 10.9414C97.7184 10.9414 96.277 9.48242 96.277 7.49609ZM116.415 10.8887H111.264V0.992188H107.889V14H116.415V10.8887ZM121.207 0.992188H117.832V14H121.207V0.992188ZM129.409 0.763672C125.56 0.763672 122.659 3.68164 122.659 7.49609C122.659 11.3281 125.56 14.2461 129.409 14.2461C133.259 14.2461 136.177 11.3281 136.177 7.49609C136.177 3.68164 133.259 0.763672 129.409 0.763672ZM126.034 7.49609C126.034 5.50977 127.476 4.05078 129.409 4.05078C131.361 4.05078 132.802 5.50977 132.802 7.49609C132.802 9.48242 131.361 10.9414 129.409 10.9414C127.476 10.9414 126.034 9.48242 126.034 7.49609Z"
        fill="url(#paint0_linear_659_14521)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_659_14521"
          x1="-1"
          y1="7.5"
          x2="137"
          y2="7.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#808EFF" />
          <stop offset="1" stopColor="#B080FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function GradationText2() {
  return (
    <svg
      width="117"
      height="27"
      viewBox="0 0 137 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.8027 0.992188H11.1816L7.45508 7.17969L3.72852 0.992188H0.107422V14H3.48242V6.03711L6.98047 11.75H7.92969L11.4277 6.03711V14H14.8027V0.992188ZM23.9895 9.16602L28.7883 0.992188H25.0793L22.3195 6.37109L19.5598 0.992188H15.8332L20.6145 9.16602V14H23.9895V9.16602ZM39.6383 0.992188H34.5934V14H37.9684V10.0977H39.6383C42.8199 10.0977 44.9117 8.62109 44.9117 5.63281C44.9117 2.78516 43.066 0.992188 39.6383 0.992188ZM37.9684 7.25V3.96289H39.6383C40.8512 3.96289 41.5016 4.64844 41.5016 5.63281C41.5016 6.59961 40.8512 7.25 39.6383 7.25H37.9684ZM52.4813 0.763672C48.6316 0.763672 45.7313 3.68164 45.7313 7.49609C45.7313 11.3281 48.6316 14.2461 52.4813 14.2461C56.3309 14.2461 59.2488 11.3281 59.2488 7.49609C59.2488 3.68164 56.3309 0.763672 52.4813 0.763672ZM49.1063 7.49609C49.1063 5.50977 50.5477 4.05078 52.4813 4.05078C54.4324 4.05078 55.8738 5.50977 55.8738 7.49609C55.8738 9.48242 54.4324 10.9414 52.4813 10.9414C50.5477 10.9414 49.1063 9.48242 49.1063 7.49609ZM65.8164 9.60547L68.1719 14H71.8633L68.9277 8.9375C70.2285 8.30469 71.002 7.10938 71.002 5.42188C71.002 2.5918 69.1387 0.992188 65.7285 0.992188H60.7188V14H64.0938V9.62305H65.3242C65.5 9.62305 65.6582 9.62305 65.8164 9.60547ZM64.0938 6.88086V3.96289H65.7285C66.9766 3.96289 67.5918 4.50781 67.5918 5.42188C67.5918 6.37109 66.9766 6.88086 65.7285 6.88086H64.0938ZM81.8234 4.10352V0.992188H72.1379V4.10352H75.2844V14H78.6594V4.10352H81.8234ZM86.6332 3.96289H91.9066V0.992188H83.2758V14H86.6332V9.3418H91.3617V6.59961H86.6332V3.96289ZM99.652 0.763672C95.8023 0.763672 92.902 3.68164 92.902 7.49609C92.902 11.3281 95.8023 14.2461 99.652 14.2461C103.502 14.2461 106.42 11.3281 106.42 7.49609C106.42 3.68164 103.502 0.763672 99.652 0.763672ZM96.277 7.49609C96.277 5.50977 97.7184 4.05078 99.652 4.05078C101.603 4.05078 103.045 5.50977 103.045 7.49609C103.045 9.48242 101.603 10.9414 99.652 10.9414C97.7184 10.9414 96.277 9.48242 96.277 7.49609ZM116.415 10.8887H111.264V0.992188H107.889V14H116.415V10.8887ZM121.207 0.992188H117.832V14H121.207V0.992188ZM129.409 0.763672C125.56 0.763672 122.659 3.68164 122.659 7.49609C122.659 11.3281 125.56 14.2461 129.409 14.2461C133.259 14.2461 136.177 11.3281 136.177 7.49609C136.177 3.68164 133.259 0.763672 129.409 0.763672ZM126.034 7.49609C126.034 5.50977 127.476 4.05078 129.409 4.05078C131.361 4.05078 132.802 5.50977 132.802 7.49609C132.802 9.48242 131.361 10.9414 129.409 10.9414C127.476 10.9414 126.034 9.48242 126.034 7.49609Z"
        fill="url(#paint0_linear_659_14521)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_659_14521"
          x1="-1"
          y1="7.5"
          x2="137"
          y2="7.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1833FF" />
          <stop offset="1" stopColor="#5800E5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default MyPortfolio;
