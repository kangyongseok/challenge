const isDevelopment = process.env.NODE_ENV === 'development';
const routers = [
  {
    source: '/productList',
    destination: '/products',
    permanent: true
  },
  {
    source: '/privacy',
    destination: '/terms/privacy',
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
    source: '/legit/profile',
    destination: '/legit?tab=live',
    permanent: false
  },
  {
    source: '/en/:path*',
    destination: '/:path*',
    permanent: true
  },
  {
    source: '/ko/:path*',
    destination: '/:path*',
    permanent: true
  },
  {
    source: '/en-US/:path*',
    destination: '/:path*',
    permanent: true
  },
  {
    source: '/ko-KR/:path*',
    destination: '/:path*',
    permanent: true
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
    GOOGLE_ANALYTICS_TRACKING_ID: process.env.GOOGLE_ANALYTICS_TRACKING_ID,
    DATADOG_RUM_APP_ID: process.env.DATADOG_RUM_APP_ID,
    DATADOG_RUM_CLIENT_TOKEN: process.env.DATADOG_RUM_CLIENT_TOKEN,
    RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED:
      process.env.RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED,
    DATADOG_RUM_ENV: process.env.DATADOG_RUM_ENV,
    DATADOG_RUM_SERVICE: process.env.DATADOG_RUM_SERVICE,
    DATADOG_ALLOWED_TRACING_ORIGIN: process.env.DATADOG_ALLOWED_TRACING_ORIGIN,
    SENDBIRD_APP_ID: process.env.SENDBIRD_APP_ID,
    SOCKET_SERVER_URL: process.env.SOCKET_SERVER_URL
  },
  images: {
    domains: [
      process.env.IMAGE_DOMAIN,
      's3.ap-northeast-2.amazonaws.com',
      'mrcamel-dev.s3.ap-northeast-2.amazonaws.com',
      'k.kakaocdn.net'
    ]
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
  }
};

module.exports = nextConfig;
