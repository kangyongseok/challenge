import { useEffect } from 'react';
import type { PropsWithChildren, ReactElement } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';

import { SAVED_LEGIT_REQUEST } from '@constants/localStorage';

import { getPathNameByAsPath } from '@utils/common';

import { userShopUpdatedProfileDataState } from '@recoil/userShop';
import { productsFilterProgressDoneState } from '@recoil/productsFilter';
import { legitRequestState, productLegitParamsState } from '@recoil/legitRequest';
import { legitProfileUpdatedProfileDataState } from '@recoil/legitProfile';
import { eventContentDogHoneyFilterState } from '@recoil/eventFilter';
import { dialogState, historyState, isGoBackState, toastState } from '@recoil/common';
import useQueryUserData from '@hooks/useQueryUserData';

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
  const legitRequest = useRecoilValue(legitRequestState);
  const productLegitParams = useRecoilValue(productLegitParamsState);
  const setProductsFilterProgressDoneState = useSetRecoilState(productsFilterProgressDoneState);
  const setDialogState = useSetRecoilState(dialogState);
  const setToastState = useSetRecoilState(toastState);
  const resetEventContentDogHoneyFilterState = useResetRecoilState(eventContentDogHoneyFilterState);

  const { set: setUserDate } = useQueryUserData();

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

      if (router.pathname === '/events/dogHoney') {
        resetEventContentDogHoneyFilterState();
      }

      if (router.query.step === 'form' && !!legitRequest.productId) {
        setDialogState({
          type: 'leaveLegitRequest',
          theme: 'dark',
          secondButtonAction() {
            router
              .push(`/product/${legitRequest.productId}`, undefined, { shallow: true })
              .then(() => {
                setUserDate({
                  [SAVED_LEGIT_REQUEST]: {
                    state: legitRequest,
                    params: productLegitParams,
                    showToast: !router.query.already
                  }
                });
              });
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
    setUserShopUpdatedProfileDataState,
    legitRequest,
    setUserDate,
    productLegitParams,
    setToastState,
    resetEventContentDogHoneyFilterState
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
