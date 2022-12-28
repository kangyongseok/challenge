import { useState } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Grid, Image, Typography } from 'mrcamel-ui';

import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchCamelProducts } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

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
    <Box component="section" customStyle={{ marginTop: 44 }}>
      <Image
        ratio="4:3"
        width="100%"
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/welcome/auth_seller_banner.png`}
        alt="Auth Seller Banner Img"
        onClick={handleClick}
      />
      <Box customStyle={{ padding: '32px 20px 20px', overflowX: 'hidden' }}>
        <Typography weight="bold" variant="h3" customStyle={{ marginBottom: 20 }}>
          카멜이 깐깐하게 검증한 판매자에요 🧐
        </Typography>
        <Grid container rowGap={32} columnGap={12}>
          {isLoading || isFetching || !camelProducts
            ? Array.from({ length: 4 }, (_, index) => (
                <Grid key={`home-camel-auth-product-skeleton-${index}`} item xs={2}>
                  <ProductGridCardSkeleton isRound />
                </Grid>
              ))
            : camelProducts?.content.slice(0, 8).map((product, index) => (
                <Grid key={`home-camel-auth-product-${product.id}`} item xs={2}>
                  <ProductGridCard
                    product={product}
                    hideAreaWithDateInfo
                    hideLegitStatusLabel
                    wishAtt={{
                      name: attrProperty.name.MAIN,
                      title: attrProperty.title.CAMEL,
                      id: product.id,
                      index: index + 1,
                      brand: product.brand.name,
                      category: product.category.name,
                      parentId: product.category.parentId,
                      site: product.site.name,
                      price: product.price,
                      cluster: product.cluster
                    }}
                    productAtt={{
                      name: attrProperty.name.MAIN,
                      title: attrProperty.title.CAMEL,
                      index: index + 1,
                      id: product.id,
                      brand: product.brand.name,
                      category: product.category.name,
                      parentCategory: FIRST_CATEGORIES[product.category.parentId as number],
                      site: product.site.name,
                      price: product.price
                    }}
                    compact
                    isRound
                    customStyle={{ minWidth: 144, flex: 1 }}
                  />
                </Grid>
              ))}
        </Grid>
      </Box>
    </Box>
  );
}

export default HomeAuthSellerProducts;
