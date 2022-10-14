import { useEffect, useMemo, useRef, useState } from 'react';

import { RecoilRoot } from 'recoil';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Hydrate, QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { useRouter } from 'next/router';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { Toast, useTheme } from 'mrcamel-ui';

import { SearchHelperPopup } from '@components/UI/organisms/Popups';
import {
  AppCameraAuthorCheckDialog,
  CamelSellerSavePopup,
  ErrorBoundary,
  LegitResultSurveyTypeform
} from '@components/UI/organisms';

import Initializer from '@library/initializer';
import Amplitude, { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import { PortalProvider } from '@provider/PortalProvider';
import {
  ABTestProvider,
  ChannelTalkProvider,
  DialogProvider,
  FacebookPixelProvider,
  GoogleAnalyticsProvider,
  ThemeModeProvider,
  ToastProvider
} from '@provider';

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
    theme: {
      palette: { common }
    }
  } = useTheme();
  const [open, setOpen] = useState(false);
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
  const canonicalUrl = useMemo(() => {
    const originUrl = 'https://mrcamel.co.kr';

    // 해당 페이지 내에서 렌더링하기 위함
    if (router.pathname === '/products/[id]') return '';

    const asPath = (router.asPath === '/' ? '' : router.asPath.split('?')[0]).replace(/ /g, '-');
    return decodeURI(`${originUrl}${asPath}`);
  }, [router.asPath, router.pathname]);
  const themeColor = useMemo(() => {
    if (router.asPath.split('?')[0] === '/') return common.cmn80;

    if (['myPortfolio', 'crazycuration'].includes(router.pathname.split('/')[1])) {
      return common.uiBlack;
    }

    if (router.asPath.includes('/legit')) return common.ui95;

    return common.uiWhite;
  }, [common.uiBlack, common.uiWhite, common.ui95, common.cmn80, router.asPath, router.pathname]);

  useEffect(() => {
    window.getLogEvent = (event: { eventName: string; eventParams: object }) => {
      logEvent(event.eventName, event.eventParams);
    };

    Initializer.initAccessUserInQueryClient(queryClient.current);
    Initializer.initAccessUserInBraze();
    Initializer.initUtmParams();
  }, []);

  useEffect(() => {
    logEvent(attrKeys.commonEvent.viewAll, {
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
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      </Head>
      <ChannelTalkProvider />
      <FacebookPixelProvider />
      <GoogleAnalyticsProvider />
      <QueryClientProvider client={queryClient.current}>
        <RecoilRoot>
          <ThemeModeProvider>
            <Hydrate state={pageProps.dehydratedState}>
              <ErrorBoundary>
                <ABTestProvider identifier={pageProps.abTestIdentifier}>
                  <PortalProvider>
                    <Component {...pageProps} />
                  </PortalProvider>
                </ABTestProvider>
                <SearchHelperPopup type="break" />
                <ToastProvider />
                <DialogProvider />
                <LegitResultSurveyTypeform />
                <Toast open={open} bottom="74px" onClose={() => setOpen(false)}>
                  서버에서 오류가 발생했어요
                  <br />
                  잠시 후 다시 시도해 주세요
                </Toast>
                <CamelSellerSavePopup />
                <AppCameraAuthorCheckDialog />
              </ErrorBoundary>
            </Hydrate>
          </ThemeModeProvider>
        </RecoilRoot>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  );
}

export default App;
