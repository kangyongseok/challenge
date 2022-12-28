import { useResetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Grid, Image, Typography } from 'mrcamel-ui';

// import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';
import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchPersonalsSellerProducts } from '@api/personal';

import queryKeys from '@constants/queryKeys';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { eventContentProductsParamsState } from '@recoil/eventFilter';

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
    <Box component="section" customStyle={{ marginTop: 44 }}>
      <Image
        ratio="4:3"
        width="100%"
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/welcome/quick_product_banner.png`}
        alt="Auth Seller Banner Img"
        onClick={handleClick}
      />
      <Box customStyle={{ padding: '32px 20px 20px', overflowX: 'hidden' }}>
        <Typography weight="bold" variant="h3" customStyle={{ marginBottom: 20 }}>
          언제나 매력적인 새로 올라온 매물! 😎
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
                    hideLegitStatusLabel
                    hideProductLabel
                    hideSafePayment
                    wishAtt={{
                      name: attrProperty.name.MAIN,
                      title: attrProperty.title.GENERAL_SELLER,
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
                      title: attrProperty.title.GENERAL_SELLER,
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

export default HomeQuickSaleProducts;
