import { Box, Flexbox, Grid, Skeleton, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { LinearProgress, ProductGridCardSkeleton } from '@components/UI/molecules';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { ProductsHeader } from '@components/pages/products';

function SearchProducts() {
  return (
    <GeneralTemplate
      header={
        <div>
          <ProductsHeader variant="search" />
          <Box component="section" customStyle={{ position: 'relative' }}>
            <Gap height={8} />
          </Box>
          <Box
            customStyle={{
              padding: '8px 0 12px'
            }}
          >
            <List
              css={{
                paddingTop: 0,
                minHeight: 36,
                gap: 12
              }}
            >
              <Skeleton width={86.2} height={20} disableAspectRatio />
              <Skeleton width={73.77} height={20} disableAspectRatio />
              <Skeleton width={89.86} height={20} disableAspectRatio />
            </List>
            <List>
              {Array.from({ length: 12 }).map((_, index) => (
                <Skeleton
                  // eslint-disable-next-line react/no-array-index-key
                  key={`products-filter-skeleton-${index}`}
                  width={68}
                  height={36}
                  round={8}
                  disableAspectRatio
                />
              ))}
            </List>
          </Box>
        </div>
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

const List = styled.div`
  height: 100%;
  padding: 8px 16px 0;
  display: flex;
  align-items: center;
  column-gap: 8px;
  width: fit-content;
`;

export default SearchProducts;
