import { useRouter } from 'next/router';
import { Box, Icon, Typography } from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';

import useQueryProduct from '@hooks/useQueryProduct';

function ProductOrderHeader() {
  const router = useRouter();
  const { data: { product } = {} } = useQueryProduct();
  const isAllOperatorType = [5, 6, 7].includes(product?.sellerType || 0);

  return (
    <Header
      leftIcon={
        <Box
          onClick={() => router.back()}
          customStyle={{
            padding: 16
          }}
        >
          <Icon name="CloseOutlined" />
        </Box>
      }
      showRight={false}
      hideLine={false}
    >
      <Typography variant="h3" weight="bold">
        {isAllOperatorType ? '카멜 구매대행' : '안전하게 결제하기'}
      </Typography>
    </Header>
  );
}

export default ProductOrderHeader;
