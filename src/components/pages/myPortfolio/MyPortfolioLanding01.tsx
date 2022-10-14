import { useMemo } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import Image from '@components/UI/atoms/Image';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';

const slideImage = [
  { img: 'new_shoes01', text: '내가 신고있는 스니커즈,' },
  { img: 'new_bag01', text: '내가 들고있는 명품가방,' },
  { img: 'new_watch01', text: '내 손목의 명품시계,' },
  { img: 'new_shoes02', text: '내가 신고있는 스니커즈,' },
  { img: 'new_bag02', text: '내가 들고있는 명품가방,' },
  { img: 'new_watch02', text: '내 손목의 명품시계,' }
];

const slideActiveImage = [
  { img: 'new_shoes01_active', text: '내가 신고있는 스니커즈,' },
  { img: 'new_bag01_active', text: '내가 들고있는 명품가방,' },
  { img: 'new_watch01_active', text: '내 손목의 명품시계,' },
  { img: 'new_shoes02_active', text: '내가 신고있는 스니커즈,' },
  { img: 'new_bag02_active', text: '내가 들고있는 명품가방,' },
  { img: 'new_watch02_active', text: '내 손목의 명품시계,' }
];

function MyPortfolioLanding01({
  onClick,
  onClickNext,
  isSmallHeight
}: {
  isSmallHeight: boolean;
  onClick: () => void;
  onClickNext: () => void;
}) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const { data: userInfo, isSuccess } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);

  const parseSlideImage = useMemo(() => {
    if (isSuccess && userInfo?.info?.value.gender === 'F') {
      return [slideImage[1], slideImage[0], ...slideImage.splice(2, 5)];
    }
    return slideImage as { img: string; text: string }[];
  }, [userInfo, isSuccess]);

  const parseSlideActiveImage = useMemo(() => {
    if (isSuccess && userInfo?.info?.value.gender === 'F') {
      return [slideActiveImage[1], slideActiveImage[0], ...slideActiveImage.splice(2, 5)];
    }
    return slideActiveImage as { img: string; text: string }[];
  }, [userInfo, isSuccess]);

  return (
    <>
      <Flexbox
        direction="vertical"
        customStyle={{ padding: '0 32px', marginTop: isSmallHeight ? '-32px' : 0 }}
      >
        <Flexbox alignment="flex-end" gap={12} customStyle={{ marginBottom: 36 }}>
          <Icon
            name="LogoText_96_20"
            width={72}
            height={15}
            customStyle={{ color: common.cmnW }}
            onClick={() => router.replace('/')}
          />
          <GradationText />
        </Flexbox>
        <Swiper
          className="mySwiper"
          speed={1000}
          loop
          modules={[Autoplay]}
          autoplay={{
            delay: 1500,
            disableOnInteraction: false
          }}
          style={{ width: '100%', height: '100%' }}
        >
          {parseSlideImage.map(({ text, img }) => (
            <SwiperSlide
              key={`pic-title-${img}`}
              style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}
            >
              {text}
            </SwiperSlide>
          ))}
        </Swiper>
        <Typography weight="bold" variant="h2" customStyle={{ color: common.cmnW }}>
          지금 팔면 얼마일까?
        </Typography>
        <Typography variant="h4" customStyle={{ color: common.ui80, marginTop: 8 }}>
          내 명품의 시세정보, 이제 카멜이 알려드려요!
        </Typography>
      </Flexbox>
      <Box customStyle={{ marginTop: 32 }}>
        <Swiper
          loop
          slidesPerView="auto"
          spaceBetween={isSmallHeight ? 0 : 30}
          autoplay={{
            delay: 1500,
            disableOnInteraction: false
          }}
          modules={[Pagination, Autoplay]}
          className="mySwiper"
          speed={1000}
          style={{ paddingLeft: 32 }}
          allowTouchMove={false}
        >
          {parseSlideImage.map(({ img }, i) => (
            <SwiperSlide
              key={`pic-style-${img}`}
              style={{ width: isSmallHeight ? '25vh' : '30vh', maxWidth: 232 }}
            >
              {({ isActive }) => (
                <Image
                  width="auto"
                  height="auto"
                  src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/${
                    isActive ? parseSlideActiveImage[i].img : img
                  }.jpg`}
                  alt={img}
                  disableAspectRatio
                  customStyle={isActive ? {} : { filter: 'brightness(0.4)' }}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
      <BottomFixComponent>
        <RevervationCtaButton
          onClick={onClick}
          variant="contained"
          customStyle={{ flexDirection: 'column' }}
          fullWidth
        >
          <Typography weight="bold" variant="h3" customStyle={{ color: common.cmnW }}>
            <Icon name="AlarmFilled" /> 오픈 알림 받기
          </Typography>
          <Typography variant="small1" customStyle={{ color: common.cmnW }}>
            내 명품의 가치를 가장 먼저 확인하세요
          </Typography>
        </RevervationCtaButton>
        <Typography
          variant="body1"
          customStyle={{ color: 'white', marginTop: '20px', textAlign: 'center' }}
          onClick={onClickNext}
        >
          더 알아보기
        </Typography>
        <ScrollNext
          alignment="center"
          justifyContent="center"
          onClick={onClickNext}
          direction="vertical"
        >
          <NextArrowIcon />
          <NextArrowIcon />
          <NextArrowIcon />
        </ScrollNext>
      </BottomFixComponent>
    </>
  );
}

const RevervationCtaButton = styled(Button)`
  background: linear-gradient(90deg, #334bff 0%, #8133ff 100%);
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  margin-top: auto;
  height: 72px;
`;

const ScrollNext = styled(Flexbox)`
  position: absolute;
  bottom: -40px;
  left: 0;
  width: 100%;
  div {
    animation: bounce 1.2s infinite;
    margin-top: -4px;
  }

  div:nth-child(3) {
    animation-delay: -0.2s;
  }
  div:nth-child(4) {
    animation-delay: -0.4s;
  }
  @keyframes bounce {
    0% {
      opacity: 0;
      transform: rotate(45deg) translateY(-10px);
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: rotate(45deg) translateX(10px);
    }
  }
`;

const BottomFixComponent = styled.div`
  width: 100%;
  padding: 0 32px;
  position: absolute;
  bottom: 60px;
  left: 0;
  z-index: ${({ theme: { zIndex } }) => zIndex.bottomNav};
`;

const NextArrowIcon = styled.div`
  width: 15px;
  height: 15px;
  border-bottom: 3px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.uiWhite};
  border-right: 3px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.uiWhite};
  transform: rotate(45deg);
  margin-left: -20px;
`;

function GradationText() {
  return (
    <svg
      width="107"
      height="12"
      viewBox="0 0 107 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.3862 0.882812H9.56982L6.67139 5.69531L3.77295 0.882812H0.956543V11H3.58154V4.80664L6.30225 9.25H7.04053L9.76123 4.80664V11H12.3862V0.882812ZM19.487 7.24023L23.2194 0.882812H20.3347L18.1882 5.06641L16.0417 0.882812H13.1433L16.862 7.24023V11H19.487V7.24023ZM31.5694 0.882812H27.6456V11H30.2706V7.96484H31.5694C34.044 7.96484 35.671 6.81641 35.671 4.49219C35.671 2.27734 34.2354 0.882812 31.5694 0.882812ZM30.2706 5.75V3.19336H31.5694C32.5128 3.19336 33.0187 3.72656 33.0187 4.49219C33.0187 5.24414 32.5128 5.75 31.5694 5.75H30.2706ZM41.514 0.705078C38.5198 0.705078 36.264 2.97461 36.264 5.94141C36.264 8.92188 38.5198 11.1914 41.514 11.1914C44.5081 11.1914 46.7776 8.92188 46.7776 5.94141C46.7776 2.97461 44.5081 0.705078 41.514 0.705078ZM38.889 5.94141C38.889 4.39648 40.0101 3.26172 41.514 3.26172C43.0315 3.26172 44.1526 4.39648 44.1526 5.94141C44.1526 7.48633 43.0315 8.62109 41.514 8.62109C40.0101 8.62109 38.889 7.48633 38.889 5.94141ZM51.8413 7.58203L53.6733 11H56.5444L54.2612 7.0625C55.2729 6.57031 55.8745 5.64062 55.8745 4.32812C55.8745 2.12695 54.4253 0.882812 51.7729 0.882812H47.8765V11H50.5015V7.5957H51.4585C51.5952 7.5957 51.7183 7.5957 51.8413 7.58203ZM50.5015 5.46289V3.19336H51.7729C52.7437 3.19336 53.2222 3.61719 53.2222 4.32812C53.2222 5.06641 52.7437 5.46289 51.7729 5.46289H50.5015ZM64.2468 3.30273V0.882812H56.7136V3.30273H59.1608V11H61.7858V3.30273H64.2468ZM67.9433 3.19336H72.0448V0.882812H65.3319V11H67.9433V7.37695H71.621V5.24414H67.9433V3.19336ZM78.0245 0.705078C75.0304 0.705078 72.7745 2.97461 72.7745 5.94141C72.7745 8.92188 75.0304 11.1914 78.0245 11.1914C81.0187 11.1914 83.2882 8.92188 83.2882 5.94141C83.2882 2.97461 81.0187 0.705078 78.0245 0.705078ZM75.3995 5.94141C75.3995 4.39648 76.5206 3.26172 78.0245 3.26172C79.5421 3.26172 80.6632 4.39648 80.6632 5.94141C80.6632 7.48633 79.5421 8.62109 78.0245 8.62109C76.5206 8.62109 75.3995 7.48633 75.3995 5.94141ZM91.0179 8.58008H87.012V0.882812H84.387V11H91.0179V8.58008ZM94.7007 0.882812H92.0757V11H94.7007V0.882812ZM101.036 0.705078C98.0417 0.705078 95.7858 2.97461 95.7858 5.94141C95.7858 8.92188 98.0417 11.1914 101.036 11.1914C104.03 11.1914 106.3 8.92188 106.3 5.94141C106.3 2.97461 104.03 0.705078 101.036 0.705078ZM98.4108 5.94141C98.4108 4.39648 99.5319 3.26172 101.036 3.26172C102.553 3.26172 103.675 4.39648 103.675 5.94141C103.675 7.48633 102.553 8.62109 101.036 8.62109C99.5319 8.62109 98.4108 7.48633 98.4108 5.94141Z"
        fill="url(#paint0_linear_1058_20194)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1058_20194"
          x1="0.0952146"
          y1="5.5"
          x2="107.095"
          y2="5.5"
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
