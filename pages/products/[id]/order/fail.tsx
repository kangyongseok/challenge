import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { Box, Button, Typography } from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

function ProductOrderFail() {
  const router = useRouter();
  const { id, code, message } = router.query;

  useEffect(() => {
    logEvent(attrKeys.productOrder.VIEW_ORDER_PAYMENT_FAIL, {
      code,
      message
    });
  }, [code, message]);

  useEffect(() => {
    router.beforePopState(() => {
      return false;
    });
  }, [router]);

  return (
    <GeneralTemplate
      header={
        <Header
          showRight={false}
          hideTitle
          hideLine={false}
          onClickLeft={() => router.replace(`/products/${id}`)}
        />
      }
      hideAppDownloadBanner
      customStyle={{
        '& > main': {
          alignItems: 'center'
        }
      }}
    >
      <Box
        customStyle={{
          width: 52,
          height: 52,
          marginTop: 84,
          fontSize: 52,
          lineHeight: 1
        }}
      >
        😵
      </Box>
      <Typography
        variant="h3"
        weight="bold"
        customStyle={{
          marginTop: 20
        }}
      >
        결제 실패
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8,
          textAlign: 'center'
        }}
      >
        {message}
      </Typography>
      <Button
        variant="ghost"
        size="large"
        brandColor="black"
        onClick={() => router.replace(`/products/${id}`)}
        customStyle={{
          marginTop: 20
        }}
      >
        돌아가기
      </Button>
    </GeneralTemplate>
  );
}

export default ProductOrderFail;
