import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow, Pagination } from 'swiper';
import type { Swiper as SwiperClass } from 'swiper';
import { useRouter } from 'next/router';
import type { IconProps } from 'mrcamel-ui/dist/components/Icon';
import { Box, Flexbox, Icon, Skeleton, Typography, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchLegit } from '@api/dashboard';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getImageResizePath, getProductDetailUrl } from '@utils/common';

function LegitDashboardBanner() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [initLoad, setInitLoad] = useState(false);

  const startXRef = useRef(0);

  const { isLoading, data: { mostPopular, realVsFake } = {} } = useQuery(
    queryKeys.dashboards.legit(),
    () => fetchLegit()
  );

  const dashBoardData: {
    icon?: IconProps['name'];
    label: string;
    customStyle: CustomStyle;
    path: string;
    image: string;
    title: string;
    description: string;
    att: 'POPULAR' | 'HOWITWORKS' | 'REALFAKE';
  }[] = useMemo(() => {
    return [
      {
        label: 'HOW IT WORKS',
        customStyle: { color: common.uiBlack, backgroundColor: common.ui95 },
        path: '/legit/guide',
        image: `https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-dashboard-how-it-works.png`,
        title: '카멜 실시간 사진감정이란?',
        description: '정가품이 궁금할때, 가장 간편하게<br/>여러 전문가의 실시간 정가품 의견',
        att: 'HOWITWORKS'
      },
      {
        icon: 'LegitOutlined',
        label: 'REAL vs FAKE',
        customStyle: {
          color: common.uiWhite,
          background: 'linear-gradient(90deg, #373D8C 3.41%, #8C2B33 100%)'
        },
        path: realVsFake
          ? `/legit${getProductDetailUrl({
              type: 'productResult',
              product: realVsFake.productResult
            }).replace('/products', '')}/result`
          : '',
        image: realVsFake?.productResult?.imageMain || '',
        title: `혹시, ${realVsFake?.productResult?.brand?.name || ''} 전문가세요?`,
        description: '정품 vs 가품 의견이 갈리고있어요.<br/>당신의 생각은?',
        att: 'REALFAKE'
      },
      {
        icon: 'ChatOutlined',
        label: 'MOST POPULAR',
        customStyle: { color: common.uiWhite, backgroundColor: common.uiBlack },
        path: mostPopular
          ? `/legit${getProductDetailUrl({
              type: 'productResult',
              product: mostPopular.productResult
            }).replace('/products', '')}/result`
          : '',
        image: mostPopular?.productResult?.imageMain || '',
        title: '가장 많은 의견!',
        description: '전문가들은 어느 포인트를 보고 감정했을까요?</br>의견을 둘러보세요!',
        att: 'POPULAR'
      }
    ];
  }, [common.ui95, common.uiBlack, common.uiWhite, mostPopular, realVsFake]);

  const handleClickBanner = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;

    logEvent(attrKeys.legit.CLICK_BANNER, {
      name: attrProperty.legitName.LEGIT_MAIN,
      title: attrProperty.legitTitle.MAINBANNER,
      att: target.dataset.att
    });

    router.push(target.dataset.path as string);
  };

  const handleSwiperBanner = ({ realIndex, touches }: SwiperClass) => {
    if (initLoad) {
      const { startX } = touches;

      if (startX !== startXRef.current) {
        logEvent(attrKeys.home.SWIPE_X_BANNER, {
          name: attrProperty.name.MAIN,
          index: realIndex
        });
        startXRef.current = startX;
      }
    }
  };

  useEffect(() => {
    setInitLoad(true);
  }, []);

  return (
    <Wrapper>
      <Swiper
        modules={[Pagination, EffectCoverflow, Autoplay]}
        effect="coverflow"
        coverflowEffect={{
          rotate: 0,
          depth: 0,
          slideShadows: false
        }}
        pagination={{
          clickable: true,
          type: 'progressbar'
        }}
        autoplay={{
          disableOnInteraction: false
        }}
        onSlideChange={handleSwiperBanner}
        loop
        loopedSlides={2}
      >
        {isLoading
          ? Array.from({ length: 3 }, (_, index) => (
              <SwiperSlide key={`dashboard-banner-skeleton-${index}`}>
                <Card isLoading>
                  <Skeleton width="100%" height="100%" round={8} disableAspectRatio />
                </Card>
              </SwiperSlide>
            ))
          : dashBoardData.map(
              ({ icon, label, customStyle, path, image, title, description, att }) => (
                <SwiperSlide key={`dashboard-banner-card-${label}`}>
                  <Card
                    url={getImageResizePath({ imagePath: image, w: 400 })}
                    onClick={handleClickBanner}
                    data-path={path}
                    data-att={att}
                  >
                    <Box customStyle={{ flex: 1 }}>
                      <CustomLabel css={customStyle}>
                        {icon && (
                          <Icon
                            name={icon}
                            width={16}
                            height={16}
                            customStyle={{ color: 'inherit' }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          weight="medium"
                          customStyle={{ color: 'inherit', whiteSpace: 'nowrap' }}
                        >
                          {label}
                        </Typography>
                      </CustomLabel>
                    </Box>
                    <Flexbox direction="vertical" gap={4}>
                      <Typography
                        variant="h3"
                        weight="bold"
                        customStyle={{ color: common.uiWhite, whiteSpace: 'nowrap' }}
                      >
                        {title}
                      </Typography>
                      <Typography
                        variant="body2"
                        dangerouslySetInnerHTML={{ __html: description }}
                        customStyle={{ color: common.uiWhite, whiteSpace: 'nowrap' }}
                      />
                    </Flexbox>
                    <Flexbox gap={44} />
                  </Card>
                </SwiperSlide>
              )
            )}
      </Swiper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  .swiper-pagination-progressbar {
    top: auto;
    bottom: 0;
    background-color: ${({ theme: { palette } }) => palette.common.ui60};
    opacity: 0.4;
  }
  .swiper-pagination-progressbar-fill {
    background-color: ${({ theme: { palette } }) => palette.common.cmnW};
    opacity: 1;
  }
`;

const Card = styled.div<{ isLoading?: boolean; url?: string }>`
  display: flex;
  flex-direction: column;
  padding: ${({ isLoading }) => !isLoading && '12px 20px 32px'};
  height: 200px;
  background: ${({ isLoading, url }) =>
    !isLoading &&
    `linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
    url(${url})`};
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  cursor: pointer;
`;

const CustomLabel = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 6px;
  gap: 2px;
  width: fit-content;
  height: 24px;
  border-radius: 4px;
`;

export default LegitDashboardBanner;
