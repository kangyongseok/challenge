const GoogleAnalytics = {
  paveView(url: string) {
    window.gtag('config', process.env.GOOGLE_ANALYTICS_TRACKING_ID, {
      page_path: url
    });
  }
};

export default GoogleAnalytics;
