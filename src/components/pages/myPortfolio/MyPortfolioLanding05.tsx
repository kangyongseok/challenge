import { useEffect, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow } from 'swiper';
import { Box, Flexbox, Image, Label, Typography, useTheme } from 'mrcamel-ui';

import { IOS_SAFE_AREA_TOP } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

function MyPortfolioLanding05() {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const [imageWidth, setImagewidth] = useState(0);

  useEffect(() => {
    const width = document.body.clientWidth - 150 > 450 ? 450 : document.body.clientWidth - 150;
    setImagewidth(width);
  }, []);

  return (
    <Flexbox
      customStyle={{
        textAlign: 'center',
        marginTop: `calc(52px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'})`,
        height: '100%',
        position: 'relative'
      }}
      direction="vertical"
    >
      <Typography weight="bold" customStyle={{ color: primary.main }}>
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
        customStyle={{
          flex: 1,
          marginBottom: `calc(100px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'})`
        }}
        alignment="center"
        justifyContent="center"
      >
        <Box customStyle={{ marginTop: 12 }}>
          <Label
            variant="solid"
            text="#샤넬 클래식 미디움 플립백"
            customStyle={{
              background: primary.highlight,
              color: primary.main,
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
                border: `1px solid ${common.ui90}`,
                borderRadius: 20,
                overflow: 'hidden',
                filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.08))'
              }}
            >
              <Image
                width={imageWidth}
                height="auto"
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/graph_img01.png`}
                alt="graph_img01"
                disableAspectRatio
                disableSkeleton
              />
            </SwiperSlide>
            <SwiperSlide
              style={{
                width: imageWidth,
                border: `1px solid ${common.ui90}`,
                borderRadius: 20,
                overflow: 'hidden',
                filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.08))'
              }}
            >
              <Image
                width={imageWidth}
                height="auto"
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/graph_img02.png`}
                alt="graph_img02"
                disableAspectRatio
                disableSkeleton
              />
            </SwiperSlide>
            <SwiperSlide
              style={{
                width: imageWidth,
                border: `1px solid ${common.ui90}`,
                borderRadius: 20,
                overflow: 'hidden',
                filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.08))'
              }}
            >
              <Image
                width={imageWidth}
                height="auto"
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/graph_img03.png`}
                alt="graph_img03"
                disableAspectRatio
                disableSkeleton
              />
            </SwiperSlide>
          </Swiper>
        </Box>
      </Flexbox>
    </Flexbox>
  );
}

export default MyPortfolioLanding05;
