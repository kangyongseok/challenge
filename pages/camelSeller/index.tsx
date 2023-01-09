import { useEffect } from 'react';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import { CamelSellerHeader, CamelSellerProductSearch } from '@components/pages/camelSeller';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { SOURCE } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function CamelSeller() {
  useEffect(() => {
    const getLocalstorage = LocalStorage.get(SOURCE);
    logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MODEL, {
      name: attrProperty.name.PRODUCT_MODEL,
      source: getLocalstorage || ''
    });

    return () => {
      LocalStorage.remove(SOURCE);
    };
  }, []);

  return (
    <GeneralTemplate subset header={<CamelSellerHeader />} hideAppDownloadBanner>
      <CamelSellerProductSearch />
    </GeneralTemplate>
  );
}

export default CamelSeller;
