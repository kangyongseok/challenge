import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Alert, Typography, useTheme } from 'mrcamel-ui';

import { fetchProductLegit } from '@api/product';

import queryKeys from '@constants/queryKeys';

function LegitResultDetailAlert() {
  const router = useRouter();
  const { id } = router.query;

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: { result = 0 } = {} } = useQuery(
    queryKeys.products.productLegit({ productId: Number(id) }),
    () => fetchProductLegit(Number(id)),
    {
      enabled: !!id
    }
  );

  if (result === 1 || result === 2) return null;

  return (
    <Alert round="8" customStyle={{ marginTop: 20, padding: 16 }}>
      <Typography>
        주어진 사진만으로는 확답을 내릴 수 없다고 판단되어,&nbsp;
        <strong>실물로 더욱 상세한 감정을 추천</strong>드립니다.
      </Typography>
      <Typography variant="small2" customStyle={{ marginTop: 4, color: common.grey['60'] }}>
        실물감정 가능한 곳: 한국동산감정원, 한국명품감정원, 라올스 등
      </Typography>
    </Alert>
  );
}

export default LegitResultDetailAlert;
