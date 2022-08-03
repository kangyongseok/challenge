import { useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import { Box, CtaButton, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import Image from '@components/UI/atoms/Image';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { handleClickAppDownload } from '@utils/common';
import checkAgent from '@utils/checkAgent';

import AnimationGraph from './AnimationGraph';

const slideImage = [
  { img: 'shoes01', text: '내가 신고있는 스니커즈,' },
  { img: 'bag01', text: '내가 들고있는 명품가방,' },
  { img: 'watch01', text: '내 손목의 명품시계,' },
  { img: 'shoes02', text: '내가 신고있는 스니커즈,' },
  { img: 'bag02', text: '내가 들고있는 명품가방,' },
  { img: 'watch02', text: '내 손목의 명품시계,' }
];

function MyPortfolioLanding01({
  isSmallHeight,
  onClick
}: {
  isSmallHeight: boolean;
  onClick: () => void;
}) {
  const {
    theme: { palette }
  } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <>
      <Box customStyle={{ position: 'relative' }}>
        <Swiper
          loop
          slidesPerView={1}
          spaceBetween={10}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          speed={2000}
          modules={[Autoplay]}
        >
          {slideImage.map(({ img }) => (
            <SwiperSlide
              key={`pic-style-${img}`}
              style={{
                width: 320,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Image
                width={isSmallHeight ? 200 : 300}
                height={isSmallHeight ? 200 : 300}
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/${img}.png`}
                alt={img}
                disableAspectRatio
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <AnimationGraph activeIndex={activeIndex} />
      </Box>
      <Flexbox direction="vertical" customStyle={{ padding: '0 32px' }}>
        <GradationText />
        <Box customStyle={{ marginTop: 8 }}>
          <Swiper
            loop
            slidesPerView={1}
            spaceBetween={10}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            speed={2000}
            modules={[Autoplay]}
          >
            {slideImage.map(({ text, img }, i) => (
              <SwiperSlide key={`pic-style-${img}`}>
                <AnimationText
                  weight="bold"
                  variant="h2"
                  customStyle={{ color: palette.common.white, width: '100%' }}
                  active={activeIndex === i}
                >
                  {text}
                </AnimationText>
              </SwiperSlide>
            ))}
          </Swiper>

          <Typography weight="bold" variant="h2" customStyle={{ color: palette.common.white }}>
            지금 팔면 얼마일까?
          </Typography>
        </Box>
        <Box customStyle={{ marginTop: 12 }}>
          <Typography variant="h4" customStyle={{ color: palette.common.grey['80'] }}>
            카멜이 수집한 3천만개의 데이터 기반으로
          </Typography>
          <Typography variant="h4" customStyle={{ color: palette.common.grey['80'] }}>
            정확한 시세정보를 알려드려요.
          </Typography>
        </Box>
        <Flexbox gap={8} alignment="center" customStyle={{ marginTop: 32 }}>
          {!checkAgent.isMobileApp() ? (
            <>
              <RevervationCtaButton onClick={onClick} variant="contained">
                사전예약하기
              </RevervationCtaButton>
              <CtaButton
                variant="contained"
                customStyle={{ borderRadius: 50 }}
                onClick={() => {
                  logEvent(attrKeys.myPortfolio.CLICK_APPDOWNLOAD, {
                    name: attrProperty.productName.MYPORTFOLIO,
                    title: attrProperty.productTitle.STEP01
                  });
                  handleClickAppDownload({});
                }}
              >
                앱 다운로드
              </CtaButton>
            </>
          ) : (
            <RevervationCtaButton onClick={onClick} variant="contained">
              MY PORTFOLIO 사전예약
            </RevervationCtaButton>
          )}
        </Flexbox>
      </Flexbox>
    </>
  );
}

const RevervationCtaButton = styled(CtaButton)`
  background: linear-gradient(90deg, #1833ff 0%, #5800e5 100%);
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2);
  border-radius: 50px;
  color: ${({ theme: { palette } }) => palette.common.white};
  margin-top: auto;
`;

const AnimationText = styled(Typography)<{ active: boolean }>`
  opacity: 0;
  transition: all 6s;
  ${({ active }): CSSObject =>
    active
      ? {
          opacity: 1
        }
      : {}};
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

export default MyPortfolioLanding01;
