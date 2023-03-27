import type { PropsWithChildren, ReactElement } from 'react';
import { useEffect } from 'react';

import { useRouter } from 'next/router';

import LocalStorage from '@library/localStorage';

import { postToken } from '@api/nextJs';

import { ACCESS_TOKEN } from '@constants/localStorage';

function SessionProvider({ children }: PropsWithChildren) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = async (url: string) => {
      const accessToken = LocalStorage.get<string>(ACCESS_TOKEN);

      if (!accessToken || url === '/logout') return;

      await postToken(accessToken);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router.events]);

  useEffect(() => {
    const accessToken = LocalStorage.get<string>(ACCESS_TOKEN);

    if (!accessToken) return;

    postToken(accessToken).then();
  }, []);

  return children as ReactElement;
}

export default SessionProvider;
