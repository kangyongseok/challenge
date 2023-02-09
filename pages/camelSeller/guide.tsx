import { useEffect } from 'react';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  CamelSellerGuideCheckList,
  CamelSellerGuideExample,
  CamelSellerGuideHeader
} from '@components/pages/camelSellerGuide';

import LocalStorage from '@library/localStorage';

import { CHECKED_PRODUCT_PHOTO_UPLOAD_GUIDE } from '@constants/localStorage';

function CamelSellerGuide() {
  useEffect(() => {
    LocalStorage.set(CHECKED_PRODUCT_PHOTO_UPLOAD_GUIDE, true);
  }, []);

  return (
    <GeneralTemplate header={<CamelSellerGuideHeader />} disablePadding hideAppDownloadBanner>
      <CamelSellerGuideCheckList />
      <CamelSellerGuideExample />
    </GeneralTemplate>
  );
}

export default CamelSellerGuide;
