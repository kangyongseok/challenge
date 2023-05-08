import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  override render() {
    return (
      <Html lang="ko" prefix="og: https://ogp.me/ns#">
        <Head>
          <meta
            name="google-site-verification"
            content="7prKl76G0FB_U38s9lbBEiQDRbi6JnhgZYMJKnGw_hE"
          />
          <meta name="facebook-domain-verification" content="wldrbh2d5e7wpicfcndrlgz2sf8tmu" />
          <link rel="preconnect" href="https://connect.facebook.net" />
          <link rel="preconnect" href="https://cdn.channel.io" />
          <link rel="preconnect" href="https://www.googletagmanager.com" />
        </Head>
        <body>
          {process.env.GOOGLE_TAG_MANAGER_ID && (
            <noscript
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: `<iframe
                  src="https://www.googletagmanager.com/ns.html?id=${process.env.GOOGLE_TAG_MANAGER_ID}"
                  height="0"
                  width="0"
                  style="display:none;visibility:hidden"
                />`
              }}
            />
          )}
          <div id="not-support" style={{ display: 'none' }}>
            <h2>지원하지 않는 브라우저입니다. 브라우저를 업데이트 해주세요.</h2>
            <a href="http://outdatedbrowser.com/ko" target="_blank" rel="noreferrer">
              브라우저 업데이트 하기
            </a>
          </div>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
