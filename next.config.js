const { i18n } = require('./next-i18next.config');

const isDevelopment = process.env.NODE_ENV === 'development';
const routers = [
  {
    source: '/productList',
    destination: '/products',
    permanent: true
  },
  {
    source: '/product/:id/:conversionId',
    destination: '/products/:id?conversionId=:conversionId',
    permanent: true
  },
  {
    source: '/product/:id*',
    destination: '/products/:id*',
    permanent: true
  },
  {
    source: '/onboarding',
    has: [
      {
        type: 'cookie',
        key: 'accessToken',
        value: undefined
      }
    ],
    permanent: false,
    destination: '/login'
  },
  {
    source: '/user/:path*',
    has: [
      {
        type: 'cookie',
        key: 'accessToken',
        value: undefined
      }
    ],
    permanent: false,
    destination: '/login'
  },
  {
    source: '/logout',
    has: [
      {
        type: 'cookie',
        key: 'accessToken',
        value: undefined
      }
    ],
    permanent: false,
    destination: '/login'
  },
  {
    source: '/legit/profile',
    destination: '/legit?tab=live',
    permanent: false
  },
  {
    source: '/legit/request/:step*',
    has: [
      {
        type: 'cookie',
        key: 'accessToken',
        value: undefined
      }
    ],
    permanent: false,
    destination: '/legit?tab=live'
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  productionBrowserSourceMaps: process.env.NEXT_DISABLE_SOURCEMAPS === 'true',
  poweredByHeader: isDevelopment,
  experimental: {
    scrollRestoration: true
  },
  compiler: {
    emotion: true,
    removeConsole: !isDevelopment
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    NEXT_JS_API_BASE_URL: process.env.NEXT_JS_API_BASE_URL,
    AMPLITUDE_API_KEY: process.env.AMPLITUDE_API_KEY,
    KAKAO_JS_KEY: process.env.KAKAO_JS_KEY,
    KAKAO_REST_API_KEY: process.env.KAKAO_REST_API_KEY,
    KAKAO_LOGIN_REDIRECT_URL: process.env.KAKAO_LOGIN_REDIRECT_URL,
    IMAGE_DOMAIN: process.env.IMAGE_DOMAIN,
    CHANNEL_TALK_PLUGIN_KEY: process.env.CHANNEL_TALK_PLUGIN_KEY,
    CHANNEL_TALK_LOGGING: process.env.CHANNEL_TALK_LOGGING,
    GOOGLE_JS_KEY: process.env.GOOGLE_JS_KEY,
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
    FACEBOOK_PIXEL_ID: process.env.FACEBOOK_PIXEL_ID,
    GOOGLE_ANALYTICS_TRACKING_ID: process.env.GOOGLE_ANALYTICS_TRACKING_ID
  },
  images: {
    domains: [process.env.IMAGE_DOMAIN, 's3.ap-northeast-2.amazonaws.com']
  },
  async redirects() {
    return isDevelopment
      ? routers
      : routers.concat([
          {
            source: '/:path*',
            has: [
              {
                type: 'header',
                key: 'User-Agent',
                value: '(.*Windows.*)'
              }
            ],
            permanent: false,
            destination: 'https://intro.mrcamel.co.kr/:path*'
          },
          {
            source: '/:path*',
            has: [
              {
                type: 'header',
                key: 'User-Agent',
                value: '(.*Macintosh.*)'
              }
            ],
            permanent: false,
            destination: 'https://intro.mrcamel.co.kr/:path*'
          }
        ]);
  },
  i18n
};

module.exports = nextConfig;
