import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import type { ProductLegit } from '@dto/productLegit';

import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';

import { deviceIdState } from '@recoil/common';

function CamelSellerInfo() {
  const router = useRouter();
  const { id: productId } = router.query;

  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  const deviceId = useRecoilValue(deviceIdState);

  const { data: { product: { productLegit = {} } = {} } = {} } = useQuery(
    queryKeys.products.sellerEditProduct({ productId: Number(productId), deviceId }),
    () => fetchProduct({ productId: Number(productId), deviceId }),
    {
      enabled: !!productId,
      refetchOnMount: 'always'
    }
  );

  const { status, result } = (productLegit as ProductLegit) || {};

  if (status === 20) {
    return (
      <Wrap alignment="center" gap={6} onClick={() => router.push('/camelSeller/guide')}>
        <Icon name="LegitFilled" size="small" customStyle={{ color: common.uiWhite }} />
        <Typography variant="body2" customStyle={{ color: common.uiWhite }}>
          감정중인 매물은 카테고리/브랜드를 변경할 수 없어요.
        </Typography>
      </Wrap>
    );
  }

  if (status === 30 && result === 1) {
    return (
      <Wrap
        alignment="flex-start"
        gap={6}
        css={{
          height: 'auto',
          padding: '12px 22px',
          backgroundColor: primary.light
        }}
      >
        <Icon name="ShieldFilled" size="small" customStyle={{ color: common.uiWhite }} />
        <Typography variant="body2" customStyle={{ color: common.uiWhite }}>
          정품인증 마크를 받았어요! 감정한 매물은 카테고리/브랜드를 변경할 수 없어요.
        </Typography>
      </Wrap>
    );
  }

  return (
    <Wrap alignment="center" gap={6} onClick={() => router.push('/camelSeller/guide')}>
      <Icon name="BangCircleFilled" size="small" customStyle={{ color: common.uiWhite }} />
      <Typography variant="body2" customStyle={{ color: common.uiWhite }}>
        사진 등록 전 <span style={{ textDecoration: 'underline' }}>사진업로드 가이드</span>를 꼭
        확인해주세요!
      </Typography>
    </Wrap>
  );
}

const Wrap = styled(Flexbox)`
  width: calc(100% + 40px);
  height: 40px;
  background: ${({ theme: { palette } }) => palette.common.ui20};
  margin-left: -20px;
  padding: 0 22px;
`;

export default CamelSellerInfo;
