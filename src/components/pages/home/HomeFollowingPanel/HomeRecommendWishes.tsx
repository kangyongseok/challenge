import { useMemo, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Image, Skeleton, Typography, useTheme } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { NewProductGridCard, NewProductGridCardSkeleton } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchRecommWishes, fetchUserHistory } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { PRODUCT_STATUS } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';
import abTestTaskNameKeys from '@constants/abTestTaskNameKeys';

import { groupingProducts } from '@utils/products';

import { ABTestGroup } from '@provider/ABTestProvider';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import HomeRecommendWishCard from '../HomeRecommendWishCard';

function HomeRecommendWishes() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: accessUser } = useQueryAccessUser();
  const { userNickName } = useQueryMyUserInfo();

  const { data = [], isInitialLoading } = useQuery(
    queryKeys.users.recommWishes(),
    fetchRecommWishes,
    {
      enabled: !!accessUser,
      refetchOnMount: true
    }
  );

  const enabledUserHistories = useMemo(
    () => ((!data || !data.length) && !isInitialLoading) || !accessUser,
    [data, isInitialLoading, accessUser]
  );

  const { data: { content = [] } = {}, isInitialLoading: isLoadingUserHistory } = useQuery(
    queryKeys.users.userHistory('recommendWishes'),
    () => fetchUserHistory({ page: 0, size: 12, type: 'PV' }),
    {
      enabled: enabledUserHistories,
      refetchOnMount: true
    }
  );

  const recommendWishes = useMemo(() => groupingProducts(data || []), [data]);

  const notSoldoutProducts = useMemo(() => {
    return content.filter(
      ({ product }) =>
        PRODUCT_STATUS[product.status as keyof typeof PRODUCT_STATUS] === PRODUCT_STATUS['0'] ||
        PRODUCT_STATUS[product.status as keyof typeof PRODUCT_STATUS] === PRODUCT_STATUS['4']
    );
  }, [content]);

  const handleClickMore = () => {
    logEvent(attrKeys.home.CLICK_WISH_LIST, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.WISHALARM
    });
    router.push('/wishes');
  };

  const handleClickHistoryMore = () => {
    logEvent(attrKeys.home.CLICK_RECENT_LIST, {
      name: attrProperty.name.MAIN
    });
    router.push({
      pathname: '/wishes',
      query: {
        tab: 'history'
      }
    });
  };

  const handleClickFind = () => {
    logEvent(attrKeys.home.CLICK_SEARCHMODAL, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.WISHALARM
    });
    router.push('/search');
  };

  if (
    !isInitialLoading &&
    !isLoadingUserHistory &&
    enabledUserHistories &&
    (!content || !content.length || !notSoldoutProducts.length)
  ) {
    return (
      <>
        <Box
          customStyle={{
            textAlign: 'center',
            backgroundColor: '#402877'
          }}
        >
          <Image
            height={104}
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/home/my-portfolio-main-banner.png`}
            alt="MyPortfolio Main Banner Img"
            disableAspectRatio
            onClick={() => router.push('/myPortfolio')}
          />
        </Box>
        <Flexbox
          direction="vertical"
          alignment="center"
          justifyContent="center"
          component="section"
          customStyle={{
            height: 357,
            borderBottom: `1px solid ${common.line01}`
          }}
        >
          <Box customStyle={{ fontSize: 52 }}>🔍</Box>
          <Typography variant="h3" weight="bold" customStyle={{ marginTop: 20 }}>
            검색하고 매물목록을 저장해보세요
          </Typography>
          <Typography variant="h4" customStyle={{ marginTop: 8 }}>
            {userNickName}님이 찾으시는 아이템 여기다 모아드릴거예요.
          </Typography>
          <Button
            variant="ghost"
            size="large"
            brandColor="black"
            onClick={handleClickFind}
            customStyle={{ marginTop: 20 }}
          >
            매물 찾아보기
          </Button>
        </Flexbox>
      </>
    );
  }

  return (
    <Wrapper enabledUserHistories={enabledUserHistories}>
      <Flexbox
        justifyContent="space-between"
        alignment="center"
        customStyle={{ marginBottom: 20, padding: '0 20px', minHeight: 32 }}
      >
        {((isInitialLoading && !enabledUserHistories) ||
          (isLoadingUserHistory && enabledUserHistories)) && (
          <>
            <Skeleton width="100%" maxWidth={153} height={24} round={8} disableAspectRatio />
            <Skeleton width={105} height={16} round={8} disableAspectRatio />
          </>
        )}
        {!isInitialLoading && !enabledUserHistories && (
          <>
            <Typography
              variant="h3"
              weight="bold"
              customStyle={{
                color: common.cmnW
              }}
            >
              지금 봐야 할 찜한 매물
            </Typography>
            <Button
              variant="inline"
              size="small"
              endIcon={<Icon name="Arrow2RightOutlined" color={common.cmnW} />}
              onClick={handleClickMore}
              customStyle={{
                color: common.cmnW
              }}
            >
              찜한 매물보기
            </Button>
          </>
        )}
        {!isLoadingUserHistory && enabledUserHistories && notSoldoutProducts.length && (
          <>
            <Typography
              variant="h3"
              weight="bold"
              customStyle={{
                color: common.ui20
              }}
            >
              최근에 본 매물이에요 👀
            </Typography>
            <Button
              variant="inline"
              size="small"
              endIcon={<Icon name="Arrow2RightOutlined" color={common.ui20} />}
              onClick={handleClickHistoryMore}
              customStyle={{
                color: common.ui20
              }}
            >
              더보기
            </Button>
          </>
        )}
      </Flexbox>
      {isInitialLoading && !enabledUserHistories && (
        <Flexbox direction="vertical" gap={12} customStyle={{ padding: '0 20px' }}>
          <Card gap={12}>
            <Box customStyle={{ position: 'relative', width: 48, height: 48 }}>
              <Skeleton round={32} />
              <Badge>
                <Skeleton />
              </Badge>
            </Box>
            <Flexbox direction="vertical" gap={15} customStyle={{ flexGrow: 1 }}>
              <Skeleton width="100%" height={40} round={8} disableAspectRatio />
              <Flexbox alignment="center" justifyContent="space-between">
                <Skeleton width="100%" maxWidth={70} height={16} round={8} disableAspectRatio />
                <Skeleton width={30} height={16} round={8} disableAspectRatio />
              </Flexbox>
            </Flexbox>
          </Card>
          <Card gap={12}>
            <Box customStyle={{ position: 'relative', width: 48, height: 48 }}>
              <Skeleton round={32} />
              <Badge>
                <Skeleton />
              </Badge>
            </Box>
            <Flexbox direction="vertical" gap={15} customStyle={{ flexGrow: 1 }}>
              <Skeleton width="100%" height={40} round={8} disableAspectRatio />
              <Flexbox alignment="center" justifyContent="space-between">
                <Skeleton width="100%" maxWidth={70} height={16} round={8} disableAspectRatio />
                <Skeleton width={30} height={16} round={8} disableAspectRatio />
              </Flexbox>
            </Flexbox>
          </Card>
        </Flexbox>
      )}
      {isLoadingUserHistory && enabledUserHistories && (
        <List>
          <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2302} belong="A">
            {Array.from({ length: 10 }).map((_, index) => (
              <NewProductGridCardSkeleton
                // eslint-disable-next-line react/no-array-index-key
                key={`home-user-history-product-skeleton-${index}`}
                variant="swipeX"
                hideMetaInfo
              />
            ))}
          </ABTestGroup>
          <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2302} belong="B">
            {Array.from({ length: 10 }).map((_, index) => (
              <NewProductGridCardSkeleton
                // eslint-disable-next-line react/no-array-index-key
                key={`home-user-history-product-skeleton-${index}`}
                variant="swipeX"
                hideMetaInfo
              />
            ))}
          </ABTestGroup>
        </List>
      )}
      {!isInitialLoading && !enabledUserHistories && (
        <Swiper spaceBetween={20} onSlideChange={({ activeIndex }) => setCurrentSlide(activeIndex)}>
          {recommendWishes.map(([firstRecommendWish, secondRecommendWish]) => (
            <SwiperSlide
              key={`home-recommend-wish-group-${firstRecommendWish.id}-${
                (secondRecommendWish || {}).id || 0
              }`}
            >
              <Flexbox direction="vertical" gap={12} customStyle={{ padding: '0 20px' }}>
                <HomeRecommendWishCard productResult={firstRecommendWish} />
                {secondRecommendWish && (
                  <HomeRecommendWishCard productResult={secondRecommendWish} />
                )}
              </Flexbox>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      {!isLoadingUserHistory && enabledUserHistories && notSoldoutProducts.length && (
        <List>
          <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2302} belong="A">
            {notSoldoutProducts.map(({ product }, index) => (
              <NewProductGridCard
                key={`home-user-history-product-${product.id}`}
                variant="swipeX"
                product={product}
                attributes={{
                  name: attrProperty.name.MAIN,
                  title: attrProperty.title.RECENT_LIST,
                  source: attrProperty.source.MAIN_RECENT,
                  index: index + 1
                }}
              />
            ))}
          </ABTestGroup>
          <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2302} belong="B">
            {notSoldoutProducts.map(({ product }, index) => (
              <NewProductGridCard
                key={`home-user-history-product-${product.id}`}
                variant="swipeX"
                product={product}
                platformLabelType="B"
                hideSize={false}
                attributes={{
                  name: attrProperty.name.MAIN,
                  title: attrProperty.title.RECENT_LIST,
                  source: attrProperty.source.MAIN_RECENT,
                  index: index + 1
                }}
              />
            ))}
          </ABTestGroup>
        </List>
      )}
      {!enabledUserHistories && (
        <Flexbox gap={6} justifyContent="center" alignment="center" customStyle={{ marginTop: 12 }}>
          {Array.from({ length: recommendWishes.length || 5 }).map((_, index) => (
            <Dot
              // eslint-disable-next-line react/no-array-index-key
              key={`home-recommend-wish-products-pagination-dot-${index}`}
              isActive={currentSlide === index}
            />
          ))}
        </Flexbox>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.section<{ enabledUserHistories: boolean }>`
  padding: 32px 0;
  background-color: ${({
    theme: {
      palette: { common }
    },
    enabledUserHistories
  }) => (enabledUserHistories ? common.bg02 : common.cmn80)};
  transition: background-color 0.2s;
`;

const List = styled.section`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 12px;
  padding: 0 20px;
  min-height: 98px;
  overflow-x: auto;

  & > div {
    width: 120px;
  }
`;

const Card = styled(Flexbox)`
  padding: 20px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg01};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
`;

const Badge = styled.div`
  position: absolute;
  right: -4px;
  bottom: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
  border-radius: 32px;
`;

const Dot = styled.div<{ isActive: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({
    theme: {
      palette: { common }
    },
    isActive
  }) => (isActive ? common.cmnW : common.ui60)};
`;

export default HomeRecommendWishes;
