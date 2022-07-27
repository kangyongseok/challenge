import { useEffect } from 'react';

import Script from 'next/script';
import { useRouter } from 'next/router';

import GoogleAnalytics from '@library/googleAnalytics';

function GoogleAnalyticsProvider() {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeComplete = (url: string) => {
      GoogleAnalytics.paveView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('hashChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('hashChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.GOOGLE_ANALYTICS_TRACKING_ID}', {
              page_path: window.location.pathname
            });
          `
        }}
      />
    </>
  );
}

export default GoogleAnalyticsProvider;
