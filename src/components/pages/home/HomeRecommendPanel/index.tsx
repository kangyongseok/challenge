import { useEffect } from 'react';

import { Box } from '@mrcamelhub/camel-ui';

import { Gap } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import HomePersonalGuideProductList from './HomePersonalGuideProductList';
import HomePersonalGuide from './HomePersonalGuide';
import HomeNewCamelProductGrid from './HomeNewCamelProductGrid';
import HomeMainBanner from './HomeMainBanner';
import HomeDogHoneyProductGrid from './HomeDogHoneyProductGrid';

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
      <Box
        customStyle={{
          width: '100%',
          height: 32
        }}
      />
      <HomePersonalGuideProductList />
      <Box
        customStyle={{
          width: '100%',
          height: 32
        }}
      />
      <Gap height={8} />
      <HomeNewCamelProductGrid />
      <Gap height={8} />
      <HomeDogHoneyProductGrid />
    </>
  );
}

export default HomeRecommendPanel;
