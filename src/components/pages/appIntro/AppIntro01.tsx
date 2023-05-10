import { Box, Flexbox, Icon, Image, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

const animationItems = [
  { name: 'box_brand01', style: { width: 24, top: 60 }, alt: '트랜비', order: 4 },
  { name: 'box_brand02', style: { width: 24, top: 40, left: 38 }, alt: '시크먼트', order: 6 },
  { name: 'box_brand03', style: { width: 40, top: 92, left: 38 }, alt: '번개장터', order: 1 },
  { name: 'box_brand04', style: { width: 29, top: 60, left: 85 }, alt: '중고나라', order: 3 },
  { name: 'box_brand05', style: { width: 24, top: 0, left: 104 }, alt: '나이키매니아', order: 8 },
  { name: 'box_brand06', style: { width: 39, top: 75, left: 128 }, alt: '당근마켓', order: 2 },
  { name: 'box_brand07', style: { width: 24, top: 35, left: 148 }, alt: '필웨이', order: 7 },
  { name: 'box_brand08', style: { width: 24, top: 59, left: 194 }, alt: '크림', order: 5 }
];

// 97 , 79

function AppIntro01() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <Flexbox
      alignment="center"
      direction="vertical"
      customStyle={{ height: 350, justifyContent: 'flex-end' }}
    >
      <Box customStyle={{ position: 'relative', width: 188, marginBottom: 35 }}>
        <AnimationArea>
          {animationItems.map((item) => (
            <AnimationItem
              key={`platform-icon-${item.alt}`}
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/appIntro/${item.name}.png`}
              disableAspectRatio
              customStyle={item.style}
              index={item.order}
              alt={item.alt}
            />
          ))}
        </AnimationArea>
        <BoxTop />
        <BoxFront />
        <FullLogo justifyContent="center" alignment="center" gap={7}>
          <Icon name="Logo_45_45" width={30} />
          <Icon name="LogoText_96_20" />
        </FullLogo>
      </Box>
      <Box customStyle={{ textAlign: 'center' }}>
        <Typography variant="h1" weight="bold">
          앱1개로 모아보는
          <br />
          대한민국 중고명품
        </Typography>
        <Typography variant="h3" customStyle={{ marginTop: 12, color: common.ui60 }}>
          다른 앱이 필요없어요
        </Typography>
      </Box>
    </Flexbox>
  );
}

const AnimationArea = styled.div`
  width: 188px;
  height: 100px;
  position: absolute;
  bottom: 155px;
  left: 50%;
  margin-left: -96px;
`;

const AnimationItem = styled(Image)<{ index: number }>`
  position: absolute;
  animation: innerBox 0.3s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
  animation-delay: ${({ index }) => index - 0.95 * index + 1}s;
  @keyframes innerBox {
    100% {
      top: 150px;
      left: 79px;
    }
  }
`;

const BoxFront = styled.div`
  width: 188px;
  height: 114px;
  background: radial-gradient(100% 100% at 0% 0%, #0078ff 0%, #1833ff 100%);
  border-radius: 0 0 8px 8px;
  position: relative;
  z-index: ${({ theme: { zIndex } }) => zIndex.tooltip};
`;

const BoxTop = styled.div`
  height: 0;
  width: 188px;
  border-bottom: 16px solid #0a2599;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
`;

const FullLogo = styled(Flexbox)`
  position: absolute;
  top: 8px;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: ${({ theme: { zIndex } }) => zIndex.tooltip};
`;

export default AppIntro01;
