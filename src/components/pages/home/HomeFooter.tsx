import Link from 'next/link';
import { Box, Typography, useTheme } from 'mrcamel-ui';

import FormattedText from '@library/FormattedText';

import { checkAgent } from '@utils/common';

function HomeFooter() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <Box
      component="footer"
      draggable={false}
      customStyle={{
        padding: !(checkAgent.isIOSApp() || checkAgent.isAndroidApp()) ? '0 0 32px 0' : '24px 20px',
        backgroundColor: common.ui95,
        userSelect: 'none'
      }}
    >
      <FormattedText variant="body2" weight="bold" id="info.company" />
      <FormattedText variant="body2" customStyle={{ marginTop: 16 }} id="info.address" />
      <FormattedText variant="body2" id="info.businessRegistrationNumber" />
      <FormattedText variant="body2" id="info.mailOrderBusinessReportNumber" />
      <Link href="/privacy">
        <a>
          <FormattedText
            variant="body2"
            customStyle={{
              color: common.ui60,
              marginTop: 16,
              textDecoration: 'underline'
            }}
            id="common.privacy"
          />
        </a>
      </Link>
      <Typography variant="body2" customStyle={{ color: common.ui60, marginTop: 16 }}>
        ⓒ2020 Mr.Camel All rights reserved
      </Typography>
    </Box>
  );
}

export default HomeFooter;
