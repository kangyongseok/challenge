import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, Flexbox, Grid, Icon, Typography } from '@mrcamelhub/camel-ui';

import { NewProductGridCard, NewProductGridCardSkeleton } from '@components/UI/molecules';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchCamelProducts } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function HomeNewCamelProductGrid() {
  const router = useRouter();

  const { data: { content = [] } = {}, isInitialLoading } = useQuery(
    queryKeys.products.camelProducts({
      order: 'postedAllDesc'
    }),
    () =>
      fetchCamelProducts({
        order: 'postedAllDesc'
      })
  );

  const handleClick = () => {
    logEvent(attrKeys.home.CLICK_PRODUCT_LIST, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.CAMEL_POSTED
    });

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.CAMEL_POSTED,
      type: attrProperty.type.GUIDED
    });

    router.push({
      pathname: '/products/camel/새로 올라왔어요!',
      query: {
        order: 'postedAllDesc'
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
          새로 올라왔어요! 🌈
          <br />
          채팅으로 거래를 시작해보세요.
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
            <Grid key={`home-new-camel-product-${index}`} item xs={2}>
              <NewProductGridCardSkeleton variant="gridB" />
            </Grid>
          ))}
        {!isInitialLoading &&
          content.slice(0, 10).map((product) => (
            <Grid key={`home-new-camel-product-${product.id}`} item xs={2}>
              <NewProductGridCard
                variant="gridB"
                product={product}
                attributes={{
                  name: attrProperty.name.MAIN,
                  title: attrProperty.title.CAMEL_POSTED,
                  source: `${attrProperty.name.MAIN}_${attrProperty.title.CAMEL_POSTED}`
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
        새로 올라온 매물 더보기
      </Button>
    </Box>
  );
}

export default HomeNewCamelProductGrid;
