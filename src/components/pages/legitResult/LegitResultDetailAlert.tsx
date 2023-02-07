import { useRouter } from 'next/router';
import { Alert, Typography, useTheme } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

function LegitResultDetailAlert() {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: { result = 0, status } = {} } = useQuery(
    queryKeys.productLegits.legit(productId),
    () => fetchProductLegit(productId),
    {
      enabled: !!id
    }
  );

  if (status !== 30 || result === 1 || result === 2) return null;

  return (
    <Alert round="8" customStyle={{ marginTop: 20, padding: 16 }}>
      <Typography>
        주어진 사진만으로는 확답을 내릴 수 없다고 판단되어,&nbsp;
        <strong>실물로 더욱 상세한 감정을 추천</strong>드립니다.
      </Typography>
      <Typography variant="small2" customStyle={{ marginTop: 4, color: common.ui60 }}>
        실물감정 가능한 곳: 한국동산감정원, 한국명품감정원, 라올스 등
      </Typography>
    </Alert>
  );
}

export default LegitResultDetailAlert;
