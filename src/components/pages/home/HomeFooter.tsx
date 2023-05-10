import Link from 'next/link';
import { Box, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

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
      <Typography variant="body2" weight="bold">
        (주)미스터카멜 | 대표이사 김준경
      </Typography>
      <Typography variant="body2" customStyle={{ marginTop: 16 }}>
        서울특별시 용산구 한강대로 366 트윈시티 남산 2, 오피스동 8층 패스트파이브 811호
      </Typography>
      <Typography variant="body2">사업자등록번호: 662-81-00864</Typography>
      <Typography variant="body2">통신판매업 신고번호: 2019-서울성동-01263</Typography>
      <Typography variant="body2">고객센터: 070-4788-9600</Typography>
      <Typography variant="small2" customStyle={{ color: common.ui60, margin: '10px 0 28px 0' }}>
        (주)미스터카멜은 통신판매중개자로서 중고 명품 전문 거래 마켓플레이스 카멜의 거래당사자가
        아니며, 입점판매자가 등록한 상품정보 및 거래에 대해 책임을 지지 않습니다.
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
