import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Grid, Typography } from 'mrcamel-ui';

import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';
import { Image, Skeleton } from '@components/UI/atoms';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchRecommendProducts } from '@api/personal';

import { GENDER_BY_VALUE } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryUserInfo from '@hooks/useQueryUserInfo';

function HomeRecommendProductList() {
  const router = useRouter();
  const { data: { info: { value: { gender = '' } = {} } = {} } = {} } = useQueryUserInfo();

  const { data: { title, name, products: { content = [] } = {}, imageMain } = {}, isLoading } =
    useQuery(queryKeys.personals.recommendProducts({ size: 8, useStyle: false }), () =>
      fetchRecommendProducts({ size: 8, useStyle: false })
    );

  const handleClick = () => {
    logEvent(attrKeys.home.CLICK_PRODUCT_LIST, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.RECOMMBANNER
    });
    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.RECOMMBANNER,
      type: attrProperty.type.GUIDED
    });
    const genders = GENDER_BY_VALUE[gender as 'M' | 'F'];

    const query: { genders?: string } = {
      genders
    };

    if (!genders) {
      delete query.genders;
    }

    router.push({
      pathname: `/products/search/${name}`,
      query
    });
  };

  return (
    <Box component="section" customStyle={{ marginTop: 32 }}>
      <Image
        ratio="4:3"
        width="100%"
        src={imageMain}
        alt="Recommend Product Banner Img"
        onClick={handleClick}
        disableSkeletonRender={false}
      />
      <Box customStyle={{ padding: '32px 20px 20px', overflowX: 'hidden' }}>
        {isLoading && (
          <Skeleton
            width="100%"
            maxWidth="155px"
            height="24px"
            isRound
            disableAspectRatio
            customStyle={{ marginBottom: 20 }}
          />
        )}
        {!isLoading && (
          <Typography variant="h3" weight="bold" customStyle={{ marginBottom: 20 }}>
            {title}
          </Typography>
        )}
        <Grid container rowGap={32} columnGap={12}>
          {isLoading &&
            Array.from({ length: 8 }, (_, index) => (
              <Grid key={`home-recommend-product-skeleton-${index}`} item xs={2}>
                <ProductGridCardSkeleton isRound />
              </Grid>
            ))}
          {!isLoading &&
            content.map((product, i) => (
              <Grid key={`home-recommend-product-${product.id}`} item xs={2}>
                <ProductGridCard
                  product={product}
                  hideProductLabel
                  hideLegitStatusLabel
                  wishAtt={{
                    name: attrProperty.name.MAIN,
                    title: attrProperty.title.RECOMM,
                    id: product.id,
                    index: i + 1,
                    brand: product.brand.name,
                    category: product.category.name,
                    parentId: product.category.parentId,
                    site: product.site.name,
                    price: product.price,
                    cluster: product.cluster,
                    source: attrProperty.source.MAIN_RECOMM
                  }}
                  productAtt={{
                    name: attrProperty.name.MAIN,
                    title: attrProperty.title.RECOMM,
                    id: product.id,
                    index: i + 1,
                    brand: product.brand.name,
                    category: product.category.name,
                    parentId: product.category.parentId,
                    site: product.site.name,
                    price: product.price,
                    cluster: product.cluster,
                    source: attrProperty.source.MAIN_RECOMM
                  }}
                  source={attrProperty.source.MAIN_RECOMM}
                  compact
                  isRound
                />
              </Grid>
            ))}
        </Grid>
      </Box>
    </Box>
  );
}

export default HomeRecommendProductList;
