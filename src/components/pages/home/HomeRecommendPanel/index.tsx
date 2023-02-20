import { useEffect } from 'react';

import { Gap } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import HomePopularCamelProductList from './HomePopularCamelProductList';
import HomePersonalGuide from './HomePersonalGuide';
import HomeNewCamelProductGrid from './HomeNewCamelProductGrid';
import HomeMainBanner from './HomeMainBanner';
import HomeDogHoneyProductGrid from './HomeDogHoneyProductGrid';
import HomeAuthCamelProductGrid from './HomeAuthCamelProductGrid';

function HomeRecommendPanel() {
  useEffect(() => {
    logEvent(attrKeys.home.VIEW_MAIN, {
      att: 'RECOMM'
    });
  }, []);

  return (
    <>
      <HomePersonalGuide />
      <HomeMainBanner />
      <HomePopularCamelProductList />
      <Gap height={8} />
      <HomeNewCamelProductGrid />
      <Gap height={8} />
      <HomeDogHoneyProductGrid />
      <Gap height={8} />
      <HomeAuthCamelProductGrid />
    </>
  );
}

export default HomeRecommendPanel;
