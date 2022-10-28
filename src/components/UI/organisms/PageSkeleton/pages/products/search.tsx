import { Flexbox, Grid, Typography } from 'mrcamel-ui';

import {
  BottomNavigation,
  LinearProgress,
  ProductGridCardSkeleton
} from '@components/UI/molecules';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsFilter,
  ProductsHeader,
  ProductsRelatedKeywords
} from '@components/pages/products';

function SearchProducts() {
  return (
    <GeneralTemplate
      header={
        <div>
          <ProductsHeader variant="search" />
          <ProductsRelatedKeywords />
          <ProductsFilter variant="search" showDynamicFilter />
        </div>
      }
      footer={
        <BottomNavigation
          disableHideOnScroll={false}
          disableProductsKeywordClickInterceptor={false}
        />
      }
      disablePadding
    >
      <Gap height={8} />
      <Flexbox
        justifyContent="space-between"
        customStyle={{
          position: 'relative',
          padding: '16px 20px'
        }}
      >
        <LinearProgress value={0} customStyle={{ position: 'absolute', top: 0, left: 0 }} />
        <Typography variant="body2" weight="medium">
          매물 검색 중...
        </Typography>
      </Flexbox>
      <Grid container rowGap={32}>
        {Array.from({ length: 10 }, (_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Grid key={`product-card-skeleton-${index}`} item xs={2}>
            <ProductGridCardSkeleton />
          </Grid>
        ))}
      </Grid>
      <Gap height={8} />
    </GeneralTemplate>
  );
}

export default SearchProducts;
