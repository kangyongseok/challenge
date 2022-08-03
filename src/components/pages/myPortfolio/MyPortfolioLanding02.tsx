import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import Image from '@components/UI/atoms/Image';

import CountUpAnimation from './CountUpAnimation';

const textData = [
  { count: 123, description: '카멜이 분석하는 플랫폼 수', unit: '개' },
  { count: 90, description: '카멜이 매일 분석중인 매물 수', unit: '만개' },
  { count: 3000, description: '지금까지 카멜이 분석한 매물 수', unit: '만개' }
];

function MyPortfolioLanding02({
  isSmallHeight,
  isAnimation
}: {
  isSmallHeight: boolean;
  isAnimation: boolean;
}) {
  const {
    theme: { palette }
  } = useTheme();

  return (
    <Flexbox customStyle={{ height: '100%' }} direction="vertical">
      <Box customStyle={{ marginTop: isSmallHeight ? 20 : 52, padding: '0 20px' }}>
        <Typography variant="h2" customStyle={{ color: palette.common.grey['60'] }}>
          새것도 아니고...
        </Typography>
        <Box>
          <Typography weight="bold" variant="h2" customStyle={{ color: palette.common.white }}>
            중고명품의 정확한 시세를
          </Typography>
          <Typography weight="bold" variant="h2" customStyle={{ color: palette.common.white }}>
            어떻게 알 수 있나요?
          </Typography>
        </Box>
        <Box customStyle={{ marginTop: 12 }}>
          <Typography customStyle={{ color: palette.common.white }}>
            카멜은 전국의 모든 중고명품의 실거래가를
          </Typography>
          <Typography customStyle={{ color: palette.common.white }}>
            실시간으로 분석하고 있어요
          </Typography>
        </Box>
      </Box>
      <MapCountFlexbox alignment="center" justifyContent="space-between">
        <Flexbox direction="vertical" gap={20}>
          {textData.map(({ count, description, unit }) => (
            <Flexbox direction="vertical" key={`text-${count}`}>
              <GradiantText weight="bold" variant="h2">
                {isAnimation ? <CountUpAnimation countProps={count} /> : count}
                {unit}
              </GradiantText>
              <Typography customStyle={{ color: palette.common.grey['60'] }}>
                {description}
              </Typography>
            </Flexbox>
          ))}
        </Flexbox>
        <Image
          width={152}
          height="auto"
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/point_map_img.png`}
          alt="포인트 맵"
          disableAspectRatio
        />
      </MapCountFlexbox>
    </Flexbox>
  );
}

const GradiantText = styled(Typography)`
  background: linear-gradient(90deg, #808eff 0%, #b080ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  display: flex;
  align-items: center;
`;

const MapCountFlexbox = styled(Flexbox)`
  padding: 0 20px;
  flex: 1;
`;

export default MyPortfolioLanding02;
