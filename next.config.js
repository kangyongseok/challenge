module.exports = {
  swcMinify: true,
  reactStrictMode: process.env.NODE_ENV === 'development',
  poweredByHeader: process.env.NODE_ENV === 'development',
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    AMPLITUDE_API_KEY: process.env.AMPLITUDE_API_KEY,
    KAKAO_JS_KEY: process.env.KAKAO_JS_KEY,
    KAKAO_REST_API_KEY: process.env.KAKAO_REST_API_KEY,
    KAKAO_LOGIN_REDIRECT_URL: process.env.KAKAO_LOGIN_REDIRECT_URL,
    IMAGE_DOMAIN: process.env.IMAGE_DOMAIN
  },
  images: {
    domains: [process.env.IMAGE_DOMAIN]
  },
  async redirects() {
    return [
      {
        source: '/product/:id',
        destination: '/products/:id',
        permanent: true
      }
    ];
  }
};
