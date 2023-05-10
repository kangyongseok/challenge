import { useMemo } from 'react';

import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { Box, Button, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import HomeFooter from '@components/pages/home/HomeFooter';

import { handleClickAppDownload } from '@utils/common';

import { EllipsisText, FooterWrap } from './MowebFooter.styles';

const springAndSummer = [
  [
    '나이키 조던 1 하이',
    '스톤아일랜드 맨투맨',
    '롤렉스 데이저스트 시계',
    '샤넬 클래식 숄더백',
    '루이비통 클러치'
  ],
  [
    '톰브라운 가디건',
    '톰브라운 맨투맨',
    '프라이탁 하와이파이브오',
    '구찌 반지갑',
    '디올 오블리크 카드지갑'
  ]
];

const autumnAndWinter = [
  [
    '나이키 조던 1 하이',
    '파라점퍼스 고비 패딩',
    '몽클레어 패딩',
    '무스너클 발리스틱 패딩',
    '스톤아일랜드 맨투맨'
  ],
  [
    '맥케이지 딕슨 패딩',
    '롤렉스 데이저스트 시계',
    '샤넬 클래식 숄더백',
    '스톤아일랜드 패딩',
    '프라이탁 하와이파이브오'
  ]
];

function getPageNameByPathName(pathname: string) {
  let pageName = pathname;

  if (pathname === '/') {
    pageName = 'MAIN';
  } else if (pathname === '/search') {
    pageName = 'SEARCHMODAL';
  } else if (pathname === '/category') {
    pageName = 'CATEGORY';
  } else if (pathname === '/ranking') {
    pageName = 'HOT';
  } else if (pathname === '/productList') {
    pageName = 'PRODUCT_LIST';
  } else if (pathname.indexOf('/product/') >= 0) {
    pageName = 'PRODUCT_DETAIL';
  } else if (pathname === '/brands') {
    pageName = 'BRAND';
  }

  return pageName;
}

function MowebFooter() {
  const { push, pathname } = useRouter();
  const {
    palette: { primary, common }
  } = useTheme();

  const handleClickDownload = () =>
    handleClickAppDownload({
      options: {
        name: getPageNameByPathName(window.location.pathname),
        att: 'BANNER'
      }
    });

  const seasonChange = useMemo(() => {
    if (Number(dayjs().format('M')) >= 3 && Number(dayjs().format('M')) <= 8) {
      return springAndSummer;
    }
    return autumnAndWinter;
  }, []);

  return (
    <FooterWrap bottomPadding={pathname === '/products/[id]' ? 100 : 0}>
      <Typography weight="bold">카멜 앱으로 더 편하게 매물 찾기</Typography>
      <Flexbox customStyle={{ marginTop: 12 }} gap={8}>
        <Button variant="outline" onClick={handleClickDownload}>
          <Icon name="BrandAppleFilled" />
          <Typography weight="medium">IOS</Typography>
        </Button>
        <Button variant="outline" onClick={handleClickDownload}>
          <Icon name="BrandPlayStoreFilled" />
          <Typography weight="medium">Android</Typography>
        </Button>
      </Flexbox>
      <Box customStyle={{ marginTop: 32 }}>
        <Typography weight="bold" customStyle={{ marginBottom: 20 }}>
          요즘 핫한 모델 🔥
        </Typography>
        <Flexbox alignment="center" customStyle={{ width: '100%' }}>
          <Flexbox gap={8} direction="vertical" customStyle={{ width: '50%' }}>
            {seasonChange[0].map((model, i) => (
              <Flexbox
                key={`model-name-${model}`}
                onClick={() => push(`/products/search/${model}`)}
              >
                <Typography weight="bold" customStyle={{ color: primary.light, marginRight: 8 }}>
                  {i + 1}
                </Typography>
                <EllipsisText>{model}</EllipsisText>
              </Flexbox>
            ))}
          </Flexbox>
          <Flexbox gap={8} direction="vertical" customStyle={{ width: '50%' }}>
            {seasonChange[1].map((model, i) => (
              <Flexbox
                key={`model-name-${model}`}
                onClick={() => push(`/products/search/${model}`)}
              >
                <Typography weight="bold" customStyle={{ color: primary.light, marginRight: 8 }}>
                  {i + 6}
                </Typography>
                <EllipsisText>{model}</EllipsisText>
              </Flexbox>
            ))}
          </Flexbox>
        </Flexbox>
      </Box>
      <Box
        customStyle={{
          borderBottom: `1px solid ${common.line01}`,
          paddingTop: 32,
          marginBottom: 32
        }}
      />
      <HomeFooter isMoweb />
    </FooterWrap>
  );
}

export default MowebFooter;
