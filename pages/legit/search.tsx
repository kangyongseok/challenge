import { useEffect } from 'react';

import { useTheme } from 'mrcamel-ui';

import { BottomNavigation } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  LegitSearchFilter,
  LegitSearchGrid,
  LegitSearchHeader
} from '@components/pages/legitSearch';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

function LegitSearch() {
  const {
    theme: { mode }
  } = useTheme();

  useEffect(() => {
    logEvent(attrKeys.legitSearch.VIEW_LEGIT_HISTORY);
  }, []);

  useEffect(() => {
    document.body.className = `legit-${mode}`;

    return () => {
      document.body.removeAttribute('class');
    };
  }, [mode]);

  return (
    <GeneralTemplate
      header={<LegitSearchHeader />}
      footer={<BottomNavigation />}
      disablePadding
      customStyle={{
        height: 'auto',
        minHeight: '100%'
      }}
    >
      <LegitSearchFilter />
      <LegitSearchGrid />
    </GeneralTemplate>
  );
}

export default LegitSearch;
