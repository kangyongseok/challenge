import { useEffect } from 'react';

import { useTheme } from 'mrcamel-ui';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  LegitGuideDescription,
  LegitGuideHandsUp,
  LegitGuideTargetBrandList,
  LegitGuideTitle
} from '@components/pages/legitGuide';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function LegitGuide() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  useEffect(() => {
    const { name = 'NONE' } =
      SessionStorage.get<{ name?: string }>(sessionStorageKeys.legitGuideEventProperties) || {};
    logEvent(attrKeys.legitGuide.VIEW_LEGIT_POPUP, {
      name,
      title: attrProperty.legitTitle.HOWTO
    });
  }, []);

  return (
    <GeneralTemplate
      header={<Header customStyle={{ backgroundColor: common.grey['95'] }} />}
      disablePadding
      customStyle={{
        height: 'auto',
        minHeight: '100%',
        backgroundColor: common.grey['95'],
        overflowX: 'hidden'
      }}
    >
      <LegitGuideTitle />
      <LegitGuideHandsUp />
      <LegitGuideDescription />
      <LegitGuideTargetBrandList />
    </GeneralTemplate>
  );
}

export default LegitGuide;
