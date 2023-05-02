import { useEffect } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import { Box, Flexbox, Image, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

import OnboardingBottomCTA from './OnboardingBottomCTA';

interface OnboardingWelcomeProps {
  onClick: () => void;
}

const BASE_ONBOARDING_URL = `https://${process.env.IMAGE_DOMAIN}/assets/images/onboarding`;

const slideImages = [
  { imgName: 'group_img01', paddingTop: 70, marginLeft: 0, alt: 'camelCircle' },
  { imgName: 'group_img02', paddingTop: 0, marginLeft: -5, alt: 'pradaBag' },
  { imgName: 'group_img03', paddingTop: 30, marginLeft: -10, alt: 'greenBag' },
  { imgName: 'group_img04', paddingTop: 30, marginLeft: -5, alt: 'tomBrown' },
  { imgName: 'group_img05', paddingTop: 60, marginLeft: 0, alt: 'camelSquare' },
  { imgName: 'group_img06', paddingTop: 30, marginLeft: -10, alt: 'nikeShoe' },
  { imgName: 'group_img07', paddingTop: 40, marginLeft: -8, alt: 'luisVoittong' }
];

function OnboardingWelcome({ onClick }: OnboardingWelcomeProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  useEffect(() => {
    logEvent(attrKeys.welcome.VIEW_WELCOME);
  }, []);

  const handleClick = () => {
    logEvent(attrKeys.welcome.CLICK_PERSONAL_INPUT, {
      name: attrProperty.productName.WELCOME
    });
    onClick();
  };

  return (
    <Box customStyle={{ background: common.uiWhite, height: '100%' }}>
      <Flexbox
        gap={20}
        direction="vertical"
        customStyle={{ textAlign: 'center', marginTop: '20%' }}
      >
        <Box>
          <Typography variant="h1" weight="bold">
            {accessUser?.userName || '회원'}님
          </Typography>
          <Typography variant="h1" weight="bold">
            환영합니다
          </Typography>
        </Box>
        <Box>
          <Typography variant="h4" color="ui60">
            프로필을 만들어주시면,
          </Typography>
          <Typography variant="h4" color="ui60">
            {accessUser?.userName || '회원'}님이 찾는 매물을 찰떡같이 보여드릴게요😍
          </Typography>
        </Box>
      </Flexbox>
      <SlideImgWrap>
        <Swiper
          loop
          slidesPerView={4}
          modules={[Autoplay]}
          centeredSlides
          speed={2000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false
          }}
          style={{ width: 'calc(100% + 50px)', height: '100%' }}
        >
          {slideImages.map(({ imgName, alt, paddingTop, marginLeft }) => (
            <SwiperSlide key={`slide-image-${imgName}`}>
              <Image
                src={`${BASE_ONBOARDING_URL}/${imgName}.png`}
                disableAspectRatio
                alt={alt}
                customStyle={{ paddingTop, marginLeft }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </SlideImgWrap>
      <OnboardingBottomCTA onClick={handleClick}>시작하기!</OnboardingBottomCTA>
    </Box>
  );
}

const SlideImgWrap = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  margin-top: -30px;
  width: 100%;
  overflow: hidden;
`;

export default OnboardingWelcome;
