import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import { useRouter } from 'next/router';
import { Box, Button, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import Image from '@components/UI/atoms/Image';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

const picStyle = [
  { src: '/assets/images/personal/pic_style01.jpg', text: '클래식 명품' },
  { src: '/assets/images/personal/pic_style02.jpg', text: '스트릿' },
  { src: '/assets/images/personal/pic_style04.jpg', text: '캐주얼' },
  { src: '/assets/images/personal/pic_style05.jpg', text: '명품백 홀릭' },
  { src: '/assets/images/personal/pic_style06.jpg', text: '스니커즈 성애자' },
  { src: '/assets/images/personal/pic_style07.jpg', text: '시계 매니아' }
];

const picBrands = [
  { src: '/assets/images/brands/balenciaga.png', text: '발렌시아가' },
  { src: '/assets/images/brands/bottegaveneta.png', text: '보테가 베네타' },
  { src: '/assets/images/brands/chanel.png', text: '샤넬' },
  { src: '/assets/images/brands/gucci.png', text: '구찌' },
  { src: '/assets/images/brands/louisvuitton.png', text: '루이비통' },
  { src: '/assets/images/brands/prada.png', text: '프라다' },
  { src: '/assets/images/brands/saintlaurent.png', text: '이브생로랑' },
  { src: '/assets/images/brands/stoneisland.png', text: '스톤아일랜드' },
  { src: '/assets/images/brands/valentino.png', text: '발렌티노' }
];

function NonMemberContents() {
  const router = useRouter();

  const handleClickLogin = () => {
    // router.push('/camelSeller/registerConfirm?id=32945602');
    // router.push('/camelSeller');
    // return;
    logEvent(attrKeys.mypage.CLICK_LOGIN, { name: 'MY' });
    router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
  };

  return (
    <Box customStyle={{ margin: '30px -16px 0' }}>
      <SlideContents>
        <Swiper
          loop
          slidesPerView="auto"
          spaceBetween={10}
          autoplay={{
            delay: 1,
            disableOnInteraction: false
          }}
          speed={2000}
          modules={[Autoplay]}
        >
          {picStyle.map((item) => (
            <SwiperSlide key={`pic-style-${item.text}`} style={{ width: 164 }}>
              <SlideImage>
                <Image
                  width={164}
                  height={124}
                  src={`https://${process.env.IMAGE_DOMAIN}${item.src}`}
                  alt={item.text}
                  disableAspectRatio
                />
                <SlideText weight="bold">{item.text}</SlideText>
              </SlideImage>
            </SwiperSlide>
          ))}
        </Swiper>
        <Swiper
          loop
          slidesPerView="auto"
          spaceBetween={10}
          speed={2000}
          modules={[Autoplay]}
          autoplay={{
            delay: 1,
            disableOnInteraction: false,
            reverseDirection: true
          }}
        >
          {picBrands.map((item) => (
            <SwiperSlide key={`pic-style-${item.text}`} style={{ width: 'fit-content' }}>
              <ImageArea>
                <Image
                  width={40}
                  height={40}
                  src={`https://${process.env.IMAGE_DOMAIN}${item.src}`}
                  alt={item.text}
                  disableAspectRatio
                />
              </ImageArea>
            </SwiperSlide>
          ))}
        </Swiper>
      </SlideContents>
      <Box customStyle={{ textAlign: 'center', margin: '100px 0' }}>
        <Typography weight="regular" variant="body1" customStyle={{ lineHeight: '21px' }}>
          카멜 로그인하고
        </Typography>
        <Typography weight="regular" variant="body1" customStyle={{ lineHeight: '21px' }}>
          나만을 위한 추천을 받아보세요😘
        </Typography>
        <Typography weight="bold" variant="h4" customStyle={{ marginTop: 8, marginBottom: 16 }}>
          취향저격 매물만 골라보고 싶다면
        </Typography>
        <Button
          variant="contained"
          brandColor="primary"
          customStyle={{ width: 200, height: 41 }}
          onClick={handleClickLogin}
        >
          로그인/가입하기
        </Button>
      </Box>
    </Box>
  );
}

const SlideImage = styled.div`
  position: relative;
  width: 164px;
  height: 124px;
  opacity: 0.5;
  border-radius: 8px;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0) 36%,
      rgba(0, 0, 0, 0.65) 98%
    );
  }
`;

const SlideContents = styled.div`
  height: 180px;
  width: 100%;
  left: 0;
`;

const ImageArea = styled.div`
  width: 40px;
  height: 40px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui80};
  overflow: hidden;
  border-radius: 50%;
  margin-top: 20px;
`;

const SlideText = styled(Typography)`
  position: absolute;
  bottom: 8px;
  text-align: center;
  width: 100%;
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  z-index: 1;
`;

export default NonMemberContents;
