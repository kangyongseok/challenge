import Link from 'next/link';
import { Box, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

interface HomeFooterProps {
  isMoweb?: boolean;
}
function HomeFooter({ isMoweb }: HomeFooterProps) {
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
      <Typography variant="body2" weight="bold">
        (주)미스터카멜 | 대표이사 김준경
      </Typography>
      <Typography variant="body2" customStyle={{ marginTop: 16 }}>
        서울특별시 용산구 한강대로 366 트윈시티 남산 2, 오피스동 8층 패스트파이브 811호
      </Typography>
      <Typography variant="body2">사업자등록번호: 662-81-00864</Typography>
      <Typography variant="body2">통신판매업 신고번호: 2019-서울성동-01263</Typography>
      <Typography variant="body2">고객센터: 070-4788-9600</Typography>
      <Typography
        variant="small2"
        customStyle={{ color: common.ui60, margin: '10px 0 28px 0', wordBreak: 'keep-all' }}
      >
        (주)미스터카멜은 통신판매중개자로서 거래 당사자가 아니며, 판매 회원과 구매 회원 간의
        상품정보 및 거래에 대해 책임을 지지 않습니다. 또한 상품에 직접 관여하지 않으며, 상품 주문,
        배송 및 환불의 의무와 책임은 각 판매자에게 있습니다.
      </Typography>
      <Flexbox alignment="center" gap={10}>
        <Link href="/terms/privacy" prefetch={false}>
          <Typography
            variant="body2"
            customStyle={{
              color: common.ui60,
              textDecoration: 'underline'
            }}
          >
            개인정보처리방침
          </Typography>
        </Link>
        <Link href="/terms/operationPolicy" prefetch={false}>
          <Typography
            variant="body2"
            customStyle={{
              color: common.ui60,
              textDecoration: 'underline'
            }}
          >
            서비스운영정책
          </Typography>
        </Link>
        <Link href="/terms/serviceTerms" prefetch={false}>
          <Typography
            variant="body2"
            customStyle={{
              color: common.ui60,
              textDecoration: 'underline'
            }}
          >
            이용약관
          </Typography>
        </Link>
      </Flexbox>
      <Typography variant="body2" customStyle={{ color: common.ui20, margin: '20px 0 52px 0' }}>
        ⓒ2020 Mr.Camel All rights reserved
      </Typography>
    </Box>
  );
}

export default HomeFooter;
