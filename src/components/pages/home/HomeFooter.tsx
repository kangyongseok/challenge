import Link from 'next/link';
import { Box, Typography, useTheme } from 'mrcamel-ui';

function HomeFooter() {
  const {
    theme: { palette }
  } = useTheme();

  return (
    <Box
      component="footer"
      draggable={false}
      customStyle={{
        marginTop: 12,
        padding: '24px 20px',
        backgroundColor: palette.common.grey['95'],
        userSelect: 'none',
        cursor: 'default'
      }}
    >
      <Typography variant="body2" weight="bold">
        (주)미스터카멜 | 대표이사 김준경
      </Typography>
      <Typography variant="body2" customStyle={{ marginTop: 16 }}>
        서울특별시 용산구 한강대로 366 트윈시티 남산 2, 오피스동 8층 패스트파이브 811호
      </Typography>
      <Typography variant="body2">사업자등록번호: 662-81-00864</Typography>
      <Typography variant="body2">통신판매업 신고번호 : 2019-서울성동-01263</Typography>
      <Link href="/privacy">
        <a>
          <Typography
            variant="body2"
            customStyle={{
              color: palette.common.grey['40'],
              marginTop: 16,
              textDecoration: 'underline'
            }}
          >
            개인정보처리방침
          </Typography>
        </a>
      </Link>
      <Typography variant="body2" customStyle={{ color: palette.common.grey['60'], marginTop: 16 }}>
        ⓒ2020 Mr.Camel All rights reserved
      </Typography>
    </Box>
  );
}

export default HomeFooter;
