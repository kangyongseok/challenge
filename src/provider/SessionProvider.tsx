import type { PropsWithChildren, ReactElement } from 'react';
import { useEffect } from 'react';

import { useRouter } from 'next/router';

import type { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';

import { postToken } from '@api/nextJs';

import { ACCESS_TOKEN, ACCESS_USER } from '@constants/localStorage';

function SessionProvider({ children }: PropsWithChildren) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = async (url: string) => {
      const accessUser = LocalStorage.get<Partial<AccessUser>>(ACCESS_USER) || {};
      const accessToken = LocalStorage.get<string>(ACCESS_TOKEN);

      if (!accessToken || !accessUser || url === '/logout') return;

      await postToken(accessToken, accessUser);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router.events]);

  useEffect(() => {
    const accessUser = LocalStorage.get<Partial<AccessUser>>(ACCESS_USER) || {};
    const accessToken = LocalStorage.get<string>(ACCESS_TOKEN);

    if (!accessToken || !accessUser) return;

    postToken(accessToken, accessUser).then();
  }, []);

  return children as ReactElement;
}

export default SessionProvider;
