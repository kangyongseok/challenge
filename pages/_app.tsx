import React, { useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';

import { Hydrate, QueryClientProvider, QueryClient, QueryCache } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { ThemeProvider, GlobalReset, Toast, Box, Typography } from 'mrcamel-ui';

import '@styles/base.css';

function App({ Component, pageProps }: AppProps) {
  const [open, setOpen] = useState<boolean>(false);
  const queryClient = useRef(
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnMount: false,
          refetchOnReconnect: false,
          refetchOnWindowFocus: false,
          retry: 1
        }
      },
      queryCache: new QueryCache({
        onError: () => setOpen(true)
      })
    })
  );

  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <meta httpEquiv="content-language" content="ko" />
        <meta
          name="description"
          content="대한민국 모든 중고명품, 한번에 검색&비교하고 득템하세요. 상태 좋고 가격도 저렴한 중고명품을 빠르게 찾도록 도와드릴게요!"
        />
        <title>명품을 중고로 사는 가장 똑똑한 방법, 카멜</title>
      </Head>
      <QueryClientProvider client={queryClient.current}>
        <ThemeProvider theme="light">
          <GlobalReset />
          <Hydrate state={pageProps.dehydratedState}>
            <Component {...pageProps} />
          </Hydrate>
          <Toast open={open} bottom="74px" onClose={handleClose}>
            <Box
              customStyle={{
                padding: '16px 24px',
                textAlign: 'center'
              }}
            >
              <Typography customColor="white">
                서버에서 오류가 발생했어요
                <br />
                잠시 후 다시 시도해 주세요
              </Typography>
            </Box>
          </Toast>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  );
}

export default App;
