import { QueryClient, dehydrate } from 'react-query';
import type { DehydratedState } from 'react-query';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { Alert, Box, CtaButton, Typography, useTheme } from 'mrcamel-ui';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  LegitResultCardHolder,
  LegitResultDetailAlert,
  LegitResultLoginBottomSheet,
  LegitResultOpinionList
} from '@components/pages/legitResult';

import { fetchProductLegit } from '@api/product';

import queryKeys from '@constants/queryKeys';

function LegitResult() {
  const router = useRouter();
  const { id } = router.query;
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <>
      <GeneralTemplate
        header={<Header />}
        footer={
          <Box customStyle={{ height: 89 }}>
            <Box
              customStyle={{
                position: 'fixed',
                bottom: 0,
                width: '100%',
                padding: 20,
                borderTop: `1px solid ${common.grey['90']}`,
                backgroundColor: common.white
              }}
            >
              <CtaButton
                fullWidth
                variant="contained"
                brandColor="black"
                size="large"
                onClick={() => router.push(`/products/${id}`)}
              >
                해당 매물로 돌아가기
              </CtaButton>
            </Box>
          </Box>
        }
      >
        <LegitResultCardHolder />
        <LegitResultDetailAlert />
        <LegitResultOpinionList />
        <Alert round="8" customStyle={{ margin: '64px 0 20px', padding: '8px 16px' }}>
          <Typography variant="small1" customStyle={{ color: common.grey['40'] }}>
            사진 상 정품 혹은 가품 의견을 여러 전문가로부터 받는 서비스로, 법적 효력이 있지는 않으며
            단순 참고용으로 사용하시기 바랍니다.
          </Typography>
        </Alert>
      </GeneralTemplate>
      <LegitResultLoginBottomSheet />
    </>
  );
}

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
  try {
    const queryClient = new QueryClient();
    const { id } = query;

    const productId = Number(id);

    const data = await queryClient.fetchQuery(queryKeys.products.productLegit({ productId }), () =>
      fetchProductLegit(productId)
    );

    if (data.status < 30) {
      return {
        redirect: {
          destination: `/products/${id}/legit`,
          permanent: false
        }
      };
    }

    queryClient.setQueryData(queryKeys.products.productLegit({ productId }), data);

    const dehydratedState: DehydratedState = dehydrate(queryClient);

    return {
      props: {
        dehydratedState
      }
    };
  } catch {
    return {
      notFound: true
    };
  }
}

export default LegitResult;