import { useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Toast } from 'mrcamel-ui';

import { BottomNavigation, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import type { OrderOptionKeys } from '@components/pages/wishes/WishesFilter';
import {
  HistoryPanel,
  WishesBottomCtaButton,
  WishesPanel,
  WishesTabs
} from '@components/pages/wishes';

import type { CategoryValue } from '@dto/category';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import { deviceIdState } from '@recoil/common';

function WishesPage() {
  const router = useRouter();
  const {
    tab = 'wish',
    order = 'updatedDesc',
    hiddenTab
  }: {
    tab?: 'wish' | 'history';
    order?: OrderOptionKeys;
    hiddenTab?: 'legit';
  } = router.query;

  const deviceId = useRecoilValue(deviceIdState);

  const categoryWishesParam = useMemo(
    () => ({
      size: 200,
      sort: [order],
      isLegitProduct: hiddenTab === 'legit',
      deviceId
    }),
    [deviceId, hiddenTab, order]
  );

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [initialCategories, setInitialCategories] = useState<CategoryValue[]>([]);
  const [[showToast, toastMessage], setToast] = useState<[boolean, ReactElement | null]>([
    false,
    null
  ]);

  useEffect(() => {
    logEvent(attrKeys.wishes.VIEW_WISH_LIST);
  }, []);

  useEffect(() => {
    if (hiddenTab === 'legit') {
      logEvent(attrKeys.wishes.VIEW_WISHLEGIT);
    }
  }, [hiddenTab]);

  return (
    <>
      <GeneralTemplate
        header={
          <>
            <Header />
            <WishesTabs />
          </>
        }
        footer={hiddenTab === 'legit' ? <WishesBottomCtaButton /> : <BottomNavigation />}
      >
        {tab === 'wish' && (
          <WishesPanel
            categoryWishesParam={categoryWishesParam}
            selectedCategoryIds={selectedCategoryIds}
            setSelectedCategoryIds={setSelectedCategoryIds}
            initialCategories={initialCategories}
            setInitialCategories={setInitialCategories}
          />
        )}
        {tab === 'history' && <HistoryPanel />}
      </GeneralTemplate>
      <Toast
        open={toastMessage !== null && showToast}
        bottom="74px"
        onClose={() => setToast([false, toastMessage])}
        autoHideDuration={1000}
      >
        {toastMessage}
      </Toast>
    </>
  );
}

export default WishesPage;
