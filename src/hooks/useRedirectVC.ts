import { useEffect, useMemo } from 'react';

import { useRouter } from 'next/router';

import SessionStorage from '@library/sessionStorage';

import sessionStorageKeys from '@constants/sessionStorageKeys';

function useRedirectVC(pathname: string) {
  const router = useRouter();

  const redirectChannelUrl = useMemo(
    () => String(router.query.redirectChannelUrl || ''),
    [router.query.redirectChannelUrl]
  );

  // channel VC에서 Main VC로 왔을 때 redirectUrl 처리
  useEffect(() => {
    if (SessionStorage.get(sessionStorageKeys.pushToSavedRedirectChannel) && !!redirectChannelUrl) {
      window.webkit?.messageHandlers?.callChannel?.postMessage?.(redirectChannelUrl);
      SessionStorage.remove(sessionStorageKeys.pushToSavedRedirectChannel);
    }
  }, [redirectChannelUrl]);

  useEffect(() => {
    window.getRedirect = (parsedUrl: { pathname: string; redirectChannelUrl: string }) => {
      if (parsedUrl?.pathname && parsedUrl?.redirectChannelUrl) {
        router
          .replace({
            pathname,
            query: { redirectChannelUrl: parsedUrl.redirectChannelUrl }
          })
          .then(() => {
            router.push(parsedUrl.pathname, undefined, { shallow: true }).then(() => {
              SessionStorage.set(sessionStorageKeys.pushToSavedRedirectChannel, true);
            });
          });
      }
    };
  }, [pathname, router]);
}

export default useRedirectVC;
