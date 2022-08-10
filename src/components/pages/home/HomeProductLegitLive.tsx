import { useState } from 'react';
import type { MouseEvent } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Icon, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { ProductLegitCard, ProductLegitCardSkeleton } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchLegitProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function HomeProductLegitLive() {
  const router = useRouter();

  const [params] = useState({
    page: 0,
    size: 8,
    isOnlyResult: true
  });

  const { data: { content: legitProducts = [] } = {}, isLoading } = useQuery(
    queryKeys.products.legitProducts(),
    () => fetchLegitProducts(params),
    {
      refetchOnMount: true
    }
  );

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    logEvent(attrKeys.home.CLICK_LEGIT_ROLLING, {
      name: attrProperty.productName.MAIN
    });

    const dataProductId = e.currentTarget.getAttribute('data-product-id');

    router.push(`/products/${dataProductId}/legit/result`);
  };

  return (
    <Flexbox component="section" direction="vertical" gap={20} customStyle={{ padding: 20 }}>
      <Flexbox justifyContent="space-between">
        <Typography variant="h3" weight="bold">
          실시간 사진감정
        </Typography>
        <Flexbox
          alignment="center"
          onClick={() => router.push('/legit')}
          customStyle={{ cursor: 'pointer' }}
        >
          <Typography variant="body2" weight="medium">
            전체보기
          </Typography>
          <Icon name="CaretRightOutlined" size="small" />
        </Flexbox>
      </Flexbox>
      <ProductLegitLiveTransformWrapper>
        <ProductLegitLiveTransform>
          {isLoading ? (
            <ProductLegitCardSkeleton variant="list" hidePlatformLogoWithPrice />
          ) : (
            <Swiper
              slidesPerView={1}
              loop
              direction="vertical"
              effect="flip"
              allowTouchMove={false}
              autoplay={{ delay: 2000, disableOnInteraction: false }}
              speed={700}
              spaceBetween={20}
              modules={[Autoplay]}
              style={{ height: 56 }}
            >
              {legitProducts.map((productLegit) => (
                <SwiperSlide key={`home-live-product-legit-${productLegit.productId}`}>
                  <ProductLegitCard
                    variant="list"
                    productLegit={productLegit}
                    hidePlatformLogoWithPrice
                    data-product-id={productLegit.productId}
                    onClick={handleClick}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </ProductLegitLiveTransform>
      </ProductLegitLiveTransformWrapper>
    </Flexbox>
  );
}

const ProductLegitLiveTransformWrapper = styled.div`
  padding: 20px;
  border-radius: ${({
    theme: {
      box: { round }
    }
  }) => round['8']};
  background-color: #151729;
  overflow: hidden;
`;

const ProductLegitLiveTransform = styled.div`
  & * {
    color: ${({
      theme: {
        palette: { common }
      }
    }) => common.white} !important;
  }
  & .legit-alert-date {
    color: ${({
      theme: {
        palette: { common }
      }
    }) => common.grey['90']} !important;
  }
`;

export default HomeProductLegitLive;
