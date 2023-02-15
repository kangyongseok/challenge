import { useState } from 'react';

import { useRouter } from 'next/router';
import { Box, Grid, Image, Typography } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import { NewProductGridCard, NewProductGridCardSkeleton } from '@components/UI/molecules';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchCamelProducts } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';
import abTestTaskNameKeys from '@constants/abTestTaskNameKeys';

import { ABTestGroup } from '@provider/ABTestProvider';

function HomeAuthSellerProducts() {
  const router = useRouter();

  const [camelProductsParams] = useState({ page: 0, size: 8 });
  const {
    data: camelProducts,
    isLoading,
    isFetching
  } = useQuery(queryKeys.products.camelProducts(camelProductsParams), () =>
    fetchCamelProducts(camelProductsParams)
  );

  const handleClick = () => {
    logEvent(attrKeys.home.CLICK_PRODUCT_LIST, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.CAMEL
    });
    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.CAMEL,
      type: attrProperty.type.GUIDED
    });
    router.push('/products/camel');
  };

  return (
    <Box component="section" customStyle={{ marginTop: 32 }}>
      <Image
        ratio="4:3"
        width="100%"
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/welcome/auth_seller_banner.png`}
        alt="Auth Seller Banner Img"
        onClick={handleClick}
      />
      <Box customStyle={{ padding: '32px 16px 20px', overflowX: 'hidden' }}>
        <Typography weight="bold" variant="h3" customStyle={{ marginBottom: 20 }}>
          카멜이 깐깐하게 검증한 판매자에요 🧐
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
                      hideLabel={false}
                      attributes={{
                        name: attrProperty.name.MAIN,
                        title: attrProperty.title.CAMEL,
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
                      hideLabel={false}
                      attributes={{
                        name: attrProperty.name.MAIN,
                        title: attrProperty.title.CAMEL,
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

export default HomeAuthSellerProducts;
