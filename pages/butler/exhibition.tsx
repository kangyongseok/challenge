import { ThemeProvider } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ButlerExhibitionBanner,
  ButlerExhibitionHeader,
  ButlerExhibitionIntro,
  ButlerExhibitionProductGrid
} from '@components/pages/butlerExhibition';

function ButlerExhibition() {
  const {
    mode,
    palette: { common }
  } = useTheme();

  return (
    <ThemeProvider
      theme={mode}
      disableResetCSS={false}
      customResetStyle={{
        body: {
          backgroundColor: common.bg03
        }
      }}
    >
      <GeneralTemplate
        header={<ButlerExhibitionHeader />}
        disablePadding
        customStyle={{
          backgroundColor: common.bg03
        }}
      >
        <ButlerExhibitionIntro />
        <ButlerExhibitionProductGrid />
        <ButlerExhibitionBanner />
      </GeneralTemplate>
    </ThemeProvider>
  );
}

export default ButlerExhibition;
