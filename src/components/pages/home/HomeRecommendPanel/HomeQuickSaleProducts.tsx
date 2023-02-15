import { useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Grid, Image, Typography } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import { NewProductGridCard, NewProductGridCardSkeleton } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchPersonalsSellerProducts } from '@api/personal';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';
import abTestTaskNameKeys from '@constants/abTestTaskNameKeys';

import { eventContentProductsParamsState } from '@recoil/eventFilter';
import { ABTestGroup } from '@provider/ABTestProvider';

function HomeQuickSaleProducts() {
  const router = useRouter();
  const resetEventContentProductsParamsState = useResetRecoilState(eventContentProductsParamsState);
  const {
    data: camelProducts,
    isLoading,
    isFetching
  } = useQuery(queryKeys.personals.sellerProducts(), () => fetchPersonalsSellerProducts());

  const handleClick = () => {
    resetEventContentProductsParamsState();
    logEvent(attrKeys.home.CLICK_CRAZYWEEK, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.BANNER,
      att: attrProperty.title.GENERAL_SELLER
    });

    router.push('/events/신선한-매물-15');
  };

  return (
    <Box component="section" customStyle={{ marginTop: 32 }}>
      <Image
        ratio="4:3"
        width="100%"
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/welcome/quick_product_banner.png`}
        alt="Auth Seller Banner Img"
        onClick={handleClick}
      />
      <Box customStyle={{ padding: '32px 16px 20px', overflowX: 'hidden' }}>
        <Typography weight="bold" variant="h3" customStyle={{ marginBottom: 20 }}>
          언제나 매력적인 새로 올라온 매물! 😎
        </Typography>
        <Grid container rowGap={20} columnGap={12}>
          <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2302} belong="A">
            {isLoading || isFetching || !camelProducts
              ? Array.from({ length: 4 }, (_, index) => (
                  <Grid key={`home-camel-auth-product-skeleton-${index}`} item xs={2}>
                    <NewProductGridCardSkeleton variant="gridB" />
                  </Grid>
                ))
              : camelProducts?.content.slice(0, 8).map((product, index) => (
                  <Grid key={`home-camel-auth-product-${product.id}`} item xs={2}>
                    <NewProductGridCard
                      variant="gridB"
                      product={product}
                      attributes={{
                        name: attrProperty.name.MAIN,
                        title: attrProperty.title.GENERAL_SELLER,
                        index: index + 1
                      }}
                    />
                  </Grid>
                ))}
          </ABTestGroup>
          <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2302} belong="B">
            {isLoading || isFetching || !camelProducts
              ? Array.from({ length: 4 }, (_, index) => (
                  <Grid key={`home-camel-auth-product-skeleton-${index}`} item xs={2}>
                    <NewProductGridCardSkeleton variant="gridB" />
                  </Grid>
                ))
              : camelProducts?.content.slice(0, 8).map((product, index) => (
                  <Grid key={`home-camel-auth-product-${product.id}`} item xs={2}>
                    <NewProductGridCard
                      variant="gridB"
                      product={product}
                      platformLabelType="B"
                      hideSize={false}
                      attributes={{
                        name: attrProperty.name.MAIN,
                        title: attrProperty.title.GENERAL_SELLER,
                        index: index + 1
                      }}
                    />
                  </Grid>
                ))}
          </ABTestGroup>
        </Grid>
      </Box>
    </Box>
  );
}

export default HomeQuickSaleProducts;
