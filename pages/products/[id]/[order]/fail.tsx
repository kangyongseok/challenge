import { useRouter } from 'next/router';
import { Box, Button, Typography } from 'mrcamel-ui';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

function ProductOrderFail() {
  const router = useRouter();
  const { message } = router.query;

  return (
    <GeneralTemplate
      header={
        <Header
          showRight={false}
          hideTitle
          hideLine={false}
          onClickLeft={() => window.history.go(-3)}
        />
      }
      hideAppDownloadBanner
      customStyle={{
        '& > div': {
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
        onClick={() => window.history.go(-3)}
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
