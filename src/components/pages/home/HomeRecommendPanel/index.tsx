import { useEffect } from 'react';

import { Box, useTheme } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import HomeStyleRecommendProductList from './HomeStyleRecommendProductList';
import HomeRecommendProductList from './HomeRecommendProductList';
import HomeQuickSaleProducts from './HomeQuickSaleProducts';
import HomePersonalGuideProductList from './HomePersonalGuideProductList';
import HomePersonalGuide from './HomePersonalGuide';
import HomeMainBanner from './HomeMainBanner';
import HomeLegitAuthenticProductList from './HomeLegitAuthenticProductList';
import HomeAuthSellerProducts from './HomeAuthSellerProducts';

function HomeRecommendPanel() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  useEffect(() => {
    logEvent(attrKeys.home.VIEW_MAIN, {
      att: 'RECOMM'
    });
  }, []);

  return (
    <>
      <HomeMainBanner />
      <HomePersonalGuide />
      <Box
        customStyle={{
          width: '100%',
          borderBottom: `1px solid ${common.line01}`,
          margin: '20px 0 32px'
        }}
      />
      <HomePersonalGuideProductList />
      <HomeLegitAuthenticProductList />
      <HomeAuthSellerProducts />
      <HomeQuickSaleProducts />
      <HomeRecommendProductList />
      {/* 정품 가품 판단 컴포넌트 자리 */}
      <HomeStyleRecommendProductList />
    </>
  );
}

export default HomeRecommendPanel;
