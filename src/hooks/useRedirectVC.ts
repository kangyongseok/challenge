import { useEffect, useMemo } from 'react';

import { useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';

import SessionStorage from '@library/sessionStorage';

import sessionStorageKeys from '@constants/sessionStorageKeys';

import { channelPushPageState } from '@recoil/channel';

function useRedirectVC(pathname: string) {
  const router = useRouter();

  const resetChannelPushPageState = useResetRecoilState(channelPushPageState);

  const redirectChannelUrl = useMemo(
    () => String(router.query.redirectChannelUrl || ''),
    [router.query.redirectChannelUrl]
  );

  // Main VC에서 Channel VC로 다시 이동해야하는 경우 Channel VC 호출 로직
  useEffect(() => {
    if (SessionStorage.get(sessionStorageKeys.pushToSavedRedirectChannel) && !!redirectChannelUrl) {
      window.webkit?.messageHandlers?.callChannel?.postMessage?.(redirectChannelUrl);
      SessionStorage.remove(sessionStorageKeys.pushToSavedRedirectChannel);
    }
  }, [redirectChannelUrl, resetChannelPushPageState]);

  // Channel VC에서 user 프로필/product detail 이동을 위해 Main VC로 왔을 때 페이지 이동 처리 로직
  useEffect(() => {
    window.getRedirect = (parsedUrl: { pathname: string; redirectChannelUrl: string }) => {
      if (parsedUrl?.pathname && parsedUrl?.redirectChannelUrl) {
        router
          .replace({
            pathname,
            query: { redirectChannelUrl: parsedUrl.redirectChannelUrl }
          })
          .then(() => {
            router.push(parsedUrl.pathname).then(() => {
              SessionStorage.set(sessionStorageKeys.pushToSavedRedirectChannel, true);
              resetChannelPushPageState();
            });
          });
      }
    };
  }, [pathname, resetChannelPushPageState, router]);
}

export default useRedirectVC;
