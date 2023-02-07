import { useEffect } from 'react';

import { Flexbox } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import LegitYourTurnList from './LegitYourTurnList';
import LegitTargetBrandList from './LegitTargetBrandList';
import LegitHeadAuthenticatorList from './LegitHeadAuthenticatorList';
import LegitFilterGrid from './LegitFilterGrid';
import LegitDashboardBanner from './LegitDashboardBanner';
import LegitCaseHistory from './LegitCaseHistory';
import LegitApplyBanner from './LegitApplyBanner';

function LegitLivePanel() {
  useEffect(() => {
    logEvent(attrKeys.legit.VIEW_LEGIT_MAIN);
  }, []);

  return (
    <Flexbox direction="vertical" gap={84} customStyle={{ marginBottom: 84 }}>
      <LegitDashboardBanner />
      <LegitTargetBrandList />
      <Flexbox direction="vertical" gap={32}>
        <LegitHeadAuthenticatorList />
        <LegitApplyBanner />
      </Flexbox>
      <LegitYourTurnList />
      <Flexbox direction="vertical" gap={32}>
        <LegitCaseHistory />
        <LegitFilterGrid />
      </Flexbox>
    </Flexbox>
  );
}

export default LegitLivePanel;
