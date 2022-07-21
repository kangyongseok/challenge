import { useEffect, useRef, useState } from 'react';

import { RecoilRoot } from 'recoil';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Hydrate, QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { useRouter } from 'next/router';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { ThemeProvider, Toast, Typography } from 'mrcamel-ui';

import { SearchHelperPopup } from '@components/UI/organisms/Popups';
import { ErrorBoundary, ProductsKeywordAutoSavedToast } from '@components/UI/organisms';

import Initializer from '@library/initializer';
import Amplitude, { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import { PortalProvider } from '@utils/PortalProvider';
import GoogleAnalyticsProvider from '@utils/GoogleAnalyticsProvider';
import FacebookPixelProvider from '@utils/FacebookPixelProvider';
import ChannelTalkProvider from '@utils/ChannelTalkProvider';

import '@styles/base.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

if (global.navigator) {
  Amplitude.init();
}

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
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

  useEffect(() => {
    Initializer.initAccessUserInQueryClient(queryClient.current);
  }, []);

  useEffect(() => {
    logEvent(attrKeys.commonEvent.VIEW_ALL, {
      origin: window.location.origin,
      path: window.location.pathname,
      params: window.location.search
    });
  }, [router]);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="minimum-scale=1, maximum-scale=1, initial-scale=1, width=device-width, user-scalable=0"
        />
        <meta httpEquiv="content-language" content="ko" />
        <meta
          name="description"
          content="대한민국 모든 중고명품, 한번에 검색&비교하고 득템하세요. 상태 좋고 가격도 저렴한 중고명품을 빠르게 찾도록 도와드릴게요!"
        />
        <title>명품을 중고로 사는 가장 똑똑한 방법, 카멜</title>
      </Head>
      <ChannelTalkProvider />
      <FacebookPixelProvider />
      <GoogleAnalyticsProvider />
      <QueryClientProvider client={queryClient.current}>
        <ThemeProvider theme="light">
          <RecoilRoot>
            <Hydrate state={pageProps.dehydratedState}>
              <PortalProvider>
                <ErrorBoundary>
                  <Component {...pageProps} />
                </ErrorBoundary>
                <SearchHelperPopup type="break" />
                <ProductsKeywordAutoSavedToast />
              </PortalProvider>
            </Hydrate>
          </RecoilRoot>
          <Toast open={open} bottom="74px" onClose={() => setOpen(false)}>
            <Typography customStyle={{ color: 'white' }}>
              서버에서 오류가 발생했어요
              <br />
              잠시 후 다시 시도해 주세요
            </Typography>
          </Toast>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  );
}

export default App;
