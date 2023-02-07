import Link from 'next/link';
import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import FormattedText from '@library/FormattedText';

function HomeFooter({ isMoweb }: { isMoweb?: boolean }) {
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
        padding: isMoweb ? '0 0 24px 0' : '24px 20px',
        backgroundColor: common.ui95,
        userSelect: 'none'
      }}
    >
      <FormattedText variant="body2" weight="bold" id="info.company" />
      <FormattedText variant="body2" customStyle={{ marginTop: 16 }} id="info.address" />
      <FormattedText variant="body2" id="info.businessRegistrationNumber" />
      <FormattedText variant="body2" id="info.mailOrderBusinessReportNumber" />
      <FormattedText variant="body2" id="info.serviceCenterNumber" />
      <Typography variant="small2" customStyle={{ color: common.ui60, margin: '10px 0 28px 0' }}>
        (주)미스터카멜은 통신판매중개자로서 중고 명품 전문 거래 마켓플레이스 카멜의 거래당사자가
        아니며, 입점판매자가 등록한 상품정보 및 거래에 대해 책임을 지지 않습니다.
      </Typography>
      <Flexbox alignment="center" gap={10}>
        <Link href="/terms/privacy">
          <FormattedText
            variant="body2"
            customStyle={{
              color: common.ui60,
              textDecoration: 'underline'
            }}
            id="common.privacy"
          />
        </Link>
        <Link href="/terms/operationPolicy">
          <FormattedText
            variant="body2"
            customStyle={{
              color: common.ui60,
              textDecoration: 'underline'
            }}
            id="common.operationPolicy"
          />
        </Link>
        <Link href="/terms/serviceTerms">
          <FormattedText
            variant="body2"
            customStyle={{
              color: common.ui60,
              textDecoration: 'underline'
            }}
            id="common.serviceTerms"
          />
        </Link>
      </Flexbox>
      <Typography variant="body2" customStyle={{ color: common.ui20, margin: '20px 0 52px 0' }}>
        ⓒ2020 Mr.Camel All rights reserved
      </Typography>
    </Box>
  );
}

export default HomeFooter;
