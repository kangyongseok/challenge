import { useCallback, useEffect } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Dialog, Flexbox, Typography } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import {
  searchHelperPopupStateFamily,
  searchParamsState,
  selectedSearchOptionsState
} from '@recoil/searchHelper';

const TITLE = {
  continue: '아직 끝내지 않은 검색집사가 있어요.<br/>이어 하시겠어요?',
  break: '지금 검색집사를 끝내시면<br/>처음부터 검색해야 해요. 종료할까요?'
};

const BREAK_BUTTON = {
  continue: '아니오',
  break: '종료할래요'
};

interface SearchHelperPopupProps {
  type?: 'continue' | 'break';
}

function SearchHelperPopup({ type = 'continue' }: SearchHelperPopupProps) {
  const router = useRouter();
  const [isOpen, setSearchHelperPopup] = useRecoilState(searchHelperPopupStateFamily(type));
  const selectedSearchOptions = useRecoilValue(selectedSearchOptionsState);
  const resetSearchParams = useResetRecoilState(searchParamsState);
  const resetSelectedSearchOptions = useResetRecoilState(selectedSearchOptionsState);

  const handleClose = useCallback(() => {
    setSearchHelperPopup(false);
    router.push(router.pathname);
  }, [router, setSearchHelperPopup]);

  const handleClickContinue = useCallback(() => {
    setSearchHelperPopup(false);

    if (type === 'continue') {
      logEvent(attrKeys.searchHelper.CLICK_SEARCHHELPER_POPUP, {
        title: 'RESTART',
        name: 'MAIN',
        att: 'YES'
      });

      if (
        selectedSearchOptions?.lines?.length ||
        selectedSearchOptions?.maxPrice ||
        selectedSearchOptions?.platforms?.length ||
        selectedSearchOptions?.colors?.length ||
        selectedSearchOptions?.seasons?.length ||
        selectedSearchOptions?.materials?.length
      ) {
        router.push('/searchHelper/lineBudgetMore', undefined, { shallow: true });
      } else {
        router.push('/searchHelper/brandCategorySize', undefined, { shallow: true });
      }
    }

    if (type === 'break') {
      if (router.pathname === '/searchHelper/brandCategorySize') {
        logEvent(attrKeys.searchHelper.CLICK_SEARCHHELPER_POPUP, {
          name: 'STEP1',
          title: 'EXIT',
          att: 'NO'
        });
      }

      if (router.pathname === '/searchHelper/lineBudgetMore') {
        logEvent(attrKeys.searchHelper.CLICK_SEARCHHELPER_POPUP, {
          name: 'STEP2',
          title: 'EXIT',
          att: 'NO'
        });
      }

      router.push(router.pathname);
    }
  }, [
    router,
    selectedSearchOptions?.colors?.length,
    selectedSearchOptions?.lines?.length,
    selectedSearchOptions?.materials?.length,
    selectedSearchOptions?.maxPrice,
    selectedSearchOptions?.platforms?.length,
    selectedSearchOptions?.seasons?.length,
    setSearchHelperPopup,
    type
  ]);

  const handleClickBreak = useCallback(() => {
    setSearchHelperPopup(false);
    resetSearchParams();
    resetSelectedSearchOptions();

    if (type === 'continue') {
      logEvent(attrKeys.searchHelper.CLICK_SEARCHHELPER_POPUP, {
        title: 'RESTART',
        name: 'MAIN',
        att: 'NO'
      });

      router.replace('/search');
    }

    if (type === 'break') {
      if (router.pathname === '/searchHelper/brandCategorySize') {
        logEvent(attrKeys.searchHelper.CLICK_SEARCHHELPER_POPUP, {
          name: 'STEP1',
          title: 'EXIT',
          att: 'YES'
        });
      }

      if (router.pathname === '/searchHelper/lineBudgetMore') {
        logEvent(attrKeys.searchHelper.CLICK_SEARCHHELPER_POPUP, {
          name: 'STEP2',
          title: 'EXIT',
          att: 'YES'
        });
      }

      if (router.pathname === '/searchHelper/onboarding') {
        if (selectedSearchOptions.brand.id > 0 || selectedSearchOptions.parentCategory.id > 0) {
          router.replace('/');
          return;
        }

        router.replace('/search');
      } else {
        router.replace(selectedSearchOptions.pathname);
      }
    }
  }, [
    resetSearchParams,
    resetSelectedSearchOptions,
    router,
    selectedSearchOptions.brand.id,
    selectedSearchOptions.parentCategory.id,
    selectedSearchOptions.pathname,
    setSearchHelperPopup,
    type
  ]);

  useEffect(() => {
    if (isOpen) {
      if (type === 'continue') {
        logEvent(attrKeys.searchHelper.VIEW_SEARCHHELPER_POPUP, { title: 'RESTART', name: 'MAIN' });
      }

      if (type === 'break') {
        if (router.pathname === '/searchHelper/brandCategorySize') {
          logEvent(attrKeys.searchHelper.VIEW_SEARCHHELPER_POPUP, { title: 'EXIT', name: 'STEP1' });
        }

        if (router.pathname === '/searchHelper/lineBudgetMore') {
          logEvent(attrKeys.searchHelper.VIEW_SEARCHHELPER_POPUP, { title: 'EXIT', name: 'STEP2' });
        }
      }
    }
  }, [isOpen, router.pathname, type]);

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <Typography
        variant="body1"
        weight="medium"
        customStyle={{ marginBottom: 20, textAlign: 'center' }}
        dangerouslySetInnerHTML={{ __html: TITLE[type] }}
      />
      <Flexbox gap={7}>
        <Button
          variant="ghost"
          brandColor="black"
          size="medium"
          customStyle={{ width: 128 }}
          onClick={handleClickBreak}
        >
          {BREAK_BUTTON[type]}
        </Button>
        <Button
          variant="solid"
          brandColor="primary"
          size="medium"
          customStyle={{ width: 128 }}
          onClick={handleClickContinue}
        >
          이어서 할래요
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default SearchHelperPopup;
