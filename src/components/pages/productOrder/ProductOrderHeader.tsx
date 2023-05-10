import { useRouter } from 'next/router';
import { Box, Icon, Typography } from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';

function ProductOrderHeader() {
  const router = useRouter();

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
        안전하게 결제하기
      </Typography>
    </Header>
  );
}

export default ProductOrderHeader;
