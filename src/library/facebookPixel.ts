const FacebookPixel = {
  pageView() {
    if (window.fbq) window.fbq('track', 'PageView');
  }
};

export default FacebookPixel;
