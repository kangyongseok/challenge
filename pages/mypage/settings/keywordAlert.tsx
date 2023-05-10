import { useEffect } from 'react';

import { Typography } from '@mrcamelhub/camel-ui';

import { KeywordAlertManageBottomSheet, KeywordAlertOffDialog } from '@components/UI/organisms';
import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  SettingsKeywordAlertForm,
  SettingsKeywordAlertList
} from '@components/pages/settingsKeywordAlert';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function SettingsKeywordAlert() {
  useEffect(() => {
    logEvent(attrKeys.mypage.VIEW_KEYWORD_ALERT, {
      name: attrProperty.name.KEYWORD_ALERT
    });
  }, []);

  return (
    <>
      <GeneralTemplate
        header={
          <Header showRight={false} hideLine={false}>
            <Typography variant="h3" weight="bold">
              키워드 알림
            </Typography>
          </Header>
        }
      >
        <SettingsKeywordAlertForm />
        <SettingsKeywordAlertList />
      </GeneralTemplate>
      <KeywordAlertManageBottomSheet />
      <KeywordAlertOffDialog />
    </>
  );
}

export default SettingsKeywordAlert;
