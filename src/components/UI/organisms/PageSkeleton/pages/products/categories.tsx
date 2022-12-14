import { Box, Flexbox, Grid, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import {
  BottomNavigation,
  Header,
  LinearProgress,
  ProductGridCardSkeleton
} from '@components/UI/molecules';
import { Gap, Skeleton } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';

function CategoryProducts() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <GeneralTemplate
      header={
        <div>
          <Header>
            <Skeleton width="45px" height="24px" isRound disableAspectRatio />
          </Header>
          <Box component="section" customStyle={{ position: 'relative' }}>
            <Wrapper>
              <List
                css={{
                  minHeight: 40,
                  padding: '0 20px',
                  gap: 20
                }}
              >
                {Array.from({ length: 12 }).map((_, index) => (
                  <Skeleton
                    // eslint-disable-next-line react/no-array-index-key
                    key={`category-tag-skeleton-${index}`}
                    width={index === 0 ? '37px' : '33px'}
                    height="24px"
                    disableAspectRatio
                    isRound
                  />
                ))}
              </List>
            </Wrapper>
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
                minHeight: 36
              }}
            >
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                  // eslint-disable-next-line react/no-array-index-key
                  key={`products-id-filter-skeleton-${index}`}
                  width="73px"
                  height="20px"
                  disableAspectRatio
                  customStyle={{
                    backgroundColor: common.ui95
                  }}
                />
              ))}
            </List>
            <List>
              {Array.from({ length: 12 }).map((_, index) => (
                <Skeleton
                  // eslint-disable-next-line react/no-array-index-key
                  key={`products-filter-skeleton-${index}`}
                  width="68px"
                  height="36px"
                  isRound
                  disableAspectRatio
                  customStyle={{
                    backgroundColor: common.ui95
                  }}
                />
              ))}
            </List>
          </Box>
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

const Wrapper = styled.div`
  width: 100%;
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
`;

const List = styled.div`
  height: 100%;
  padding: 8px 16px 0;
  display: flex;
  align-items: center;
  column-gap: 8px;
  width: fit-content;
`;

export default CategoryProducts;
