import { useEffect } from 'react';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import LegitReviewList from './LegitReviewList';
import LegitParticipantsIntro from './LegitParticipantsIntro';
import LegitIntro from './LegitIntro';
import LegitContactBanner from './LegitContactBanner';
import LegitCompleteGrid from './LegitCompleteGrid';

function LegitLivePanel() {
  useEffect(() => {
    logEvent(attrKeys.legit.VIEW_LEGIT_MAIN);
  }, []);
  return (
    <>
      <LegitIntro forceRender />
      <LegitCompleteGrid />
      <LegitParticipantsIntro />
      <LegitReviewList />
      <LegitContactBanner />
    </>
  );
}

export default LegitLivePanel;
