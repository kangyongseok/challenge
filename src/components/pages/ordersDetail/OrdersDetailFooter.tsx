import { useRouter } from 'next/router';
import { Box, Button } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import SessionStorage from '@library/sessionStorage';

import sessionStorageKeys from '@constants/sessionStorageKeys';

function OrdersDetailFooter() {
  const router = useRouter();
  const { paymentComplete } = router.query;

  const { zIndex } = useTheme();

  const handleClick = () => {
    const lastPageUrl = SessionStorage.get(sessionStorageKeys.lastPageUrl);

    if (lastPageUrl) {
      router.replace(lastPageUrl);
    } else {
      router.back();
    }
  };

  if (!paymentComplete) return null;

  return (
    <Box
      customStyle={{
        minHeight: 92
      }}
    >
      <Box
        customStyle={{
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '100%',
          padding: 20,
          zIndex: zIndex.header
        }}
      >
        <Button variant="solid" brandColor="black" size="xlarge" fullWidth onClick={handleClick}>
          이전화면으로 돌아가기
        </Button>
      </Box>
    </Box>
  );
}

export default OrdersDetailFooter;
