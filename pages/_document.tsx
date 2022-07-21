/* eslint-disable @next/next/no-img-element */
import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  override render() {
    return (
      <Html lang="ko">
        <Head>
          <meta charSet="utf-8" />
          <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="application-name" content="Mr Camel" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black" />
          <meta name="apple-mobile-web-app-title" content="Mr Camel" />
          <meta
            name="google-site-verification"
            content="7prKl76G0FB_U38s9lbBEiQDRbi6JnhgZYMJKnGw_hE"
          />
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
          <meta name="msapplication-TileColor" content="#1833FF" />
          <meta
            name="msapplication-TileImage"
            content={`https://${process.env.IMAGE_DOMAIN}/assets/favicon/ms-icon-144x144.png`}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${process.env.FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1`}
              alt="facebook-pixel"
            />
          </noscript>
          <meta name="facebook-domain-verification" content="wldrbh2d5e7wpicfcndrlgz2sf8tmu" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
