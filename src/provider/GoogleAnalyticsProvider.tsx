import { useEffect } from 'react';

import Script from 'next/script';
import { useRouter } from 'next/router';

import GoogleAnalytics from '@library/googleAnalytics';

import { isProduction } from '@utils/common';

function GoogleAnalyticsProvider() {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeComplete = (url: string) => {
      if (isProduction) GoogleAnalytics.paveView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('hashChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('hashChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events]);

  if (!isProduction) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '${process.env.GOOGLE_ANALYTICS_TRACKING_ID}');`
        }}
      />
    </>
  );
}

export default GoogleAnalyticsProvider;
