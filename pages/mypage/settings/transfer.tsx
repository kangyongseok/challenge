import { useEffect } from 'react';

import { useRouter } from 'next/router';
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

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function Transfer() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser, isInitialLoading } = useQueryAccessUser();

  // TODO 임시 처리, 추후 제거
  useEffect(() => {
    if (!isInitialLoading && !accessUser) {
      router.push({
        pathname: '/login',
        query: {
          returnUrl: '/mypage/settings/transfer',
          isRequiredLogin: true
        }
      });
    }
  }, [router, isInitialLoading, accessUser]);

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
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  가져오기 할 플랫폼의 상품 url 주소를 수정 또는 삭제하시려면 “1:1 문의”를
                  이용해주세요! <span style={{ color: common.ui20 }}>최대 5개까지 연동</span>됩니다.
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
