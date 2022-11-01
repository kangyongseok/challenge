import { useEffect } from 'react';

import { Flexbox, useTheme } from 'mrcamel-ui';

import { Gap } from '@components/UI/atoms';
import LegitRecommendBottomSheet from '@components/pages/legit/LegitLivePanel/LegitRecommendBottomSheet';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import LegitYourTurnList from './LegitYourTurnList';
import LegitTargetBrandList from './LegitTargetBrandList';
import LegitHeadAuthenticatorList from './LegitHeadAuthenticatorList';
import LegitFilterGrid from './LegitFilterGrid';
import LegitDashboardBanner from './LegitDashboardBanner';
import LegitCaseHistory from './LegitCaseHistory';

function LegitLivePanel() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  useEffect(() => {
    logEvent(attrKeys.legit.VIEW_LEGIT_MAIN);
  }, []);

  return (
    <>
      <Flexbox
        direction="vertical"
        gap={52}
        customStyle={{ margin: '12px 0 84px', userSelect: 'none' }}
      >
        <LegitDashboardBanner />
        <LegitTargetBrandList />
        <LegitHeadAuthenticatorList />
        <LegitYourTurnList />
        <LegitCaseHistory />
        <Gap height={1} customStyle={{ margin: '-20px 0', backgroundColor: common.line01 }} />
        <LegitFilterGrid />
      </Flexbox>
      <LegitRecommendBottomSheet />
    </>
  );
}

export default LegitLivePanel;
