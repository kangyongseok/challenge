import { useEffect, useMemo, useRef, useState } from 'react';

import { RecoilRoot } from 'recoil';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import type { AppProps } from 'next/app';
import { Toast, useTheme } from 'mrcamel-ui';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Hydrate, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SearchHelperPopup } from '@components/UI/organisms/Popups';
import { ErrorBoundary, PageSkeleton } from '@components/UI/organisms';

import Initializer from '@library/initializer';
import Amplitude, { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { PortalProvider } from '@provider/PortalProvider';
import {
  ABTestProvider,
  ChannelTalkProvider,
  FacebookPixelProvider,
  GoogleAnalyticsProvider,
  HistoryProvider,
  SendbirdProvider,
  ThemeModeProvider
} from '@provider';

import '@styles/base.css';
import '@styles/subsetFont.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/effect-cards';
import 'react-swipeable-list/dist/styles.css';

const DialogProvider = dynamic(() => import('@provider/DialogProvider'), {
  loading: () => <div>Loading...</div>
});
const ToastProvider = dynamic(() => import('@provider/ToastProvider'), {
  loading: () => <div>Loading...</div>
});
const LoginBottomSheet = dynamic(() => import('@components/UI/organisms/LoginBottomSheet'), {
  loading: () => <div>Loading...</div>
});
const LegitResultSurveyTypeform = dynamic(
  () => import('@components/UI/organisms/LegitResultSurveyTypeform'),
  {
    loading: () => <div>Loading...</div>
  }
);
const CamelSellerSavePopup = dynamic(
  () => import('@components/UI/organisms/Popups/CamelSellerSavePopup'),
  {
    loading: () => <div>Loading...</div>
  }
);
const CamelSellerAppUpdateDialog = dynamic(
  () => import('@components/UI/organisms/CamelSellerAppUpdateDialog'),
  {
    loading: () => <div>Loading...</div>
  }
);

if (global.navigator) {
  Amplitude.init();
}

const originUrl = 'https://mrcamel.co.kr';

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
    // 해당 페이지 내에서 렌더링하기 위함
    if (router.pathname === '/products/[id]') return '';

    const asPath = router.asPath === '/' ? '' : router.asPath.split('?')[0];
    return decodeURI(`${originUrl}${asPath}`).replace(/ /g, '-');
  }, [router.asPath, router.pathname]);

  const themeColor = useMemo(() => {
    if (router.asPath.split('?')[0] === '/') return common.cmn80;

    if (['myPortfolio', 'crazycuration'].includes(router.pathname.split('/')[1])) {
      return common.uiBlack;
    }

    return common.uiWhite;
  }, [router.asPath, router.pathname, common.cmn80, common.uiWhite, common.uiBlack]);

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

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content={`minimum-scale=1, maximum-scale=1, initial-scale=1, width=device-width, user-scalable=0, ${
            isExtendedLayoutIOSVersion() ? 'viewport-fit=cover' : ''
          }`}
        />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta httpEquiv="content-language" content="ko" />
        <meta
          name="description"
          content="여러분은 카멜에서 검색만 하세요. 전국 중고명품 매물은 카멜이 다 모아서 비교하고 분석해드릴게요!"
        />
        <meta name="theme-color" content={themeColor} />
        <title>전국 중고명품 통합검색은 카멜에서</title>
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      </Head>
      <ChannelTalkProvider />
      <FacebookPixelProvider />
      <GoogleAnalyticsProvider />
      <QueryClientProvider client={queryClient.current}>
        <Hydrate state={pageProps.dehydratedState}>
          <RecoilRoot>
            <ThemeModeProvider>
              <ErrorBoundary>
                <HistoryProvider>
                  <PageSkeleton />
                  <ABTestProvider identifier={pageProps.abTestIdentifier}>
                    <SendbirdProvider>
                      <PortalProvider>
                        <Component {...pageProps} />
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
