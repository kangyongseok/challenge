import { useEffect } from 'react';

import Script from 'next/script';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  SettingsAccountCertificationBanner,
  SettingsAccountCertificationDialog,
  SettingsAccountConfirmDialog,
  SettingsAccountForm,
  SettingsAccountHeader,
  SettingsAccountSelectBankBottomSheet
} from '@components/pages/settingsAccount';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

function SettingAccount() {
  useEffect(() => {
    logEvent(attrKeys.mypage.VIEW_ACCOUNT_MANAGE);
  }, []);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://cdn.iamport.kr/v1/iamport.js"
        onLoad={() => window.IMP.init(process.env.IMP_CODE)}
      />
      <GeneralTemplate header={<SettingsAccountHeader />} disablePadding>
        <SettingsAccountCertificationBanner />
        <SettingsAccountForm />
      </GeneralTemplate>
      <SettingsAccountCertificationDialog />
      <SettingsAccountSelectBankBottomSheet />
      <SettingsAccountConfirmDialog />
    </>
  );
}

export default SettingAccount;
