import { useQuery } from 'react-query';
import { Flexbox, Typography, useTheme } from 'mrcamel-ui';

import { fetchLegit } from '@api/dashboard';

import queryKeys from '@constants/queryKeys';

import LegitCaseHistoryCard from './LegitCaseHistoryCard';

function LegitCaseHistory() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const {
    isLoading,
    data: { caseHistories: [firstCaseHistory, secentCaseHistory, lastCaseHistory] = [] } = {}
  } = useQuery(queryKeys.dashboards.legit(), () => fetchLegit());

  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={32}
      customStyle={{ marginTop: 32, padding: '0 20px' }}
    >
      <Flexbox direction="vertical" alignment="center" gap={4}>
        <Typography variant="h3" weight="bold">
          Case History
        </Typography>
        <Typography variant="body2" customStyle={{ color: common.ui60 }}>
          실시간 사진감정결과를 확인해보세요
        </Typography>
      </Flexbox>
      <Flexbox direction="vertical" gap={20}>
        <LegitCaseHistoryCard productLegit={firstCaseHistory} isLoading={isLoading} rank={1} />
        <Flexbox gap={20}>
          <LegitCaseHistoryCard productLegit={secentCaseHistory} isLoading={isLoading} rank={2} />
          <LegitCaseHistoryCard productLegit={lastCaseHistory} isLoading={isLoading} rank={3} />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
}

export default LegitCaseHistory;
