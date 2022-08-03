import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { ProductLegitCard, ProductLegitCardSkeleton } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchLegitProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function HomeProductLegitLive() {
  const router = useRouter();
  const loopIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const [params] = useState({
    page: 0,
    size: 8,
    isOnlyResult: true
  });
  const [index, setIndex] = useState(0);

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

  useEffect(() => {
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
    }

    if (legitProducts.length) {
      loopIntervalRef.current = setInterval(() => {
        setIndex((prevState) => {
          if (prevState + 1 === legitProducts.length) {
            return 0;
          }
          return prevState + 1;
        });
      }, 2000);
    }
    return () => {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
      }
    };
  }, [legitProducts]);

  return (
    <Box component="section" customStyle={{ marginTop: 52 }}>
      <Flexbox justifyContent="space-between">
        <Typography variant="h4" weight="bold">
          실시간 사진감정
        </Typography>
        <Flexbox
          alignment="center"
          onClick={() => router.push('/legit')}
          customStyle={{ cursor: 'pointer' }}
        >
          <Typography variant="body2" weight="bold">
            전체보기
          </Typography>
          <Icon name="CaretRightOutlined" size="small" />
        </Flexbox>
      </Flexbox>
      <ProductLegitLiveTransformWrapper>
        {isLoading ? (
          <ProductLegitLiveTransform gap={20} dataHeight={76}>
            <ProductLegitCardSkeleton variant="list" hidePlatformLogoWithPrice />
          </ProductLegitLiveTransform>
        ) : (
          <ProductLegitLiveTransform index={index} gap={20} dataHeight={76}>
            {legitProducts.map((productLegit) => (
              <ProductLegitCard
                key={`home-live-product-legit-${productLegit.productId}`}
                variant="list"
                productLegit={productLegit}
                hidePlatformLogoWithPrice
                data-product-id={productLegit.productId}
                onClick={handleClick}
              />
            ))}
          </ProductLegitLiveTransform>
        )}
      </ProductLegitLiveTransformWrapper>
    </Box>
  );
}

const ProductLegitLiveTransformWrapper = styled.div`
  height: 96px;
  padding: 20px;
  margin-top: 12px;
  border-radius: ${({
    theme: {
      box: { round }
    }
  }) => round['8']};
  background-color: #151729;
  overflow: hidden;
`;

const ProductLegitLiveTransform = styled.div<{ dataHeight: number; gap?: number; index?: number }>`
  display: flex;
  flex-direction: column;
  ${({ gap }) => (gap ? `gap: ${gap}px` : '')};
  transition: transform 700ms ease-in-out;
  transform: ${({ dataHeight, index = 0 }) => `translate3d(0px, -${dataHeight * index}px, 0px)`};
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
