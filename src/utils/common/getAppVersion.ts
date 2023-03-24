export function getAppVersion() {
  if (!window || !window.navigator || !window.navigator.userAgent) return '';

  const matchUserAgent = window.navigator.userAgent.match(
    /MrcamelApp\([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\.?[0-9]+\)/
  );

  if (!matchUserAgent) return '';

  const appVersion = matchUserAgent[0].replace(/[^0-9.]/g, '');

  // const lastIndex = appVersion.lastIndexOf('.');

  // return Number(appVersion.slice(0, lastIndex).replace(/\./g, ''));
  return Number(appVersion.split('.').slice(0, 3).join(''));
}
