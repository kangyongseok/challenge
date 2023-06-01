import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, Flexbox, Grid, Skeleton, Typography } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import { fetchPopularSearchKeywords } from '@api/common';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function PopularKeywordRank() {
  const router = useRouter();

  const { data: { divide, keywords = [] } = {}, isLoading } = useQuery(
    queryKeys.commons.popularSearchKeywords(),
    fetchPopularSearchKeywords
  );

  const handleClick = (keyword: string) => () => {
    logEvent(attrKeys.search.CLICK_POPULAR, {
      name: attrProperty.name.SEARCH_MODAL,
      keyword
    });

    router.push(`/products/search/${keyword}`);
  };

  return (
    <Box
      component="section"
      customStyle={{
        padding: '32px 20px'
      }}
    >
      <Flexbox alignment="baseline" gap={8}>
        {isLoading ? (
          <>
            <Skeleton width={80} height={24} round={8} disableAspectRatio />
            <Skeleton width={45} height={16} round={8} disableAspectRatio />
          </>
        ) : (
          <>
            <Typography variant="h3" weight="bold">
              인기 검색어
            </Typography>
            {divide !== '전체 기준' && (
              <Typography variant="body2" color="ui60">
                {divide}
              </Typography>
            )}
          </>
        )}
      </Flexbox>
      <Grid
        container
        customStyle={{
          marginTop: 20
        }}
      >
        {isLoading &&
          Array.from({ length: 10 })
            .map((_, index) => index)
            .map((index) => (
              <Grid key={`search-popular-keyword-skeleton-${index}`} item xs={2}>
                <Flexbox
                  alignment="center"
                  gap={12}
                  customStyle={{
                    minHeight: 44
                  }}
                >
                  <Skeleton width={20} height={20} round={8} disableAspectRatio />
                  <Skeleton width={40} height={20} round={8} disableAspectRatio />
                </Flexbox>
              </Grid>
            ))}
        {!isLoading &&
          keywords.map((keyword, index) => (
            <Grid key={`search-popular-keyword-${keyword}`} item xs={2}>
              <Button
                fullWidth
                variant="inline"
                brandColor="black"
                size="large"
                startIcon={
                  <Typography
                    variant="h4"
                    weight="bold"
                    textAlign="center"
                    customStyle={{
                      minWidth: 20
                    }}
                  >
                    {index + 1}
                  </Typography>
                }
                disablePadding
                onClick={handleClick(keyword)}
                customStyle={{
                  height: 44,
                  justifyContent: 'flex-start',
                  gap: 12,
                  fontWeight: 400
                }}
              >
                {keyword}
              </Button>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
}

export default PopularKeywordRank;
