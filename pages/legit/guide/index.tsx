import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { Box, Icon, ThemeProvider, dark } from 'mrcamel-ui';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  LegitGuideCtaButton,
  LegitGuideIntro,
  LegitGuidePicturePanel,
  LegitGuideTabs,
  LegitGuideUploadPanel
} from '@components/pages/legitGuide';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

function LegitGuide() {
  const router = useRouter();
  const { tab = 'upload' } = router.query;

  useEffect(() => {
    logEvent(attrKeys.legitGuide.VIEW_LEGIT_HOWITWORKS);
  }, []);

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
          <Header
            rightIcon={
              <Box
                onClick={() => router.back()}
                customStyle={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                  cursor: 'pointer'
                }}
              >
                <Icon name="CloseOutlined" />
              </Box>
            }
            isTransparent
            customStyle={{
              backgroundColor: dark.palette.common.bg03
            }}
          />
        }
        footer={<LegitGuideCtaButton />}
        disablePadding
        customStyle={{
          height: 'auto',
          minHeight: '100%',
          backgroundColor: dark.palette.common.bg03,
          overflowX: 'hidden'
        }}
      >
        <LegitGuideIntro />
        <LegitGuideTabs />
        {tab === 'upload' && <LegitGuideUploadPanel />}
        {tab === 'picture' && <LegitGuidePicturePanel />}
      </GeneralTemplate>
    </ThemeProvider>
  );
}

export default LegitGuide;
