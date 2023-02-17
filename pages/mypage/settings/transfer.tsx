import { useEffect } from 'react';

import { Alert, Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  SettingTransferList,
  SettingsTransferFooter,
  SettingsTransferForm,
  SettingsTransferHeader,
  SettingsTransferIntro,
  SettingsTransferSelectBottomSheet
} from '@components/pages/settingsTransfer';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

function Transfer() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  useEffect(() => {
    logEvent(attrKeys.mypage.VIEW_TRANSFER_MANAGE);
  }, []);

  return (
    <>
      <GeneralTemplate header={<SettingsTransferHeader />} footer={<SettingsTransferFooter />}>
        <Flexbox
          direction="vertical"
          customStyle={{
            flex: 1
          }}
        >
          <SettingsTransferIntro />
          <SettingsTransferForm />
          <SettingTransferList />
          <Flexbox
            alignment="flex-end"
            customStyle={{
              flex: 1
            }}
          >
            <Alert
              round={8}
              customStyle={{
                width: '100%',
                height: 'fit-content',
                marginTop: 12,
                padding: 12,
                backgroundColor: common.bg03
              }}
            >
              <Flexbox gap={8}>
                <Box
                  customStyle={{
                    minWidth: 2,
                    width: 2,
                    height: 2,
                    marginTop: 6,
                    borderRadius: '50%',
                    backgroundColor: common.ui60
                  }}
                />
                <Typography
                  variant="body2"
                  customStyle={{
                    color: common.ui60
                  }}
                >
                  연동한 플랫폼의 상점, 프로필 주소를 수정 또는 삭제하시려면
                  <br />
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  “1:1 문의"를 이용해주세요!
                </Typography>
              </Flexbox>
            </Alert>
          </Flexbox>
        </Flexbox>
      </GeneralTemplate>
      <SettingsTransferSelectBottomSheet />
    </>
  );
}

export default Transfer;