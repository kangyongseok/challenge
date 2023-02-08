import { useEffect, useRef } from 'react';

import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { Alert, Box, ThemeProvider, Typography, dark, useTheme } from 'mrcamel-ui';
import { QueryClient, dehydrate } from '@tanstack/react-query';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  LegitResultBottomCtaButton,
  LegitResultCommentList,
  LegitResultCommentWriter,
  LegitResultContactBanner,
  LegitResultDetailAlert,
  LegitResultHeader,
  LegitResultIntro,
  LegitResultLoginBottomSheet,
  LegitResultOpinionList,
  LegitResultPageHead,
  LegitResultRequestInfo,
  LegitResultTimer
} from '@components/pages/legitResult';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

function LegitResult({ status }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const {
    theme: {
      mode,
      palette: { common }
    }
  } = useTheme();

  const writerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 20) {
      document.body.className = 'legit-dark';
    }

    return () => {
      if (status === 20) {
        document.body.removeAttribute('class');
      }
    };
  }, [mode, status]);

  if (status === 20) {
    return (
      <>
        <LegitResultPageHead />
        <ThemeProvider theme="dark">
          <GeneralTemplate
            header={<LegitResultHeader />}
            footer={<LegitResultBottomCtaButton />}
            customStyle={{
              height: 'auto',
              minHeight: '100%',
              backgroundColor: dark.palette.common.bg03
            }}
          >
            <LegitResultIntro />
            <LegitResultTimer />
            <LegitResultRequestInfo />
            <LegitResultDetailAlert />
            <LegitResultOpinionList />
            <Box
              customStyle={{
                margin: '52px -20px 32px',
                border: `1px dashed ${dark.palette.common.line01}`
              }}
            />
            <LegitResultCommentWriter writerRef={writerRef} />
            <LegitResultCommentList writerRef={writerRef} />
            <Alert round="8" customStyle={{ margin: '84px 0 20px', padding: '8px 16px' }}>
              <Typography variant="small1" customStyle={{ color: common.ui60 }}>
                사진 상 정품 혹은 가품 의견을 여러 전문가로부터 받는 서비스로, 법적 효력이 있지는
                않으며 단순 참고용으로 사용하시기 바랍니다.
              </Typography>
            </Alert>
          </GeneralTemplate>
          <LegitResultContactBanner />
          <LegitResultLoginBottomSheet />
        </ThemeProvider>
      </>
    );
  }

  return (
    <>
      <LegitResultPageHead />
      <GeneralTemplate
        header={<LegitResultHeader />}
        footer={<LegitResultBottomCtaButton />}
        customStyle={{ height: 'auto', minHeight: '100%' }}
      >
        <LegitResultRequestInfo />
        <LegitResultDetailAlert />
        <LegitResultOpinionList />
        <Box customStyle={{ margin: '52px -20px 32px', border: `1px dashed ${common.line01}` }} />
        <LegitResultCommentWriter writerRef={writerRef} />
        <LegitResultCommentList writerRef={writerRef} />
        <Alert round="8" customStyle={{ margin: '84px 0 20px', padding: '8px 16px' }}>
          <Typography variant="small1" customStyle={{ color: common.ui60 }}>
            사진 상 정품 혹은 가품 의견을 여러 전문가로부터 받는 서비스로, 법적 효력이 있지는 않으며
            단순 참고용으로 사용하시기 바랍니다.
          </Typography>
        </Alert>
      </GeneralTemplate>
      <LegitResultContactBanner />
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

    const data = await queryClient.fetchQuery(queryKeys.productLegits.legit(productId), () =>
      fetchProductLegit(productId)
    );

    if (data.status !== 20 && data.status !== 30) {
      return {
        redirect: {
          destination: encodeURI(`/legit/${id}`),
          permanent: false
        }
      };
    }

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        status: data.status
      }
    };
  } catch {
    return {
      notFound: true
    };
  }
}

export default LegitResult;
