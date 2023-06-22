import { Box, Flexbox, Grid, Skeleton, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { LinearProgress, NewProductGridCardSkeleton } from '@components/UI/molecules';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';

function BrandProducts() {
  return (
    <GeneralTemplate
      header={
        <div>
          <Flexbox
            gap={8}
            justifyContent="space-between"
            alignment="center"
            customStyle={{
              minHeight: 56,
              padding: '0 16px'
            }}
          >
            <Skeleton
              width={24}
              height={24}
              round={8}
              disableAspectRatio
              customStyle={{
                marginRight: 40
              }}
            />
            <Skeleton width={45} height={24} round={8} disableAspectRatio />
            <Flexbox gap={16} alignment="center">
              <Skeleton width={24} height={24} round={8} disableAspectRatio />
              <Skeleton width={24} height={24} round={8} disableAspectRatio />
            </Flexbox>
          </Flexbox>
          <Box component="section" customStyle={{ position: 'relative' }}>
            <Wrapper>
              <List
                css={{
                  minHeight: 38,
                  padding: '0 20px',
                  gap: 20
                }}
              >
                {Array.from({ length: 12 }).map((_, index) => (
                  <Skeleton
                    // eslint-disable-next-line react/no-array-index-key
                    key={`category-tag-skeleton-${index}`}
                    width={index === 0 ? 37 : 33}
                    height={24}
                    round={8}
                    disableAspectRatio
                  />
                ))}
              </List>
            </Wrapper>
          </Box>
          <Gap height={8} />
          <Box>
            <Flexbox
              justifyContent="space-between"
              customStyle={{
                padding: '12px 20px'
              }}
            >
              <Flexbox
                gap={8}
                customStyle={{
                  minHeight: 36
                }}
              >
                <Flexbox alignment="center" gap={4}>
                  <Skeleton width={20} height={20} round="50%" disableAspectRatio />
                  <Skeleton width={50} height={20} round={8} disableAspectRatio />
                </Flexbox>
                <Flexbox alignment="center" gap={4}>
                  <Skeleton width={20} height={20} round="50%" disableAspectRatio />
                  <Skeleton width={50} height={20} round={8} disableAspectRatio />
                </Flexbox>
                <Flexbox alignment="center" gap={4}>
                  <Skeleton width={20} height={20} round="50%" disableAspectRatio />
                  <Skeleton width={50} height={20} round={8} disableAspectRatio />
                </Flexbox>
              </Flexbox>
              <Skeleton width={59} height={32} round={8} disableAspectRatio />
            </Flexbox>
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
      <Flexbox
        justifyContent="space-between"
        alignment="center"
        customStyle={{
          position: 'relative',
          padding: '12px 20px',
          minHeight: 53
        }}
      >
        <LinearProgress value={0} customStyle={{ position: 'absolute', top: 0, left: 0 }} />
        <Typography variant="body2" weight="medium">
          매물 검색 중...
        </Typography>
      </Flexbox>
      <Grid container rowGap={20}>
        {Array.from({ length: 10 }, (_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Grid key={`product-card-skeleton-${index}`} item xs={2}>
            <NewProductGridCardSkeleton />
          </Grid>
        ))}
      </Grid>
    </GeneralTemplate>
  );
}

const Wrapper = styled.div`
  width: 100%;
  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
`;

const List = styled.div`
  height: 100%;
  padding: 0 20px 12px;
  display: flex;
  align-items: center;
  column-gap: 8px;
  width: fit-content;
`;

export default BrandProducts;
