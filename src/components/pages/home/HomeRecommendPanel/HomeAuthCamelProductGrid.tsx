import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Grid, Icon, Typography } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import { NewProductGridCard, NewProductGridCardSkeleton } from '@components/UI/molecules';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchCamelProducts } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function HomeAuthCamelProductGrid() {
  const router = useRouter();

  const { data: { content = [] } = {}, isInitialLoading } = useQuery(
    queryKeys.products.camelProducts({
      idFilters: [5]
    }),
    () =>
      fetchCamelProducts({
        idFilters: [5]
      })
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

    router.push({
      pathname: '/products/camel',
      query: {
        idFilterIds: [5]
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
          믿고 거래하는
          <br />
          카멜인증 매물만 모았어요!
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
            <Grid key={`home-auth-camel-product-${index}`} item xs={2}>
              <NewProductGridCardSkeleton variant="gridB" />
            </Grid>
          ))}
        {!isInitialLoading &&
          content.slice(0, 10).map((product) => (
            <Grid key={`home-auth-camel-product-${product.id}`} item xs={2}>
              <NewProductGridCard
                variant="gridB"
                product={product}
                attributes={{
                  name: attrProperty.name.MAIN,
                  title: attrProperty.title.CAMEL,
                  source: `${attrProperty.name.MAIN}_${attrProperty.title.CAMEL}`
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
        카멜인증 더보기
      </Button>
    </Box>
  );
}

export default HomeAuthCamelProductGrid;
