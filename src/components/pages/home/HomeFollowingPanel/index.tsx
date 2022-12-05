import { useEffect } from 'react';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import HomeRecommendWishes from './HomeRecommendWishes';
import HomeProductKeywordList from './HomeProductKeywordList';
import HomePersonalCuration from './HomePersonalCuration';

function HomeFollowingPanel() {
  useEffect(() => {
    logEvent(attrKeys.home.VIEW_MAIN, {
      att: 'FOLLOWING'
    });
  }, []);

  return (
    <>
      <HomeProductKeywordList />
      <HomeRecommendWishes />
      <HomePersonalCuration />
    </>
  );
}

export default HomeFollowingPanel;
