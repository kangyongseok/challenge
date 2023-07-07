import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import useQueryProduct from '@hooks/useQueryProduct';

function ProductOrderPurchasingInfo() {
  const router = useRouter();
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const { data: { product } = {} } = useQueryProduct();
  const isAllOperatorType = [5, 6, 7].includes(product?.sellerType || 0);
  if (!isAllOperatorType) return null;

  return (
    <Flexbox
      alignment="center"
      justifyContent="space-between"
      gap={6}
      customStyle={{ background: common.bg02, padding: '12px 20px' }}
      onClick={() => {
        logEvent(attrKeys.productOrder.CLICK_CAMEL_GUIDE);
        router.push('/products/purchasingInfo?step=2');
      }}
    >
      <Flexbox gap={6} alignment="flex-start">
        <Icon name="BoxFilled" size="small" color="primary" />
        <Box>
          <Typography variant="body2" weight="medium">
            <span style={{ color: primary.main }}>카멜 구매대행</span>으로 쉽고 안전하게
            거래해보세요!
          </Typography>
          <Typography variant="small2" weight="medium" customStyle={{ marginTop: 2 }} color="ui60">
            {product?.site.name} 매물을 카멜이 대신 구매해 배송해드려요.
          </Typography>
        </Box>
      </Flexbox>
      <Icon name="Arrow2RightOutlined" width={16} />
    </Flexbox>
  );
}

export default ProductOrderPurchasingInfo;
