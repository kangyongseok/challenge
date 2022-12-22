import { useEffect } from 'react';

import { useResetRecoilState } from 'recoil';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  CamelSellerHeader,
  CamelSellerProductSearch,
  CamelSellerSmsDialog
} from '@components/pages/camelSeller';

import LocalStorage from '@library/localStorage';
import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import { SOURCE } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { camelSellerSMSDialogState } from '@recoil/camelSeller';

function CamelSeller() {
  const resetSMSDialog = useResetRecoilState(camelSellerSMSDialogState);

  useEffect(() => {
    const getLocalstorage = LocalStorage.get(SOURCE);
    logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MODEL, {
      name: attrProperty.name.PRODUCT_MODEL,
      source: getLocalstorage || ''
    });

    // resetEditState();
    ChannelTalk.hideChannelButton();
    return () => {
      resetSMSDialog();
      LocalStorage.remove(SOURCE);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GeneralTemplate subset header={<CamelSellerHeader />} hideAppDownloadBanner>
      <CamelSellerProductSearch />
      <CamelSellerSmsDialog />
    </GeneralTemplate>
  );
}

export default CamelSeller;
