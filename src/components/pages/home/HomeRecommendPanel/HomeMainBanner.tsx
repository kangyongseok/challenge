import { useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { useRouter } from 'next/router';
import { Box, Flexbox, Image, Typography, useTheme } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useMoveCamelSeller from '@hooks/useMoveCamelSeller';

function HomeMainBanner() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleChange = ({ activeIndex }: SwiperClass) => setCurrentIndex(activeIndex);

  const handleClick = useMoveCamelSeller({
    attributes: {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.BANNER,
      source: 'MAIN'
    }
  });

  const handleClickCamelSellerBanner = () => {
    logEvent(attrKeys.home.CLICK_BANNER, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.EVENT_DETAIL,
      att: '2302_CAMEL_PRODUCT'
    });

    handleClick();
  };

  const handleClickInterfereInKingBanner = () => {
    logEvent(attrKeys.home.CLICK_BANNER, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.EVENT_DETAIL,
      att: '2302_CAMEL_OPINION'
    });

    router.push('/events/interfereInKing');
  };

  return (
    <Swiper
      onSlideChange={handleChange}
      style={{
        position: 'relative',
        width: '100%'
      }}
    >
      <SwiperSlide>
        <Box
          onClick={handleClickCamelSellerBanner}
          customStyle={{
            height: 104,
            backgroundColor: '#64607A'
          }}
        >
          <Image
            height={104}
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/home/camel-seller-banner2.png`}
            alt="Main Banner Img"
            disableAspectRatio
          />
        </Box>
      </SwiperSlide>
      <SwiperSlide>
        <Box
          onClick={handleClickInterfereInKingBanner}
          customStyle={{
            height: 104,
            backgroundColor: '#0B123E'
          }}
        >
          <Image
            height={104}
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/home/event-interfere-in-king-banner.png`}
            alt="Main Banner Img"
            disableAspectRatio
          />
        </Box>
      </SwiperSlide>
      <Flexbox
        alignment="center"
        justifyContent="center"
        customStyle={{
          position: 'absolute',
          right: 20,
          bottom: 12,
          padding: '2px 6px',
          borderRadius: 12,
          backgroundColor: common.ui20,
          zIndex: 10
        }}
      >
        <Typography
          variant="body2"
          weight="medium"
          customStyle={{
            color: common.uiWhite,
            '& > span': {
              color: common.ui60
            }
          }}
        >
          {currentIndex + 1}
          <span>/2</span>
        </Typography>
      </Flexbox>
    </Swiper>
  );
}

export default HomeMainBanner;
