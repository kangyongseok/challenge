import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

// import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
// import { useMutation } from '@tanstack/react-query';
import { Button, Flexbox, Icon, dark, useTheme } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { PageHead, TouchIcon } from '@components/UI/atoms';
import { MyPortfolioPagenation } from '@components/pages/myPortfolio';
import {
  ButlerDemo01,
  ButlerDemo02,
  ButlerDemo03,
  ButlerDemo04,
  ButlerDemo05
} from '@components/pages/butler';

import { logEvent } from '@library/amplitude';

// import { postPreReserve } from '@api/user';

import { IOS_SAFE_AREA_TOP } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent, isExtendedLayoutIOSVersion } from '@utils/common';

// import { SuccessDialogState } from '@recoil/myPortfolio';
// import useQueryAccessUser from '@hooks/useQueryAccessUser';

let globalCurrentSection = 0;
const SECTION_PAGE_NUM = 5;

function Demo() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  // const { data: accessUser } = useQueryAccessUser();
  const [innerHeight, setInnerHeight] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  // const [openReservation, setOpenReservation] = useState(false);
  // const { mutate: mutatePostManage } = useMutation(postPreReserve);
  // const successDialog = useSetRecoilState(SuccessDialogState);

  const wheelRef = useRef(false);
  const touchRef = useRef(false);
  // const timeoutRef = useRef<NodeJS.Timeout>();
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
    setTimeout(() => {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      setInnerHeight(document.body.clientHeight);
    }, 500);
  };

  const bodyStyleInit = () => {
    setTimeout(() => {
      document.body.style.overflow = 'initial';
      document.body.style.position = 'initial';
      setInnerHeight(document.body.clientHeight);
    }, 500);
  };

  useEffect(() => {
    return () => {
      setInnerHeight(0);
      setCurrentSection(0);
      globalCurrentSection = 0;
    };
  }, []);

  useEffect(() => {
    logEvent(attrKeys.events.VIEW_BUTLER, {
      name: attrProperty.name.BUTLER,
      title: `STEP0${currentSection + 1}`
    });
  }, [currentSection]);

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
        setCurrentSection((section) => {
          return section + 1;
        });
      }
      if (startTargetRef.current - e.targetTouches[0].clientY < -5 && globalCurrentSection > 0) {
        globalCurrentSection -= 1;
        setCurrentSection((section) => section - 1);
      }
      setTimeout(() => {
        touchRef.current = false;
      }, 500);
    }
  };

  const scrollEventControl = (e: { deltaY: number }) => {
    if (!wheelRef.current) {
      wheelRef.current = true;
      if (e.deltaY > 0 && globalCurrentSection < SECTION_PAGE_NUM - 1) {
        globalCurrentSection += 1;
        setCurrentSection((section) => {
          return section + 1;
        });
      }
      if (e.deltaY < 0 && globalCurrentSection > 0) {
        globalCurrentSection -= 1;
        setCurrentSection((section) => section - 1);
      }

      setTimeout(() => {
        wheelRef.current = false;
      }, 1000);
    }
  };

  const getBackgroundColor = () => {
    switch (currentSection) {
      case 0:
        return common.uiBlack;
      case 4:
        return dark.palette.common.bg03;
      default:
        return common.uiWhite;
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
        <ButlerDemo01
          onClick={() => {
            globalCurrentSection = 4;
            setCurrentSection(4);
          }}
          isSmallHeight={isSmallHeight}
          onClickNext={() => {
            setCurrentSection(1);
            globalCurrentSection += 1;
          }}
        />
      )
    },
    {
      key: 'myproduct1',
      Component: <ButlerDemo02 currentSection={currentSection} />
    },
    { key: 'price', Component: <ButlerDemo03 currentSection={currentSection} /> },
    { key: 'maxprice', Component: <ButlerDemo04 currentSection={currentSection} /> },
    { key: 'register', Component: <ButlerDemo05 /> }
  ];

  return (
    <>
      <PageHead
        title="원하는 명품을 카멜이 대신 찾아드립니다 | Camel Butler"
        description="Camel Butler 서비스는, 원하는 모델과 예산을 알려주시면 카멜이 대신 사서 대신 검수 후 보내드리는 서비스 입니다"
        ogTitle="원하는 명품을 카멜이 대신 찾아드립니다 | Camel Butler"
        ogDescription="Camel Butler 서비스는, 원하는 모델과 예산을 알려주시면 카멜이 대신 사서 대신 검수 후 보내드리는 서비스 입니다"
        ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/events/butler_img01.png`}
        keywords="중고 명품 가방, 중고 명품 최저가, 중고 명품 맞춤 구매, Camel Bulter, 카멜 중고 명품, 중고 명품 실시간 거래, 중고 명품 감정, 중고 명품 구매 대행, 중고 명품 거래가, 중고 명품 시세, 중고 명품 새상품급"
      />
      <LandingHeader
        // isBorder={currentSection > 0}
        borderColor={[0, 4].includes(currentSection) ? common.ui20 : common.ui90}
        alignment="center"
        direction="horizontal"
        bgColor={getBackgroundColor()}
      >
        <Flexbox alignment="center">
          {checkAgent.isMobileApp() && (
            <LogoAnimationWrap currentSection={currentSection}>
              <TouchIcon
                name="ArrowLeftOutlined"
                onClick={() => {
                  logEvent(attrKeys.myPortfolio.CLICK_BACK, {
                    name: attrProperty.name.BUTLER
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
                name="Logo_45_45"
                height={18}
                // width={62}
                onClick={() => {
                  logEvent(attrKeys.myPortfolio.CLICK_LOGO, {
                    name: attrProperty.name.BUTLER
                  });
                  router.replace('/');
                }}
              />
              <Icon
                name="LogoText_96_20"
                height={12}
                width={62}
                customStyle={{ marginLeft: -10, marginRight: 7 }}
                onClick={() => {
                  logEvent(attrKeys.myPortfolio.CLICK_LOGO, {
                    name: attrProperty.name.BUTLER
                  });
                  router.replace('/');
                }}
              />
              <ButlerText color={[0, 4].includes(currentSection) ? 'white' : 'black'} />
            </LogoAnimationWrap>
          </Flexbox>
        </Flexbox>
        {currentSection !== 4 && (
          <Button
            size="medium"
            variant="solid"
            customStyle={{
              marginLeft: 'auto',
              borderRadius: 50,
              background: [0, 4].includes(currentSection)
                ? dark.palette.common.uiBlack
                : dark.palette.common.uiWhite,
              color: [0, 4].includes(currentSection)
                ? dark.palette.common.uiWhite
                : dark.palette.common.uiBlack
            }}
            onClick={() => {
              globalCurrentSection = 4;
              setCurrentSection(4);
            }}
          >
            <Icon
              name="AlarmFilled"
              color={[0, 4].includes(currentSection) ? 'uiBlack' : 'uiWhite'}
            />
            신청하기
          </Button>
        )}
      </LandingHeader>
      <StyledWrap innerHeight={innerHeight * currentSection} bgColor={getBackgroundColor()}>
        {myPortfolioSectionData.map(({ key, Component, width }) => (
          <Section
            contentsHeight={innerHeight}
            key={`section-landing-${key}`}
            sectionWidth={width}
            currentSection={currentSection}
          >
            {Component}
          </Section>
        ))}
      </StyledWrap>
      {currentSection > 0 && currentSection !== SECTION_PAGE_NUM - 1 && (
        <MyPortfolioPagenation currentSection={currentSection} totalPageNum={SECTION_PAGE_NUM} />
      )}
    </>
  );
}
export async function getStaticProps() {
  return { props: {} };
}

const LandingHeader = styled(Flexbox)<{
  borderColor: string;
  bgColor: string;
}>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + 66px);
  padding: ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : 0} 20px 0;
  z-index: 10;
  background: ${({ bgColor }) => bgColor};
  border-bottom: ${({ borderColor }) => (borderColor ? `1px solid ${borderColor}` : 'none')};
  transition: all 0.3s;
`;

const LogoAnimationWrap = styled.div<{ currentSection: number }>`
  svg {
    color: ${({ currentSection }) => ([0, 4].includes(currentSection) ? 'white' : 'black')};
    /* ${({ currentSection }): CSSObject =>
      currentSection === 2 ? { animation: 'colorChange 2s forwards' } : {}}; */
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

const StyledWrap = styled.div<{ innerHeight: number; bgColor: string }>`
  transform: translate3d(0px, -${({ innerHeight }) => innerHeight && innerHeight}px, 0);
  transition: all 700ms ease 0s;
  width: 100vw;
  min-height: 100%;
  background: ${({ bgColor }) => bgColor};
`;

const Section = styled.section<{
  contentsHeight: number;
  bgColor?: string;
  sectionWidth?: number;
  currentSection: number;
}>`
  max-width: ${({ sectionWidth }) => (sectionWidth ? `${sectionWidth}vw` : '440px')};
  margin: 0 auto;
  height: ${({ contentsHeight }) => `${contentsHeight}px` || '100vh'};
  overflow: hidden;
  padding-top: ${({ currentSection }) => (currentSection === 0 ? 55 : 65)}px;
  position: relative;
`;

function ButlerText({ color }: { color: 'black' | 'white' }) {
  return (
    <svg width="63" height="12" viewBox="0 0 63 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.53967 5.45905C9.45549 4.97704 10.0339 4.10942 10.0339 2.98474C10.0339 1.23344 8.58787 0.0605469 5.77615 0.0605469H0.28125V11.3074H6.09749C9.05382 11.3074 10.5962 10.1827 10.5962 8.23864C10.5962 6.82474 9.7929 5.86072 8.53967 5.45905ZM5.45481 2.02072C6.72411 2.02072 7.41498 2.45453 7.41498 3.33821C7.41498 4.22189 6.72411 4.67177 5.45481 4.67177H2.86803V2.02072H5.45481ZM5.90469 9.34726H2.86803V6.56767H5.90469C7.25431 6.56767 7.97733 7.01755 7.97733 7.9655C7.97733 8.92951 7.25431 9.34726 5.90469 9.34726Z"
        fill={color}
      />
      <path
        d="M17.0817 11.5002C20.279 11.5002 22.1749 9.6686 22.1749 6.3588V0.0605469H19.6042V6.2624C19.6042 8.39931 18.6884 9.28299 17.0977 9.28299C15.5232 9.28299 14.5913 8.39931 14.5913 6.2624V0.0605469H11.9884V6.3588C11.9884 9.6686 13.8843 11.5002 17.0817 11.5002Z"
        fill={color}
      />
      <path
        d="M26.4064 11.3074H29.0092V2.18139H32.6082V0.0605469H22.8074V2.18139H26.4064V11.3074Z"
        fill={color}
      />
      <path d="M33.5267 11.3074H41.7691V9.18659H36.1295V0.0605469H33.5267V11.3074Z" fill={color} />
      <path
        d="M45.3281 9.21872V6.61587H50.5499V4.59143H45.3281V2.14925H51.2408V0.0605469H42.7414V11.3074H51.4497V9.21872H45.3281Z"
        fill={color}
      />
      <path
        d="M63.0002 11.3074L60.4777 7.69236C61.9398 7.06575 62.7913 5.82859 62.7913 4.14156C62.7913 1.61904 60.9115 0.0605469 57.9069 0.0605469H53.0387V11.3074H55.6415V8.17437H57.9069H58.0355L60.2045 11.3074H63.0002ZM60.1563 4.14156C60.1563 5.36265 59.353 6.10173 57.7623 6.10173H55.6415V2.18139H57.7623C59.353 2.18139 60.1563 2.9044 60.1563 4.14156Z"
        fill={color}
      />
    </svg>
  );
}

export default Demo;
