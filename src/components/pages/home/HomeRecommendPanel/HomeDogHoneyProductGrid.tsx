import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Grid, Icon, Typography } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import { NewProductGridCard, NewProductGridCardSkeleton } from '@components/UI/molecules';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchContentProducts } from '@api/common';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function HomeDogHoneyProductGrid() {
  const router = useRouter();

  const { data: { content = [] } = {}, isInitialLoading } = useQuery(
    queryKeys.commons.contentProducts({
      id: 17,
      keyword: 'recomm'
    }),
    () =>
      fetchContentProducts({
        id: 17,
        keyword: 'recomm'
      })
  );

  const handleClick = () => {
    logEvent(attrKeys.home.CLICK_PRODUCT_LIST, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.DOG_HONEY
    });

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.name.EVENT_DETAIL,
      title: '2301_DOG_HONEY',
      type: attrProperty.type.GUIDED
    });

    router.push('/events/dogHoney');
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
          실거래가보다 저렴한
          <br />
          급처, 개꿀매모음 🍯
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
            <Grid key={`home-dog-honey-product-${index}`} item xs={2}>
              <NewProductGridCardSkeleton variant="gridB" />
            </Grid>
          ))}
        {!isInitialLoading &&
          content.slice(0, 10).map((product) => (
            <Grid key={`home-dog-honey-product-${product.id}`} item xs={2}>
              <NewProductGridCard
                variant="gridB"
                product={product}
                platformLabelType="B"
                attributes={{
                  name: attrProperty.name.MAIN,
                  title: attrProperty.title.DOG_HONEY,
                  source: `${attrProperty.name.MAIN}_${attrProperty.title.DOG_HONEY}`
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
        개꿀매 더보기
      </Button>
    </Box>
  );
}

export default HomeDogHoneyProductGrid;
