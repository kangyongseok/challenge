import { useEffect, useRef } from 'react';

import { RecoilRoot } from 'recoil';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import type { AppProps } from 'next/app';
import dayjs from 'dayjs';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@mrcamelhub/camel-ui-toast';
import { DialogProvider } from '@mrcamelhub/camel-ui-dialog';

import { ErrorBoundary, PageSkeleton } from '@components/UI/organisms';

import UserTraceRecord from '@library/userTraceRecord';
import LocalStorage from '@library/localStorage';
import Initializer from '@library/initializer';
import Amplitude, { logEvent } from '@library/amplitude';

import { UTM_PARAMS } from '@constants/localStorage';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import type { UtmParams } from '@typings/common';
import {
  ABTestProvider,
  AuthProvider,
  ChannelTalkProvider,
  FacebookPixelProvider,
  GoogleAnalyticsProvider,
  GoogleTagManagerProvider,
  HistoryProvider,
  PortalProvider,
  SendbirdProvider,
  SessionProvider,
  ThemeModeProvider
} from '@provider';

import '@styles/base.css';
import '@styles/subFont.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/effect-cards';
import 'react-swipeable-list/dist/styles.css';

const CommonEventBannerBottomSheet = dynamic(
  () => import('@components/UI/organisms/CommonEventBannerBottomSheet')
);
const LoginBottomSheet = dynamic(() => import('@components/UI/organisms/LoginBottomSheet'));
const LegitResultSurveyTypeform = dynamic(
  () => import('@components/UI/organisms/LegitResultSurveyTypeform')
);
const CamelSellerSavePopup = dynamic(
  () => import('@components/UI/organisms/Popups/CamelSellerSavePopup')
);
const CamelSellerAppUpdateDialog = dynamic(
  () => import('@components/UI/organisms/CamelSellerAppUpdateDialog')
);

if (global.navigator) {
  Amplitude.init();
}

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const queryClient = useRef(
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnMount: false,
          refetchOnReconnect: false,
          refetchOnWindowFocus: false,
          retry: 1
        }
      }
    })
  );

  useEffect(() => {
    window.getLogEvent = (event: { eventName: string; eventParams: object }) => {
      logEvent(event.eventName, event.eventParams);
    };
    Initializer.initAccessUserInQueryClient(queryClient.current);
    Initializer.initAccessUserInBraze();
    Initializer.initUtmParams();
    Initializer.initRum();
  }, []);

  useEffect(() => {
    const { utmSource, utmCampaign } = LocalStorage.get<UtmParams>(UTM_PARAMS) || {};

    logEvent(attrKeys.commonEvent.VIEW_ALL, {
      origin: window.location.origin,
      path: window.location.pathname,
      params: window.location.search || undefined,
      utmSource,
      utmCampaign
    });
  }, [router]);

  useEffect(() => {
    if (!UserTraceRecord.getFirstVisitDate()) {
      UserTraceRecord.setFirstVisitDate(dayjs().format('YYYY-MM-DD'));
    }
  }, []);

  useEffect(() => {
    if (UserTraceRecord.getLastVisitDate()) {
      UserTraceRecord.setLastVisitDateDiffDay(
        dayjs().diff(dayjs(UserTraceRecord.getLastVisitDate()), 'days')
      );
    }
    UserTraceRecord.setLastVisitDate(dayjs().format('YYYY-MM-DD'));
  }, []);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content={`minimum-scale=1, maximum-scale=1, initial-scale=1, width=device-width, user-scalable=0${
            isExtendedLayoutIOSVersion() ? ', viewport-fit=cover' : ''
          }`}
        />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta httpEquiv="content-language" content="ko" />
        <meta
          name="description"
          content="여러분은 카멜에서 검색만 하세요. 전국 중고명품 매물은 카멜이 다 모아서 비교하고 분석해드릴게요!"
        />
        <meta name="application-name" content="카멜" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="카멜" />
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href={`https://${process.env.IMAGE_DOMAIN}/assets/favicon/apple-icon-57x57.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href={`https://${process.env.IMAGE_DOMAIN}/assets/favicon/apple-icon-60x60.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href={`https://${process.env.IMAGE_DOMAIN}/assets/favicon/apple-icon-72x72.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href={`https://${process.env.IMAGE_DOMAIN}/assets/favicon/apple-icon-76x76.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href={`https://${process.env.IMAGE_DOMAIN}/assets/favicon/apple-icon-114x114.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href={`https://${process.env.IMAGE_DOMAIN}/assets/favicon/apple-icon-120x120.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href={`https://${process.env.IMAGE_DOMAIN}/assets/favicon/apple-icon-144x144.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href={`https://${process.env.IMAGE_DOMAIN}/assets/favicon/apple-icon-152x152.png`}
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`https://${process.env.IMAGE_DOMAIN}/assets/favicon/apple-icon-180x180.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href={`https://${process.env.IMAGE_DOMAIN}/assets/favicon/android-icon-192x192.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`https://${process.env.IMAGE_DOMAIN}/assets/favicon/favicon-32x32.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href={`https://${process.env.IMAGE_DOMAIN}/assets/favicon/favicon-96x96.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={`https://${process.env.IMAGE_DOMAIN}/assets/favicon/favicon-16x16.png`}
        />
        <link
          rel="manifest"
          href={`https://${process.env.IMAGE_DOMAIN}/assets/favicon/manifest.json`}
        />
        <meta
          name="msapplication-TileImage"
          content={`https://${process.env.IMAGE_DOMAIN}/assets/favicon/ms-icon-144x144.png`}
        />
        <link
          rel="shortcut icon"
          href={`https://${process.env.IMAGE_DOMAIN}/assets/favicon/favicon.ico`}
        />
        <title>전국 중고명품 통합검색은 카멜에서</title>
      </Head>
      <ChannelTalkProvider />
      <FacebookPixelProvider />
      <GoogleAnalyticsProvider />
      <GoogleTagManagerProvider />
      <QueryClientProvider client={queryClient.current}>
        <Hydrate state={pageProps.dehydratedState}>
          <RecoilRoot>
            <ThemeModeProvider>
              <ErrorBoundary>
                <HistoryProvider>
                  <PageSkeleton />
                  <ABTestProvider identifier={pageProps.abTestIdentifier}>
                    <PortalProvider>
                      <SessionProvider>
                        <AuthProvider accessUser={pageProps.accessUser}>
                          <SendbirdProvider>
                            <ToastProvider>
                              <DialogProvider>
                                <CamelSellerSavePopup />
                                <CamelSellerAppUpdateDialog />
                                <CommonEventBannerBottomSheet />
                                <Component {...pageProps} />
                              </DialogProvider>
                            </ToastProvider>
                          </SendbirdProvider>
                        </AuthProvider>
                      </SessionProvider>
                    </PortalProvider>
                  </ABTestProvider>
                  <LegitResultSurveyTypeform />
                  {router.pathname !== '/login' && <LoginBottomSheet />}
                </HistoryProvider>
              </ErrorBoundary>
            </ThemeModeProvider>
          </RecoilRoot>
        </Hydrate>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  );
}

export default App;
