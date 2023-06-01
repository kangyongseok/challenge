import { Gap } from '@components/UI/atoms';

import RecommendBrandList from './RecommendBrandList';
import BrandList from './BrandList';

function BrandTabPanel() {
  return (
    <>
      <RecommendBrandList />
      <Gap height={8} />
      <BrandList />
    </>
  );
}

export default BrandTabPanel;
