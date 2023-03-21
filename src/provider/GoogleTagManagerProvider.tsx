import { useEffect } from 'react';

import Script from 'next/script';
import { useRouter } from 'next/router';

import GoogleTagManager from '@library/googleTagManager';

function GoogleTagManagerProvider() {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeComplete = (url: string) => {
      GoogleTagManager.paveView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('hashChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('hashChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events]);

  return (
    <Script
      id="gtag-manager"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer', '${process.env.GOOGLE_TAG_MANAGER_ID}');
          `
      }}
    />
  );
}

export default GoogleTagManagerProvider;
