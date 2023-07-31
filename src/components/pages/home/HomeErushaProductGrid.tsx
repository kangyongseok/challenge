import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, Flexbox, Grid, Icon, Typography } from '@mrcamelhub/camel-ui';

import { NewProductGridCard, NewProductGridCardSkeleton } from '@components/UI/molecules';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchSearch } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function HomeErushaProductGrid() {
  const router = useRouter();

  const { data: { page: { content = [] } = {} } = {}, isInitialLoading } = useQuery(
    queryKeys.products.erushaProducts({
      brandIds: [39, 11, 44],
      minPrice: 3000000,
      categories: '가방',
      order: 'recommDesc'
    }),
    () =>
      fetchSearch({
        brandIds: [39, 11, 44],
        minPrice: 3000000,
        categories: '가방',
        order: 'recommDesc'
      })
  );

  const handleClick = () => {
    logEvent(attrKeys.home.CLICK_PRODUCT_LIST, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.ERUSHA
    });

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.ERUSHA,
      type: attrProperty.type.GUIDED
    });

    router.push({
      pathname: '/products/categories/가방',
      query: {
        brandIds: [39, 11, 44],
        minPrice: 3000000,
        order: 'recommDesc'
      }
    });
  };

  return (
    <Box
      component="section"
      customStyle={{
        padding: '32px 16px'
      }}
    >
      <Flexbox
        alignment="baseline"
        justifyContent="space-between"
        customStyle={{
          marginBottom: 20
        }}
      >
        <Typography variant="h3" weight="bold">
          오늘이 제일 저렴한 <br />
          에•루•샤 가방 모음전 👜
        </Typography>
        <Button
          variant="inline"
          size="small"
          endIcon={<Icon name="Arrow2RightOutlined" />}
          onClick={handleClick}
          disablePadding
          customStyle={{
            gap: 0
          }}
        >
          전체보기
        </Button>
      </Flexbox>
      <Grid container columnGap={11.5} rowGap={32}>
        {isInitialLoading &&
          Array.from({ length: 10 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Grid key={`home-erusha-product-${index}`} item xs={2}>
              <NewProductGridCardSkeleton variant="gridB" />
            </Grid>
          ))}
        {!isInitialLoading &&
          content.slice(0, 10).map((product) => (
            <Grid key={`home-erusha-product-${product.id}`} item xs={2}>
              <NewProductGridCard
                variant="gridB"
                product={product}
                attributes={{
                  name: attrProperty.name.MAIN,
                  title: attrProperty.title.ERUSHA,
                  source: `${attrProperty.name.MAIN}_${attrProperty.title.ERUSHA}`
                }}
              />
            </Grid>
          ))}
      </Grid>
      <Button
        variant="ghost"
        brandColor="black"
        size="large"
        fullWidth
        onClick={handleClick}
        customStyle={{
          marginTop: 20
        }}
      >
        에루샤 모음전 더보기
      </Button>
    </Box>
  );
}

export default HomeErushaProductGrid;
