import { useMemo, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';
import { Image, Skeleton } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { fetchRecommWishes, fetchUserHistory } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { PRODUCT_STATUS } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { groupingProducts } from '@utils/products';

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

  const { data = [], isLoading } = useQuery(queryKeys.users.recommWishes(), fetchRecommWishes, {
    enabled: !!accessUser,
    refetchOnMount: true
  });

  const enabledUserHistories = useMemo(
    () => ((!data || !data.length) && !isLoading) || !accessUser,
    [data, isLoading, accessUser]
  );

  const { data: { content = [] } = {}, isLoading: isLoadingUserHistory } = useQuery(
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
    !isLoading &&
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
            height="104px"
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/home/my-portfolio-main-banner.png`}
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
            {`${(accessUser || {}).userName || '회원'}님이 찾으시는 아이템 여기다 모아드릴거예요.`}
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
        {(isLoading || isLoadingUserHistory) && (
          <>
            <Skeleton width="100%" maxWidth="153px" height="24px" disableAspectRatio isRound />
            <Skeleton width="105px" height="16px" disableAspectRatio isRound />
          </>
        )}
        {!isLoading && !enabledUserHistories && (
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
      {isLoading && !enabledUserHistories && (
        <Flexbox direction="vertical" gap={12} customStyle={{ padding: '0 20px' }}>
          <Card gap={12}>
            <Box customStyle={{ position: 'relative', width: 48, height: 48 }}>
              <Skeleton customStyle={{ borderRadius: 32 }} />
              <Badge>
                <Skeleton />
              </Badge>
            </Box>
            <Flexbox direction="vertical" gap={15} customStyle={{ flexGrow: 1 }}>
              <Skeleton width="100%" height="40px" disableAspectRatio isRound />
              <Flexbox alignment="center" justifyContent="space-between">
                <Skeleton width="100%" maxWidth="70px" height="16px" disableAspectRatio isRound />
                <Skeleton width="30px" height="16px" disableAspectRatio isRound />
              </Flexbox>
            </Flexbox>
          </Card>
          <Card gap={12}>
            <Box customStyle={{ position: 'relative', width: 48, height: 48 }}>
              <Skeleton customStyle={{ borderRadius: 32 }} />
              <Badge>
                <Skeleton />
              </Badge>
            </Box>
            <Flexbox direction="vertical" gap={15} customStyle={{ flexGrow: 1 }}>
              <Skeleton width="100%" height="40px" disableAspectRatio isRound />
              <Flexbox alignment="center" justifyContent="space-between">
                <Skeleton width="100%" maxWidth="70px" height="16px" disableAspectRatio isRound />
                <Skeleton width="30px" height="16px" disableAspectRatio isRound />
              </Flexbox>
            </Flexbox>
          </Card>
        </Flexbox>
      )}
      {isLoadingUserHistory && enabledUserHistories && (
        <List>
          {Array.from({ length: 10 }).map((_, index) => (
            <ProductGridCardSkeleton
              // eslint-disable-next-line react/no-array-index-key
              key={`home-user-history-product-skeleton-${index}`}
              isRound
            />
          ))}
        </List>
      )}
      {!isLoading && !enabledUserHistories && (
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
          {notSoldoutProducts.map(({ product }, index) => (
            <ProductGridCard
              key={`home-user-history-product-${product.id}`}
              product={product}
              productAtt={{
                name: attrProperty.name.MAIN,
                title: attrProperty.title.RECENT_LIST,
                id: product.id,
                index: index + 1,
                brand: product.brand.name,
                category: product.category.name,
                parentId: product.category.parentId,
                site: product.site.name,
                price: product.price,
                cluster: product.cluster,
                source: attrProperty.source.MAIN_RECENT
              }}
              wishAtt={{
                name: attrProperty.name.MAIN,
                title: attrProperty.title.RECENT_LIST,
                id: product.id,
                index: index + 1,
                brand: product.brand.name,
                category: product.category.name,
                parentId: product.category.parentId,
                site: product.site.name,
                price: product.price,
                cluster: product.cluster,
                source: attrProperty.source.MAIN_RECENT
              }}
              source={attrProperty.source.MAIN_RECENT}
              isRound
              hideProductLabel
              hideAreaWithDateInfo
              compact
            />
          ))}
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
