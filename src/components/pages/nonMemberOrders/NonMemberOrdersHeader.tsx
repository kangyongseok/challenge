import { useRouter } from 'next/router';
import { Box, Icon, Typography } from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';

function NonMemberOrdersHeader() {
  const router = useRouter();

  return (
    <Header
      showRight={false}
      leftIcon={
        <Box
          onClick={() => router.back()}
          customStyle={{
            padding: 16
          }}
        >
          <Icon name="Arrow1BackOutlined" />
        </Box>
      }
    >
      <Typography variant="h3" weight="bold">
        비회원 주문조회
      </Typography>
    </Header>
  );
}

export default NonMemberOrdersHeader;
