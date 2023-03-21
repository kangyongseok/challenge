const GoogleTagManager = {
  paveView(url: string) {
    window.gtag('config', process.env.GOOGLE_TAG_MANAGER_ID, {
      page_path: url
    });
  }
};

export default GoogleTagManager;
