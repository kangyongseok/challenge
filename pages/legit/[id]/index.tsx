import { useEffect } from 'react';

import { Box, ThemeProvider, dark } from '@mrcamelhub/camel-ui';

import Header from '@components/UI/molecules/Header';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  LegitStatusAlarmGuideDialog,
  LegitStatusBottomSheet,
  LegitStatusContents,
  LegitStatusCtaButton,
  LegitStatusFailContents,
  LegitStatusSummaryCard,
  LegitStatusVisualProcess
} from '@components/pages/legitStatus';

function LegitStatus() {
  useEffect(() => {
    document.body.className = 'legit-dark';

    return () => {
      document.body.removeAttribute('class');
    };
  }, []);

  return (
    <ThemeProvider theme="dark">
      <GeneralTemplate
        header={
          <Header isTransparent customStyle={{ backgroundColor: dark.palette.common.bg03 }} />
        }
        footer={<LegitStatusCtaButton />}
        customStyle={{
          height: 'auto',
          minHeight: '100%',
          backgroundColor: dark.palette.common.bg03
        }}
      >
        <LegitStatusSummaryCard />
        <LegitStatusVisualProcess />
        <LegitStatusContents />
        <LegitStatusFailContents />
        <Box customStyle={{ height: 89 }} />
        <LegitStatusBottomSheet />
        <LegitStatusAlarmGuideDialog />
      </GeneralTemplate>
    </ThemeProvider>
  );
}

export default LegitStatus;
