import { useEffect, useMemo, useRef, useState } from 'react';

import { RecoilRoot } from 'recoil';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Hydrate, QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { useRouter } from 'next/router';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { ThemeProvider, Toast, Typography, useTheme } from 'mrcamel-ui';

import { SearchHelperPopup } from '@components/UI/organisms/Popups';
import {
  ErrorBoundary,
  LegitResultSurveyTypeform,
  ProductsKeywordAutoSavedToast
} from '@components/UI/organisms';

import Initializer from '@library/initializer';
import Amplitude, { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import { PortalProvider } from '@provider/PortalProvider';
import GoogleAnalyticsProvider from '@provider/GoogleAnalyticsProvider';
import FacebookPixelProvider from '@provider/FacebookPixelProvider';
import ChannelTalkProvider from '@provider/ChannelTalkProvider';

import '@styles/base.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/effect-cards';

if (global.navigator) {
  Amplitude.init();
}

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const {
    theme: { palette }
  } = useTheme();
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
  const themeColor = useMemo(() => {
    if (router.asPath === '/') return '#0D0D0D';

    if (router.asPath.includes('/myPortfolio')) return palette.common.black;

    if (router.asPath === '/legit') return palette.common.grey['95'];

    return palette.common.white;
  }, [palette, router.asPath]);

  useEffect(() => {
    Initializer.initAccessUserInQueryClient(queryClient.current);
    Initializer.initAccessUserInBraze();
    Initializer.initUtmParams();
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
        <meta name="theme-color" content={themeColor} />
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
                <LegitResultSurveyTypeform />
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
