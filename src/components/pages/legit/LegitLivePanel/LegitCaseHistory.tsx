import { Flexbox, Skeleton, ThemeProvider, Typography, dark, useTheme } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { LegitGridCard } from '@components/UI/molecules';

import { fetchLegit } from '@api/dashboard';

import queryKeys from '@constants/queryKeys';

function LegitCaseHistory() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { isLoading, data: { caseHistories = [] } = {} } = useQuery(
    queryKeys.dashboards.legit(),
    () => fetchLegit()
  );

  return (
    <Flexbox component="section" direction="vertical" gap={32} customStyle={{ width: '100%' }}>
      <Flexbox direction="vertical" alignment="center" gap={4}>
        <Typography variant="h3" weight="bold">
          Case History
        </Typography>
        <Typography variant="body2" customStyle={{ color: common.ui60 }}>
          실시간 사진감정결과를 확인해보세요
        </Typography>
      </Flexbox>
      <ThemeProvider theme="dark">
        <CardList>
          <Flexbox gap={12} customStyle={{ width: 'fit-content', padding: '20px' }}>
            {isLoading
              ? Array.from({ length: 5 }, (_, index) => (
                  <Flexbox
                    key={`case-history-skeleton-${index}`}
                    direction="vertical"
                    gap={12}
                    customStyle={{ paddingBottom: 12 }}
                  >
                    <Skeleton width={120} height={144} round={8} disableAspectRatio />
                    <Flexbox direction="vertical" gap={8}>
                      <Flexbox direction="vertical" gap={2}>
                        <Skeleton width={60} height={16} round={8} disableAspectRatio />
                        <Skeleton width="100%" height={32} round={8} disableAspectRatio />
                      </Flexbox>
                      <Flexbox gap={12}>
                        <Skeleton width={20} height={12} round={8} disableAspectRatio />
                        <Skeleton width={20} height={12} round={8} disableAspectRatio />
                        <Skeleton width={20} height={12} round={8} disableAspectRatio />
                      </Flexbox>
                    </Flexbox>
                  </Flexbox>
                ))
              : caseHistories
                  .slice(0, 5)
                  .map(({ productResult, productId }, index) => (
                    <LegitGridCard
                      key={`case-history-${productId}`}
                      product={productResult}
                      rank={index + 1}
                      variant="swipeX"
                      hideMetaInfo={false}
                      customStyle={{ minWidth: 144 }}
                      customTitleStyle={{ color: common.uiWhite }}
                    />
                  ))}
          </Flexbox>
        </CardList>
      </ThemeProvider>
    </Flexbox>
  );
}

const CardList = styled.div`
  overflow-x: auto;
  width: 100%;
  background-color: ${dark.palette.common.bg02};
`;

export default LegitCaseHistory;
