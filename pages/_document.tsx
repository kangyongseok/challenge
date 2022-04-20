import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            rel="preconnect"
            href="https://mrcamel.s3.ap-northeast-2.amazonaws.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://mrcamel.s3.ap-northeast-2.amazonaws.com/assets/css/SpoqaHanSansNeo.css"
            rel="stylesheet"
          />
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
