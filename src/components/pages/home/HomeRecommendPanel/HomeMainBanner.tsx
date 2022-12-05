import { useRef } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';

import { Image } from '@components/UI/atoms';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

const IMAGE_BASE_URL = `https://${process.env.IMAGE_DOMAIN}/assets/images/home`;

const bannerData = [
  {
    imageName: 'main-banner01',
    pathname: `/products/search/${encodeURIComponent('파라점퍼스 고비 패딩')}`,
    title: 'PRODUCT_LIST'
  },
  {
    imageName: 'main-banner02',
    pathname: '/myPortfolio'
  },
  {
    imageName: 'main-banner03',
    pathname: '/events/급처-매물-13'
  },
  {
    imageName: 'main-banner04',
    pathname: '/announces/5'
  },
  {
    imageName: 'main-banner05',
    pathname: '/events/명품이-이-가격에-14'
  }
];

function HomeMainBanner() {
  const router = useRouter();
  const startXRef = useRef(0);

  const handleClick = (pathname: string) => () => {
    const getClickBannerTitle = () => {
      if (pathname.indexOf('/products') > -1) {
        return attrProperty.title.PRODUCT_LIST;
      }
      if (pathname.indexOf('/events') > -1) {
        return attrProperty.title.CRAZYWEEK;
      }
      if (pathname.indexOf('/myPortfolio') > -1) {
        return attrProperty.title.MYPORTFOLIO;
      }
      return undefined;
    };

    logEvent(attrKeys.home.CLICK_BANNER, {
      name: attrProperty.name.MAIN,
      title: getClickBannerTitle()
    });

    if (pathname.indexOf('/products') > -1) {
      logEvent(attrKeys.home.CLICK_PRODUCT_LIST, {
        name: attrProperty.name.MAIN,
        title: attrProperty.title.BANNER,
        att: 'TOP'
      });
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.name.MAIN,
        title: attrProperty.title.BANNER,
        type: attrProperty.type.GUIDED
      });
    }

    if (pathname.indexOf('/events') > -1) {
      logEvent(attrKeys.home.CLICK_CRAZYWEEK, {
        name: attrProperty.name.MAIN,
        title: attrProperty.title.BANNER
      });
    }

    if (pathname.indexOf('/myPortfolio') > -1) {
      logEvent(attrKeys.home.CLICK_MYPORTFOLIO, {
        name: attrProperty.name.MAIN,
        title: attrProperty.title.BANNER,
        att: 'TOP'
      });
    }

    router.push(pathname);
  };

  return (
    <StyledMainBanner>
      <Swiper
        pagination={{
          type: 'progressbar'
        }}
        loop
        autoplay={{
          delay: 2500,
          disableOnInteraction: false
        }}
        modules={[Pagination, Autoplay]}
        onSlideChange={({ realIndex, touches }) => {
          const { startX } = touches;

          if (startX !== startXRef.current) {
            logEvent(attrKeys.home.SWIPE_X_BANNER, {
              name: attrProperty.name.MAIN,
              index: realIndex
            });
            startXRef.current = startX;
          }
        }}
      >
        {bannerData.map((data) => (
          <SwiperSlide key={`main-banner-${data.imageName}`}>
            <Image
              width="100%"
              src={`${IMAGE_BASE_URL}/${data.imageName}.png`}
              alt="Main Banner Img"
              onClick={handleClick(data.pathname)}
              disableAspectRatio
              disableSkeletonRender={false}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </StyledMainBanner>
  );
}

const StyledMainBanner = styled.section`
  margin-top: 10px;
  .swiper-pagination {
    top: auto;
    bottom: 0;
    background: rgba(255, 255, 255, 0.2);
  }
  .swiper-pagination-progressbar-fill {
    background: rgba(255, 255, 255, 0.4);
  }
`;

export default HomeMainBanner;
