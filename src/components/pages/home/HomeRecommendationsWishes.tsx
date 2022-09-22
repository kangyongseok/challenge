import { useCallback } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import * as SvgIcons from 'mrcamel-ui/dist/assets/icons';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Image, Skeleton } from '@components/UI/atoms';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchRecommWishes } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber } from '@utils/common';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function HomeRecommendationsWishes() {
  const router = useRouter();
  const {
    theme: { palette }
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

  const handleClick = (id: number, isPriceLow: boolean) => () => {
    logEvent(attrKeys.home.CLICK_PRODUCT_DETAIL, {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.WISHPRODUCT,
      att: isPriceLow ? 'PRICELOW' : 'HOT'
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
        {isLoading
          ? Array.from({ length: 1 }, (_, index) => (
              <SwiperSlide
                key={`recommendations-wishes-skeleton-${index}`}
                style={{ width: '100vw' }}
              >
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
            ))
          : recommWishes.map(
              (
                { id, title, priceBefore, price, viewCount, wishCount, purchaseCount, imageMain },
                index
              ) => (
                <SwiperSlide
                  key={`recommendations-wishes-card-${id}`}
                  onLoad={onLoadSwiperSlide(index, priceBefore)}
                >
                  <Card onClick={handleClick(id, !!priceBefore)}>
                    <Flexbox gap={8} direction="vertical" customStyle={{ overflow: 'hidden' }}>
                      <Flexbox gap={2} direction="vertical">
                        <Title variant={priceBefore ? 'body2' : 'body1'}>찜한 {title}</Title>
                        {priceBefore ? (
                          <PriceDownText variant="h4" weight="bold">
                            <span>
                              {commaNumber(getTenThousandUnitPrice(priceBefore - price))}만원&nbsp;
                            </span>
                            저렴해졌어요!
                          </PriceDownText>
                        ) : (
                          <PopularText variant="h4" weight="bold">
                            <span>{commaNumber(viewCount)}명</span>이나 봤어요!
                          </PopularText>
                        )}
                      </Flexbox>
                      {priceBefore ? (
                        <Flexbox alignment="center" gap={2}>
                          <Typography
                            weight="medium"
                            customStyle={{ color: palette.common.grey['60'] }}
                          >
                            {commaNumber(getTenThousandUnitPrice(priceBefore))}만
                          </Typography>
                          <Icon
                            name="ArrowRightOutlined"
                            size="small"
                            customStyle={{ color: palette.common.grey['60'] }}
                          />
                          <Typography weight="medium">
                            {commaNumber(getTenThousandUnitPrice(price))}만
                          </Typography>
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
                                name={iconName as keyof typeof SvgIcons}
                                width={14}
                                height={14}
                                customStyle={{ color: palette.common.grey['60'] }}
                              />
                              <Typography
                                variant="small2"
                                weight="medium"
                                customStyle={{ color: palette.common.grey['60'] }}
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
            )}
      </Swiper>
    </Wrapper>
  ) : null;
}

const Wrapper = styled(Flexbox)`
  margin-bottom: 20px;

  .swiper-pagination {
    bottom: -6px;
  }
  .swiper-pagination-bullet {
    width: 6px;
    height: 6px;
    background-color: ${({ theme }) => theme.palette.common.grey['90']};
    opacity: 1;
    margin: 0 2px !important;
  }
  .swiper-pagination-bullet-active {
    width: 24px;
    border-radius: 16px;
    background-color: ${({ theme }) => theme.palette.common.grey['80']};
  }
`;

const Card = styled.div`
  margin: 20px 0 26px;
  padding: 20px;
  display: grid;
  grid-auto-flow: column;
  min-width: 335px;
  justify-content: space-between;
  column-gap: 12px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 16px;
`;

const Title = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PriceDownText = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  > span {
    color: ${({ theme }) => theme.palette.secondary.red.main};
  }
`;

const PopularText = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  > span {
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

export default HomeRecommendationsWishes;
