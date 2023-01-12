import { useEffect } from 'react';
import type { PropsWithChildren, ReactElement } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';

import { getPathNameByAsPath } from '@utils/common';

import { userShopUpdatedProfileDataState } from '@recoil/userShop';
import { productsFilterProgressDoneState } from '@recoil/productsFilter';
import { legitProfileUpdatedProfileDataState } from '@recoil/legitProfile';
import { dialogState, historyState, isGoBackState } from '@recoil/common';

const serverSideRenderPages = [
  '/products/categories/[keyword]',
  '/products/brands/[keyword]',
  '/products/search/[keyword]',
  '/products/[id]'
];

function HistoryProvider({ children }: PropsWithChildren) {
  const router = useRouter();

  const [history, setHistoryState] = useRecoilState(historyState);
  const [isGoBack, setIsGoBack] = useRecoilState(isGoBackState);
  const [legitProfileUpdatedProfileData, setLegitProfileUpdatedProfileDataState] = useRecoilState(
    legitProfileUpdatedProfileDataState
  );
  const [userShopUpdatedProfileData, setUserShopUpdatedProfileDataState] = useRecoilState(
    userShopUpdatedProfileDataState
  );
  const setProductsFilterProgressDoneState = useSetRecoilState(productsFilterProgressDoneState);
  const setDialogState = useSetRecoilState(dialogState);

  useEffect(() => {
    router.beforePopState(({ url }) => {
      setIsGoBack(true);

      if (url.indexOf('/products') > -1) {
        setProductsFilterProgressDoneState(true);
      }

      if (serverSideRenderPages.includes(history.pathNames[history.index - 1] || '')) {
        document.cookie = 'isGoBack=true;path=/';
      }

      if (router.pathname === '/user/shop/edit' && userShopUpdatedProfileData) {
        setDialogState({
          type: 'leaveEditProfile',
          secondButtonAction() {
            setUserShopUpdatedProfileDataState(false);
            router.back();
          },
          customStyleTitle: { minWidth: 270 }
        });

        return false;
      }

      if (router.pathname === '/legit/profile/[id]/edit' && legitProfileUpdatedProfileData) {
        setDialogState({
          type: 'leaveEditProfile',
          secondButtonAction() {
            setLegitProfileUpdatedProfileDataState(false);
            router.back();
          },
          customStyleTitle: { minWidth: 270 }
        });

        return false;
      }

      return true;
    });
  }, [
    setIsGoBack,
    setProductsFilterProgressDoneState,
    router,
    history,
    setDialogState,
    legitProfileUpdatedProfileData,
    setLegitProfileUpdatedProfileDataState,
    userShopUpdatedProfileData,
    setUserShopUpdatedProfileDataState
  ]);

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      const pathname = getPathNameByAsPath(url);

      if (isGoBack) {
        setHistoryState({
          index: history.index - 1,
          pathNames: history.pathNames.filter((_, index) => index < history.pathNames.length - 1),
          asPaths: history.asPaths.filter((_, index) => index < history.asPaths.length - 1)
        });
      } else {
        setHistoryState({
          index: history.index + 1,
          pathNames: [...history.pathNames, pathname],
          asPaths: [...history.asPaths, url]
        });
      }
    };

    const handleRouteChangeComplete = () => {
      if (isGoBack) {
        setIsGoBack(false);
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [setHistoryState, setIsGoBack, router, history, isGoBack]);

  return children as ReactElement;
}

export default HistoryProvider;
