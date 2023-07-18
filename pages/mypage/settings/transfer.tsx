import { useEffect } from 'react';

import { GetServerSidePropsContext } from 'next';
import { Alert, Box, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  SettingsTransferFooter,
  SettingsTransferForm,
  SettingsTransferHeader,
  SettingsTransferIntro,
  SettingsTransferList,
  SettingsTransferSelectBottomSheet
} from '@components/pages/settingsTransfer';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import getAccessUserByCookies from '@utils/common/getAccessUserByCookies';

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
          <SettingsTransferList />
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
                <Typography variant="body2" color="ui60">
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

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  return {
    props: {
      accessUser: getAccessUserByCookies(getCookies({ req }))
    }
  };
}

export default Transfer;
