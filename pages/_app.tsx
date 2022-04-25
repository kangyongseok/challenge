import React from 'react';
import Head from 'next/head';
import { ThemeProvider, GlobalReset } from 'mrcamel-ui';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { AppProps } from 'next/app';

import '@styles/base.css';

const queryClient = new QueryClient();

function App({ Component, pageProps }: AppProps) {
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
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme="light">
          <GlobalReset />
          <Component {...pageProps} />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  );
}

export default App;
