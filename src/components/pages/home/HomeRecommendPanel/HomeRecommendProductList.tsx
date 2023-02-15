import { useRouter } from 'next/router';
import { Box, Grid, Image, Skeleton, Typography } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import { NewProductGridCard, NewProductGridCardSkeleton } from '@components/UI/molecules';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchRecommendProducts } from '@api/personal';

import { GENDER_BY_VALUE } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';
import abTestTaskNameKeys from '@constants/abTestTaskNameKeys';

import { ABTestGroup } from '@provider/ABTestProvider';
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
        src={imageMain || ''}
        alt="Recommend Product Banner Img"
        onClick={handleClick}
      />
      <Box customStyle={{ padding: '32px 16px 20px', overflowX: 'hidden' }}>
        {isLoading && (
          <Skeleton
            width="100%"
            maxWidth={155}
            height={24}
            round={8}
            disableAspectRatio
            customStyle={{ marginBottom: 20 }}
          />
        )}
        {!isLoading && (
          <Typography variant="h3" weight="bold" customStyle={{ marginBottom: 20 }}>
            {title}
          </Typography>
        )}
        <Grid container rowGap={20} columnGap={12}>
          <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2302} belong="A">
            {isLoading &&
              Array.from({ length: 8 }, (_, index) => (
                <Grid key={`home-recommend-product-skeleton-${index}`} item xs={2}>
                  <NewProductGridCardSkeleton variant="gridB" />
                </Grid>
              ))}
            {!isLoading &&
              content.map((product, i) => (
                <Grid key={`home-recommend-product-${product.id}`} item xs={2}>
                  <NewProductGridCard
                    variant="gridB"
                    product={product}
                    attributes={{
                      name: attrProperty.name.MAIN,
                      title: attrProperty.title.RECOMM,
                      source: attrProperty.source.MAIN_RECOMM,
                      index: i + 1
                    }}
                  />
                </Grid>
              ))}
          </ABTestGroup>
          <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2302} belong="B">
            {isLoading &&
              Array.from({ length: 8 }, (_, index) => (
                <Grid key={`home-recommend-product-skeleton-${index}`} item xs={2}>
                  <NewProductGridCardSkeleton variant="gridB" />
                </Grid>
              ))}
            {!isLoading &&
              content.map((product, i) => (
                <Grid key={`home-recommend-product-${product.id}`} item xs={2}>
                  <NewProductGridCard
                    variant="gridB"
                    product={product}
                    platformLabelType="B"
                    hideSize={false}
                    attributes={{
                      name: attrProperty.name.MAIN,
                      title: attrProperty.title.RECOMM,
                      source: attrProperty.source.MAIN_RECOMM,
                      index: i + 1
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

export default HomeRecommendProductList;
