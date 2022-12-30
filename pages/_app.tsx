import { useEffect, useMemo, useRef, useState } from 'react';

import { RecoilRoot } from 'recoil';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Hydrate, QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { useRouter } from 'next/router';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { Toast, useTheme } from 'mrcamel-ui';

import { SearchHelperPopup } from '@components/UI/organisms/Popups';
import {
  CamelSellerSavePopup,
  ErrorBoundary,
  LegitResultSurveyTypeform,
  LoginBottomSheet,
  PageSkeleton
} from '@components/UI/organisms';

import Initializer from '@library/initializer';
import Amplitude, { logEvent } from '@library/amplitude';

import { locales } from '@constants/common';
import attrKeys from '@constants/attrKeys';
import abTestTaskNameKeys from '@constants/abTestTaskNameKeys';

import localeData from 'public/locales';
import { i18n } from 'next-i18next.config';
import { PortalProvider } from '@provider/PortalProvider';
import { ABTestCookie } from '@provider/ABTestProvider';
import {
  ABTestProvider,
  ChannelTalkProvider,
  DialogProvider,
  FacebookPixelProvider,
  GoogleAnalyticsProvider,
  HistoryProvider,
  SendbirdProvider,
  ThemeModeProvider,
  ToastProvider
} from '@provider';

import '@styles/base.css';
import '@styles/subsetFont.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/effect-cards';
import 'react-swipeable-list/dist/styles.css';

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

  const lang: keyof typeof localeData = useMemo(
    () => pageProps?._nextI18Next?.initialLocale || locales.ko.lng,
    [pageProps?._nextI18Next?.initialLocale]
  );
  const canonicalUrl = useMemo(() => {
    // 해당 페이지 내에서 렌더링하기 위함
    if (router.pathname === '/products/[id]') return '';

    const asPath = router.asPath === '/' ? '' : router.asPath.split('?')[0];
    return decodeURI(`${originUrl}${lang === locales.ko.lng ? '' : `/${lang}`}${asPath}`).replace(
      / /g,
      '-'
    );
  }, [lang, router.asPath, router.pathname]);
  const alternativeLink = useMemo(
    () =>
      Object.entries(locales).map(([_, { lng }]) => (
        <link
          key={lng}
          rel="alternate"
          hrefLang={lng}
          href={decodeURI(
            `${originUrl}${lng === locales.ko.lng ? '' : `/${lng}`}${
              router.asPath === '/' ? '' : router.asPath
            }`
          ).replace(/ /g, '-')}
        />
      )),
    [router.asPath]
  );
  const themeColor = useMemo(() => {
    if (router.asPath.split('?')[0] === '/') return common.cmn80;

    if (router.asPath.split('?')[0] === '/legit' || router.asPath.split('?')[0] === '/legit/search')
      return common.bg03;

    if (['myPortfolio', 'crazycuration'].includes(router.pathname.split('/')[1])) {
      return common.uiBlack;
    }

    return common.uiWhite;
  }, [router.asPath, router.pathname, common.cmn80, common.bg03, common.uiWhite, common.uiBlack]);

  useEffect(() => {
    window.getLogEvent = (event: { eventName: string; eventParams: object }) => {
      logEvent(event.eventName, event.eventParams);
    };
    ABTestCookie({ name: abTestTaskNameKeys.WELCOME3_2211, cookieName: 'useAi' });
    Initializer.initAccessUserInQueryClient(queryClient.current);
    Initializer.initAccessUserInBraze();
    Initializer.initUtmParams();
    Initializer.initRum();

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta httpEquiv="content-language" content={lang} />
        <meta name="description" content={localeData[lang].meta.description} />
        <meta name="theme-color" content={themeColor} />
        <title>{localeData[lang].meta.title}</title>
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        {alternativeLink}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={decodeURI(`${originUrl}${router.asPath === '/' ? '' : router.asPath}`).replace(
            / /g,
            '-'
          )}
        />
      </Head>
      <ChannelTalkProvider />
      <FacebookPixelProvider />
      <GoogleAnalyticsProvider />
      <QueryClientProvider client={queryClient.current}>
        <RecoilRoot>
          <ThemeModeProvider>
            <Hydrate state={pageProps.dehydratedState}>
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
                  {router.pathname !== '/login' && <LoginBottomSheet />}
                </HistoryProvider>
              </ErrorBoundary>
            </Hydrate>
          </ThemeModeProvider>
        </RecoilRoot>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  );
}

export default appWithTranslation(App, { i18n, reloadOnPrerender: false });
