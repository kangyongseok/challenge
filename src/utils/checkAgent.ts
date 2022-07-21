const checkAgent = {
  isMobileApp: () =>
    typeof window !== 'undefined' && window.navigator.userAgent.includes('MrcamelApp'),
  isAndroidApp: () =>
    typeof window !== 'undefined' && window.navigator.userAgent.match(/MrcamelApp.+ ANDROID/),
  isIOSApp: () =>
    typeof window !== 'undefined' && window.navigator.userAgent.match(/MrcamelApp.+ iOS/),
  isMobileWeb: () =>
    typeof window !== 'undefined' &&
    (window.navigator.userAgent.indexOf('Android') >= 0 ||
      window.navigator.userAgent.indexOf('iPhone') >= 0 ||
      window.navigator.userAgent.indexOf('iPad') >= 0),
  isIOS: () =>
    typeof window !== 'undefined' &&
    (window.navigator.userAgent.indexOf('iPhone') >= 0 ||
      window.navigator.userAgent.indexOf('iPad') >= 0),
  isAndroid: () =>
    typeof window !== 'undefined' && window.navigator.userAgent.indexOf('Android') >= 0
};

export default checkAgent;
