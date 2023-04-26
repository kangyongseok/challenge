import { useEffect, useMemo, useRef, useState } from 'react';

import { RecoilRoot } from 'recoil';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import type { AppProps } from 'next/app';
import { Toast } from 'mrcamel-ui';
import dayjs from 'dayjs';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Hydrate, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SearchHelperPopup } from '@components/UI/organisms/Popups';
import { ErrorBoundary, PageSkeleton } from '@components/UI/organisms';

import UserTraceRecord from '@library/userTraceRecord';
import Initializer from '@library/initializer';
import Amplitude, { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { PortalProvider } from '@provider/PortalProvider';
import {
  ABTestProvider,
  AuthProvider,
  ChannelTalkProvider,
  FacebookPixelProvider,
  GoogleAnalyticsProvider,
  GoogleTagManagerProvider,
  HistoryProvider,
  SendbirdProvider,
  SessionProvider,
  ThemeModeProvider
} from '@provider';

import '@styles/base.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/effect-cards';
import 'react-swipeable-list/dist/styles.css';

const DialogProvider = dynamic(() => import('@provider/DialogProvider'));
const ToastProvider = dynamic(() => import('@provider/ToastProvider'));
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
// const HomeInterfereKingBottomSheet = dynamic(
//   () => import('@components/pages/home/HomeInterfereKingBottomSheet')
// );
// const InterfereKingResult = dynamic(() => import('@components/UI/molecules/InterfereKingResult'));

if (global.navigator) {
  Amplitude.init();
}

const originUrl = 'https://mrcamel.co.kr';

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

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
    // 해당 페이지 내에서 렌더링하기 위함
    if (router.pathname === '/products/[id]') return '';

    const asPath = router.asPath === '/' ? '' : router.asPath.split('?')[0];
    return decodeURI(`${originUrl}${asPath}`).replace(/ /g, '-');
  }, [router.asPath, router.pathname]);

  useEffect(() => {
    window.getLogEvent = (event: { eventName: string; eventParams: object }) => {
      logEvent(event.eventName, event.eventParams);
    };
    Initializer.initAccessUserInQueryClient(queryClient.current);
    Initializer.initAccessUserInBraze();
    Initializer.initUtmParams();
    Initializer.initRum();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    logEvent(attrKeys.commonEvent.VIEW_ALL, {
      origin: window.location.origin,
      path: window.location.pathname,
      params: window.location.search
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
        <title>전국 중고명품 통합검색은 카멜에서</title>
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      </Head>
      <ChannelTalkProvider />
      <FacebookPixelProvider />
      <GoogleAnalyticsProvider />
      {process.env.GOOGLE_TAG_MANAGER_ID && <GoogleTagManagerProvider />}
      <QueryClientProvider client={queryClient.current}>
        <Hydrate state={pageProps.dehydratedState}>
          <RecoilRoot>
            <ErrorBoundary>
              <ThemeModeProvider>
                <HistoryProvider>
                  <PageSkeleton />
                  <ABTestProvider identifier={pageProps.abTestIdentifier}>
                    <SendbirdProvider>
                      <PortalProvider>
                        <AuthProvider>
                          <SessionProvider>
                            <Component {...pageProps} />
                          </SessionProvider>
                        </AuthProvider>
                      </PortalProvider>
                    </SendbirdProvider>
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
                  <CamelSellerAppUpdateDialog />
                  {router.pathname !== '/login' && <LoginBottomSheet />}
                  {/* <HomeInterfereKingBottomSheet /> */}
                  {/* <InterfereKingResult /> */}
                </HistoryProvider>
              </ThemeModeProvider>
            </ErrorBoundary>
          </RecoilRoot>
        </Hydrate>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  );
}

export default App;
