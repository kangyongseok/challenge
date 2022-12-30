import { useCallback, useMemo } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Image, Skeleton, ThemeProvider, Typography, dark } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { ProductLegitsParams } from '@dto/productLegit';
import type { ProductResult } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchProductLegits } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getProductDetailUrl } from '@utils/common';

function LegitYourTurnList() {
  const router = useRouter();

  const productLegitsParams: ProductLegitsParams = useMemo(
    () => ({ page: 0, size: 15, status: [20] }),
    []
  );
  const {
    isLoading,
    isFetched,
    data: { productLegits: { content: productLegits = [] } = {} } = {}
  } = useQuery(queryKeys.productLegits.legits(productLegitsParams), () =>
    fetchProductLegits(productLegitsParams)
  );

  const groupedProductLegits = useMemo(
    () =>
      Array.from(
        {
          length:
            Math.floor(productLegits.length / 5) +
            (Math.floor(productLegits.length % 5) > 0 ? 1 : 0)
        },
        (_, index) => productLegits.slice(index * 5, index * 5 + 5)
      ).filter((groupedProductLegit) => groupedProductLegit.length),

    [productLegits]
  );

  const handleClickLegitProduct = useCallback(
    (product: ProductResult) => () => {
      logEvent(attrKeys.legit.CLICK_LEGIT_INFO, {
        name: attrProperty.legitName.LEGIT_MAIN,
        title: attrProperty.legitTitle.YOURTURN
      });

      router.push(
        `/legit${getProductDetailUrl({ type: 'productResult', product }).replace(
          '/products',
          ''
        )}/result`
      );
    },
    [router]
  );

  const handleSwiperYourTurn = () => {
    logEvent(attrKeys.legit.SWIPE_X_LEGIT, {
      name: attrProperty.legitName.LEGIT_MAIN,
      title: attrProperty.legitTitle.YOURTURN
    });
  };

  return isLoading || (isFetched && groupedProductLegits.length > 0) ? (
    <ThemeProvider theme="dark">
      <Wrapper>
        {isLoading ? (
          <Card>
            <Flexbox direction="vertical" gap={12}>
              <Skeleton width={94} height={16} round={8} disableAspectRatio />
              <Flexbox direction="vertical" gap={4}>
                <Skeleton width={184} height={24} round={8} disableAspectRatio />
                <Skeleton width={270} height={32} round={8} disableAspectRatio />
              </Flexbox>
            </Flexbox>
            <Flexbox direction="vertical" gap={15} customStyle={{ marginBottom: 24 }}>
              {Array.from({ length: 5 }, (_, index) => (
                <Flexbox key={`productLegit-${index}`} alignment="center" gap={12}>
                  <Skeleton width={56} height={56} round={8} disableAspectRatio />
                  <Flexbox direction="vertical" gap={2}>
                    <Skeleton width={52} height={24} round={8} disableAspectRatio />
                    <Skeleton width={227} height={20} round={8} disableAspectRatio />
                  </Flexbox>
                </Flexbox>
              ))}
            </Flexbox>
          </Card>
        ) : (
          <Card>
            <Flexbox direction="vertical" gap={12}>
              <Typography
                variant="body2"
                weight="bold"
                customStyle={{ color: dark.palette.primary.light }}
              >
                IT’S YOUR TURN
              </Typography>
              <Flexbox direction="vertical" gap={4}>
                <Typography
                  variant="h3"
                  weight="bold"
                  customStyle={{ color: dark.palette.common.ui20 }}
                >
                  정가품 의견 남겨보실래요?
                </Typography>
                <Typography variant="body2" customStyle={{ color: dark.palette.common.ui60 }}>
                  보유하고 있거나 잘 아는 브랜드라면 의견을 남겨보세요
                  <br />
                  (감정사 활동 시 베네핏 지급)
                </Typography>
              </Flexbox>
            </Flexbox>
            <Swiper
              spaceBetween={20}
              pagination={{ clickable: true }}
              modules={[Pagination]}
              style={{ width: 'calc(100vw - 80px)', padding: '0 0 24px', mixBlendMode: 'screen' }}
              onSlideChange={handleSwiperYourTurn}
            >
              {groupedProductLegits.map((groupedProductLegit, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <SwiperSlide key={`grouped-product-legits-${index}`}>
                  <Flexbox direction="vertical" gap={15}>
                    {groupedProductLegit.map(({ productId, productResult }) => (
                      <Flexbox
                        key={`productLegit-${productId}`}
                        gap={12}
                        customStyle={{ cursor: 'pointer' }}
                        onClick={handleClickLegitProduct(productResult)}
                      >
                        <Image
                          width={56}
                          height={56}
                          disableAspectRatio
                          src={productResult.imageMain}
                          alt="Product Img"
                          round={8}
                        />
                        <Flexbox direction="vertical" gap={2}>
                          <Image
                            width="auto"
                            height={24}
                            disableAspectRatio
                            src={`https://${
                              process.env.IMAGE_DOMAIN
                            }/assets/images/horizon_brands/black/${productResult.brand.nameEng
                              .toLowerCase()
                              .replace(/\s/g, '')}.jpg`}
                            alt="Brand Logo Img"
                            customStyle={{
                              maxWidth: 'fit-content'
                            }}
                          />
                          <Typography variant="body1">{productResult.quoteTitle}</Typography>
                        </Flexbox>
                      </Flexbox>
                    ))}
                  </Flexbox>
                </SwiperSlide>
              ))}
            </Swiper>
          </Card>
        )}
      </Wrapper>
    </ThemeProvider>
  ) : null;
}

const Wrapper = styled.section`
  padding: 0 20px;
  .swiper-slide {
    margin-right: 20px;
  }
  .swiper-pagination {
    bottom: 0;
  }
  .swiper-pagination-bullet {
    width: 4px;
    height: 4px;
    background-color: ${({ theme: { palette } }) => palette.common.ui90};
    opacity: 1;
    margin: 0 2px !important;
  }
  .swiper-pagination-bullet-active {
    border-radius: 16px;
    background-color: ${({ theme: { palette } }) => palette.common.uiBlack};
  }
`;

const Card = styled.div<{ isLoading?: boolean; url?: string }>`
  display: flex;
  row-gap: 32px;
  flex-direction: column;
  padding: 32px 20px 20px;
  min-width: 335px;
  border-radius: 8px;
  background-color: ${({ theme: { palette } }) => palette.common.bg03};
`;

export default LegitYourTurnList;
