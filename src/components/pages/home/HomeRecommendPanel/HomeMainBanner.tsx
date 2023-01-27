import { useRef } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper';
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Image } from 'mrcamel-ui';
import styled from '@emotion/styled';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchArea, postArea } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import {
  eventContentDogHoneyFilterState,
  eventContentProductsParamsState
} from '@recoil/eventFilter';
import { dialogState } from '@recoil/common';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

const IMAGE_BASE_URL = `https://${process.env.IMAGE_DOMAIN}/assets/images/home`;

const bannerData = [
  // {
  //   imageName: 'main-banner06-1',
  //   pathname: '/events/인기-특가-매물-16'
  // },
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
  const queryClient = useQueryClient();

  const eventContentProductsParams = useRecoilValue(eventContentProductsParamsState);
  const resetEventContentProductsParamsState = useResetRecoilState(eventContentProductsParamsState);
  const resetEventContentDogHoneyFilterState = useResetRecoilState(eventContentDogHoneyFilterState);
  const setDialogState = useSetRecoilState(dialogState);

  const { data: accessUser } = useQueryAccessUser();
  const { data: { area: { values: areaValues = [] } = {} } = {} } = useQueryMyUserInfo();
  const { mutate: mutatePostArea } = useMutation(postArea);

  const startXRef = useRef(0);

  const handleClickDogHoneyEvent = () => {
    resetEventContentDogHoneyFilterState();
    queryClient.refetchQueries(queryKeys.commons.contentProducts(eventContentProductsParams));
    logEvent(attrKeys.home.CLICK_CRAZYWEEK, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.BANNER
    });

    if (!!accessUser && !areaValues?.length) {
      logEvent(attrKeys.home.VIEW_LOCATION_POPUP, {
        name: attrProperty.name.HOME
      });
      setDialogState({
        type: 'locationInfo',
        customStyleTitle: { minWidth: 270 },
        secondButtonAction: () => {
          logEvent(attrKeys.home.CLICK_LOCATION_POPUP, {
            att: 'YES'
          });

          if (checkAgent.isAndroidApp()) {
            window.webview?.callAuthLocation?.();
            return;
          }

          if (checkAgent.isIOSApp()) {
            window.webkit?.messageHandlers?.callAuthLocation?.postMessage?.(0);
          }

          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { longitude, latitude } = position.coords;

              if (longitude > 0 || latitude > 0) {
                const { name, x, y } = await fetchArea({
                  x: String(longitude),
                  y: String(latitude)
                });

                mutatePostArea(
                  { name, x, y },
                  {
                    onSuccess: () => {
                      router.push('/events/실시간-개꿀매-17');
                    },
                    onError: () => {
                      router.push('/events/실시간-개꿀매-17');
                    }
                  }
                );
              } else {
                router.push('/events/실시간-개꿀매-17');
              }
            },
            () => {
              router.push('/events/실시간-개꿀매-17');
            }
          );
        }
      });
    } else {
      router.push('/events/실시간-개꿀매-17');
    }
  };

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
      resetEventContentProductsParamsState();
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
          delay: 5000,
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
        <SwiperSlide>
          <Image
            ratio="4:3"
            src={`${IMAGE_BASE_URL}/main-banner-event01.gif`}
            alt="Main Banner Img"
            onClick={handleClickDogHoneyEvent}
          />
        </SwiperSlide>
        {bannerData.map((data) => (
          <SwiperSlide key={`main-banner-${data.imageName}`}>
            <Image
              ratio="4:3"
              src={`${IMAGE_BASE_URL}/${data.imageName}.png`}
              alt="Main Banner Img"
              onClick={handleClick(data.pathname)}
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
