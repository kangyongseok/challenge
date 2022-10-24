import { useCallback } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import type { IconName } from 'mrcamel-ui';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Image, Skeleton } from '@components/UI/atoms';

import { ProductSeller } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import FormattedText from '@library/FormattedText';
import { logEvent } from '@library/amplitude';

import { fetchRecommWishes } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getProductType } from '@utils/products';
import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber } from '@utils/common';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function HomeRecommendationsWishes() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const { data: accessUser } = useQueryAccessUser();
  const {
    isLoading,
    isFetched,
    data: recommWishes = []
  } = useQuery(queryKeys.users.recommWishes(), fetchRecommWishes, {
    enabled: !!accessUser,
    refetchOnMount: true
  });

  const getPopularText = useCallback(
    ({
      viewCount,
      wishCount,
      purchaseCount
    }: {
      viewCount: number;
      wishCount: number;
      purchaseCount: number;
    }) => {
      if (purchaseCount >= 6)
        return {
          id: 'home.recommendationWishes.purchase',
          params: { count: commaNumber(purchaseCount) }
        };

      if (wishCount >= 5)
        return {
          id: 'home.recommendationWishes.wish',
          params: { count: commaNumber(wishCount) }
        };

      return {
        id: 'home.recommendationWishes.view',
        params: { count: commaNumber(viewCount) }
      };
    },
    []
  );

  const handleClick = (id: number, isPriceLow: boolean, productSeller: ProductSeller) => () => {
    logEvent(attrKeys.home.CLICK_PRODUCT_DETAIL, {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.WISHPRODUCT,
      att: isPriceLow ? 'PRICELOW' : 'HOT',
      productType: getProductType(productSeller.site.id, productSeller.type)
    });
    SessionStorage.set(sessionStorageKeys.productDetailEventProperties, {
      source: attrProperty.productSource.MAIN_WISH
    });
    router.push(`/products/${id}`);
  };

  const onLoadSwiperSlide = useCallback(
    (index: number, priceBefore: number | null) => () => {
      if (index === 0)
        logEvent(attrKeys.home.VIEW_WISHPRODUCT, {
          name: attrProperty.productName.MAIN,
          att: priceBefore ? 'PRICELOW' : 'HOT'
        });
    },
    []
  );

  return isLoading || (isFetched && recommWishes.length > 0) ? (
    <Wrapper>
      <Swiper
        spaceBetween={20}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        onSlideChangeTransitionEnd={({ activeIndex }) => {
          logEvent(attrKeys.home.VIEW_WISHPRODUCT, {
            name: attrProperty.productName.MAIN,
            att: recommWishes[activeIndex]?.priceBefore ? 'PRICELOW' : 'HOT'
          });
        }}
        style={{ padding: '0 20px' }}
      >
        {isLoading ? (
          <SwiperSlide>
            <Card>
              <Flexbox gap={12} direction="vertical">
                <Flexbox gap={8} direction="vertical">
                  <Skeleton width="209px" height="16px" disableAspectRatio isRound />
                  <Skeleton width="130px" height="20px" disableAspectRatio isRound />
                </Flexbox>
                <Skeleton width="96px" height="19px" disableAspectRatio isRound />
              </Flexbox>
              <Skeleton width="74px" height="74px" disableAspectRatio isRound />
            </Card>
          </SwiperSlide>
        ) : (
          recommWishes.map(
            (
              {
                id,
                title,
                priceBefore,
                price,
                viewCount,
                wishCount,
                purchaseCount,
                imageMain,
                productSeller
              },
              index
            ) => (
              <SwiperSlide
                key={`recommendations-wishes-card-${id}`}
                onLoad={onLoadSwiperSlide(index, priceBefore)}
              >
                <Card onClick={handleClick(id, !!priceBefore, productSeller)}>
                  <Flexbox gap={8} direction="vertical" customStyle={{ overflow: 'hidden' }}>
                    <Flexbox gap={2} direction="vertical">
                      <Title
                        id="home.recommendationWishes.title"
                        params={{ title }}
                        variant={priceBefore ? 'body2' : 'body1'}
                      />
                      {priceBefore ? (
                        <PriceDownText
                          variant="h4"
                          weight="bold"
                          id="home.recommendationWishes.price"
                          params={{
                            price: commaNumber(getTenThousandUnitPrice(priceBefore - price))
                          }}
                          isHtml
                        />
                      ) : (
                        <PopularText
                          variant="h4"
                          weight="bold"
                          {...getPopularText({ viewCount, wishCount, purchaseCount })}
                          isHtml
                        />
                      )}
                    </Flexbox>
                    {priceBefore ? (
                      <Flexbox alignment="center" gap={2}>
                        <FormattedText
                          id="home.recommendationWishes.priceBefore"
                          params={{ price: commaNumber(getTenThousandUnitPrice(priceBefore)) }}
                          isHtml
                          weight="medium"
                          customStyle={{ color: common.ui60 }}
                        />
                        <Icon
                          name="ArrowRightOutlined"
                          size="small"
                          customStyle={{ color: common.ui60 }}
                        />
                        <FormattedText
                          id="home.recommendationWishes.priceAfter"
                          params={{ price: commaNumber(getTenThousandUnitPrice(price)) }}
                          isHtml
                          weight="medium"
                        />
                      </Flexbox>
                    ) : (
                      <Flexbox alignment="center" gap={6}>
                        {[
                          { iconName: 'ViewOutlined', value: viewCount },
                          { iconName: 'HeartOutlined', value: wishCount },
                          { iconName: 'MessageOutlined', value: purchaseCount }
                        ].map(({ iconName, value }) => (
                          <Flexbox
                            gap={2}
                            alignment="center"
                            key={`recommendations-wishes-icon-${iconName.toLowerCase()}`}
                          >
                            <Icon
                              name={iconName as IconName}
                              width={14}
                              height={14}
                              customStyle={{ color: common.ui60 }}
                            />
                            <Typography
                              variant="small2"
                              weight="medium"
                              customStyle={{ color: common.ui60 }}
                            >
                              {value}
                            </Typography>
                          </Flexbox>
                        ))}
                      </Flexbox>
                    )}
                  </Flexbox>
                  <Image src={imageMain} isRound disableAspectRatio height={74} width={74} />
                </Card>
              </SwiperSlide>
            )
          )
        )}
      </Swiper>
    </Wrapper>
  ) : null;
}

const Wrapper = styled.section`
  margin-bottom: 20px;

  .swiper-slide {
    margin-right: 20px;
  }
  .swiper-pagination {
    bottom: -6px;
  }
  .swiper-pagination-bullet {
    width: 6px;
    height: 6px;
    background-color: ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
    opacity: 1;
    margin: 0 2px !important;
  }
  .swiper-pagination-bullet-active {
    width: 24px;
    border-radius: 16px;
    background-color: ${({
      theme: {
        palette: { common }
      }
    }) => common.ui80};
  }
`;

const Card = styled.div`
  margin: 20px 0 26px;
  padding: 20px;
  display: flex;
  min-width: 335px;
  width: calc(100vw - 40px);
  height: 114px;
  justify-content: space-between;
  column-gap: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 16px;
`;

const Title = styled(FormattedText)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PriceDownText = styled(FormattedText)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  > span {
    color: ${({
      theme: {
        palette: { secondary }
      }
    }) => secondary.red.main};
  }
`;

const PopularText = styled(FormattedText)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  > span {
    color: ${({
      theme: {
        palette: { primary }
      }
    }) => primary.main};
  }
`;

export default HomeRecommendationsWishes;
