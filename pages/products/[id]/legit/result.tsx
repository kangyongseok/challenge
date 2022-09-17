import { useEffect } from 'react';

import { QueryClient, dehydrate } from 'react-query';
import type { DehydratedState } from 'react-query';
import type { GetServerSidePropsContext } from 'next';
import { Alert, Typography, useTheme } from 'mrcamel-ui';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  LegitResultBottomCtaButton,
  LegitResultCardHolder,
  LegitResultDetailAlert,
  LegitResultLoginBottomSheet,
  LegitResultOpinionList
} from '@components/pages/legitResult';

import ChannelTalk from '@library/channelTalk';

import { fetchProductLegit } from '@api/product';

import queryKeys from '@constants/queryKeys';

function LegitResult() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  useEffect(() => {
    ChannelTalk.moveChannelButtonPosition(-30);

    return () => {
      ChannelTalk.resetChannelButtonPosition();
    };
  }, []);

  return (
    <>
      <GeneralTemplate
        header={<Header />}
        footer={<LegitResultBottomCtaButton />}
        customStyle={{ height: 'auto', minHeight: '100%', backgroundColor: common.white }}
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

    const splitId = String(id).split('-');
    const productId = Number(splitId[splitId.length - 1] || 0);

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
