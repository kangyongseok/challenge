import { useEffect, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow } from 'swiper';
import { Box, Flexbox, Label, Typography, useTheme } from 'mrcamel-ui';

import Image from '@components/UI/atoms/Image';

function MyPortfolioLanding07() {
  const {
    theme: { palette }
  } = useTheme();
  const [imageWidth, setImagewidth] = useState(0);

  useEffect(() => {
    const width = document.body.clientWidth - 150 > 450 ? 450 : document.body.clientWidth - 150;
    setImagewidth(width);
  }, []);

  return (
    <Flexbox
      customStyle={{ textAlign: 'center', marginTop: 52, height: '100%', position: 'relative' }}
      direction="vertical"
    >
      <Typography weight="bold" customStyle={{ color: palette.primary.main }}>
        내 명품 분석
      </Typography>
      <Typography variant="h2" weight="bold">
        얼마나 인기가 많을까?
      </Typography>
      <Typography customStyle={{ marginTop: 12 }}>
        거래량, 인기도를 실시간으로 볼 수 있어요.
      </Typography>
      <Flexbox
        direction="vertical"
        customStyle={{ flex: 1, marginBottom: 100 }}
        alignment="center"
        justifyContent="center"
      >
        <Box customStyle={{ marginTop: 12 }}>
          <Label
            variant="contained"
            text="#나이키 에어포스 1 로우 파라노이즈 2.0"
            customStyle={{
              background: palette.primary.highlight,
              color: palette.primary.main,
              borderRadius: 36,
              marginBottom: 20
            }}
          />
          <Swiper
            loop
            effect="coverflow"
            grabCursor
            centeredSlides
            slidesPerView="auto"
            autoplay={{
              delay: 3000,
              disableOnInteraction: false
            }}
            speed={800}
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true
            }}
            pagination
            modules={[EffectCoverflow, Autoplay]}
            className="mySwiper"
            style={{ overflow: 'initial' }}
          >
            <SwiperSlide
              style={{
                width: imageWidth,
                border: `1px solid ${palette.common.grey['90']}`,
                borderRadius: 20,
                overflow: 'hidden',
                filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.08))'
              }}
            >
              <Image
                width={imageWidth}
                height="auto"
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/graph_img01.jpg`}
                alt="graph_img01"
                disableAspectRatio
              />
            </SwiperSlide>
            <SwiperSlide
              style={{
                width: imageWidth,
                border: `1px solid ${palette.common.grey['90']}`,
                borderRadius: 20,
                overflow: 'hidden',
                filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.08))'
              }}
            >
              <Image
                width={imageWidth}
                height="auto"
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/graph_img02.jpg`}
                alt="graph_img02"
                disableAspectRatio
              />
            </SwiperSlide>
            <SwiperSlide
              style={{
                width: imageWidth,
                border: `1px solid ${palette.common.grey['90']}`,
                borderRadius: 20,
                overflow: 'hidden',
                filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.08))'
              }}
            >
              <Image
                width={imageWidth}
                height="auto"
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/graph_img03.jpg`}
                alt="graph_img03"
                disableAspectRatio
              />
            </SwiperSlide>
          </Swiper>
        </Box>
      </Flexbox>
    </Flexbox>
  );
}

export default MyPortfolioLanding07;
