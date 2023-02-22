import { Box, Flexbox, Icon, Image, Typography, useTheme } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

function AppIntro02({ animationStart }: { animationStart: boolean }) {
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
      <CenterCard direction="vertical" justifyContent="center" alignment="center">
        <Icon name="LogoText_96_20" customStyle={{ marginTop: 20 }} width={70} />
        <Image
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/appIntro/center_bag_img.png`}
          alt="Center Bag Img"
          disableAspectRatio
        />
        {animationStart && (
          <>
            <BubbleText variant="h3" weight="bold" top={-20} left={-20} afterLeft={30} order={2}>
              인증판매자
            </BubbleText>
            <BubbleText variant="h3" weight="bold" top={55} left={-70} afterLeft={70} order={1}>
              새상품급
            </BubbleText>
            <BubbleText variant="h3" weight="bold" top={-10} right={-55} order={3}>
              MEDIUM
            </BubbleText>
            <BubbleText variant="h3" weight="bold" top={60} right={-95} order={4} afterTop={14}>
              <Flexbox gap={8}>
                <Circle color={common.uiWhite}>
                  <Icon name="CheckOutlined" size="medium" />
                </Circle>
                <Circle color="#FC7B7B" />
                <Circle color="#E09C76" />
              </Flexbox>
            </BubbleText>
          </>
        )}
      </CenterCard>
      <Box customStyle={{ textAlign: 'center' }}>
        <Typography variant="h1" weight="bold">
          AI가 정리한
          <br />
          깔끔 필터
        </Typography>
        <Typography variant="h3" customStyle={{ marginTop: 12, color: common.ui60 }}>
          복잡한 중고매물, 보고픈 것만 보세요
        </Typography>
      </Box>
    </Flexbox>
  );
}

const CenterCard = styled(Flexbox)`
  width: 181px;
  height: 232px;
  border-radius: 16px;
  border: 6px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui95};
  margin-bottom: 28px;
  padding: 0 12px;
  text-align: center;
  position: relative;
  box-shadow: 0px 16px 32px #000000;
`;

const BubbleText = styled(Typography)<{
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  afterLeft?: number;
  order: number;
  afterTop?: number;
}>`
  padding: 8px 14px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  border-radius: 36px;
  position: absolute;
  @keyframes scale-in-right {
    0% {
      transform: scale(0);
      transform-origin: 100% 50%;
      opacity: 0;
    }
    100% {
      transform: scale(1);
      transform-origin: 100% 50%;
      opacity: 1;
    }
  }

  @keyframes scale-in-left {
    0% {
      transform: scale(0);
      transform-origin: 0% 50%;
      opacity: 0;
    }
    100% {
      transform: scale(1);
      transform-origin: 0% 50%;
      opacity: 1;
    }
  }

  ${({ top }): CSSObject => {
    return {
      top
    };
  }};
  ${({ right, order }): CSSObject => {
    return {
      right,
      animation: right ? 'scale-in-left 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both' : '',
      animationDelay: `${order - 0.95 * order}s`
    };
  }};
  ${({ bottom }): CSSObject => {
    return {
      bottom
    };
  }};
  ${({ left, order }): CSSObject => {
    return {
      left,
      animation: left ? 'scale-in-right 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both' : '',
      animationDelay: `${order - 0.8 * order}s`
    };
  }};
  &:after {
    content: "";
    position: absolute;
    border: 0 solid transparent;
    width: 15px;
    height: 30px;
    top: ${({ afterTop }) => afterTop || 11}px;
    ${({ left, afterLeft }): CSSObject => {
      return left
        ? {
            borderBottom: '9px solid #fff',
            borderRadius: '20px 0',
            transform: 'rotate(90deg) translateX(20px)',
            left: afterLeft
          }
        : {};
    }};
    ${({ right }): CSSObject => {
      return right
        ? {
            borderTop: '9px solid #fff',
            borderRadius: '0 20px 0',
            transform: 'rotate(90deg) translateX(20px)',
            left: 0
          }
        : {};
    }};
`;

const Circle = styled.div<{ color: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ color }) => color};
`;

export default AppIntro02;
