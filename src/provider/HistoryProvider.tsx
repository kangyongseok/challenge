import { useEffect } from 'react';
import type { PropsWithChildren, ReactElement } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { PAYMENTS_SUCCESS } from '@constants/localStorage';

import { getPathNameByAsPath } from '@utils/common';

import { productsFilterProgressDoneState } from '@recoil/productsFilter';
import { eventContentDogHoneyFilterState } from '@recoil/eventFilter';
import {
  exitUserNextStepState,
  exitUserViewBottomSheetState,
  historyState,
  isGoBackState
} from '@recoil/common';
import useExitSurveyBottomSheet from '@hooks/useExitSurveyBottomSheet';

const serverSideRenderPages = [
  '/products/categories/[keyword]',
  '/products/brands/[keyword]',
  '/products/search/[keyword]',
  '/products/camel',
  '/products/[id]'
];

function HistoryProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const { isUserViewPerDay, productDetailOverViewLeave, isSearchExitPattern, searchProductLeave } =
    useExitSurveyBottomSheet();
  const [history, setHistoryState] = useRecoilState(historyState);
  const [isGoBack, setIsGoBack] = useRecoilState(isGoBackState);

  const setExitBottomSheet = useSetRecoilState(exitUserViewBottomSheetState);
  const setExitUserNextStep = useSetRecoilState(exitUserNextStepState);
  const setProductsFilterProgressDoneState = useSetRecoilState(productsFilterProgressDoneState);
  const resetEventContentDogHoneyFilterState = useResetRecoilState(eventContentDogHoneyFilterState);

  useEffect(() => {
    router.beforePopState(({ url }) => {
      setIsGoBack(true);
      if (isSearchExitPattern && searchProductLeave && isUserViewPerDay() && url === '/search') {
        setExitUserNextStep((prev) => ({ ...prev, currentView: '검색' }));
        setTimeout(() => {
          setExitBottomSheet(true);
        }, 500);
      }

      if (router.pathname === '/products/[id]') {
        if (productDetailOverViewLeave && isUserViewPerDay()) {
          setExitUserNextStep((prev) => ({ ...prev, currentView: '매물상세' }));
          setTimeout(() => {
            setExitBottomSheet(true);
          }, 500);
        }
      }

      if (router.pathname === '/channels/[id]' && LocalStorage.get(PAYMENTS_SUCCESS)) {
        LocalStorage.remove(PAYMENTS_SUCCESS);
        router.replace({ pathname: '/channels', query: { type: 0 } });
      }

      if (router.pathname === '/channels/[id]' && LocalStorage.get(PAYMENTS_SUCCESS)) {
        LocalStorage.remove(PAYMENTS_SUCCESS);
        router.replace({ pathname: '/channels', query: { type: 0 } });
      }

      if (router.pathname === '/channels/[id]' && LocalStorage.get(PAYMENTS_SUCCESS)) {
        LocalStorage.remove(PAYMENTS_SUCCESS);
        router.replace({ pathname: '/channels', query: { type: 0 } });
      }

      if (router.pathname === '/channels/[id]' && LocalStorage.get(PAYMENTS_SUCCESS)) {
        LocalStorage.remove(PAYMENTS_SUCCESS);
        router.replace({ pathname: '/channels', query: { type: 0 } });
      }

      if (router.pathname === '/channels/[id]' && LocalStorage.get(PAYMENTS_SUCCESS)) {
        LocalStorage.remove(PAYMENTS_SUCCESS);
        router.replace({ pathname: '/channels', query: { type: 0 } });
      }

      if (router.pathname === '/channels/[id]' && LocalStorage.get(PAYMENTS_SUCCESS)) {
        LocalStorage.remove(PAYMENTS_SUCCESS);
        router.replace({ pathname: '/channels', query: { type: 0 } });
      }

      if (router.pathname === '/channels/[id]' && LocalStorage.get(PAYMENTS_SUCCESS)) {
        LocalStorage.remove(PAYMENTS_SUCCESS);
        router.replace({ pathname: '/channels', query: { type: 0 } });
      }

      if (url.indexOf('/products') > -1) {
        setProductsFilterProgressDoneState(true);
      }

      if (serverSideRenderPages.includes(history.pathNames[history.index - 1] || '')) {
        document.cookie = 'isGoBack=true;path=/';
      }

      if (router.pathname === '/events/dogHoney') {
        resetEventContentDogHoneyFilterState();
      }

      return true;
    });
  }, [
    history.index,
    history.pathNames,
    isSearchExitPattern,
    isUserViewPerDay,
    productDetailOverViewLeave,
    resetEventContentDogHoneyFilterState,
    router,
    searchProductLeave,
    setExitBottomSheet,
    setExitUserNextStep,
    setIsGoBack,
    setProductsFilterProgressDoneState
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
        if (history.asPaths[history.index] && history.asPaths[history.index] !== '/') {
          SessionStorage.set(sessionStorageKeys.lastPageUrl, history.asPaths[history.index]);
        }
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
