import { Box, Flexbox, Icon, Typography, dark } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { Image } from '@components/UI/atoms';

import { APP_TOP_STATUS_HEIGHT } from '@constants/common';

function AppIntro03({ animationStart }: { animationStart: boolean }) {
  return (
    <StyledWrap direction="vertical" alignment="center" justifyContent="center">
      <Flexbox
        alignment="center"
        direction="vertical"
        customStyle={{ height: 350, justifyContent: 'flex-end' }}
      >
        <Box customStyle={{ position: 'relative', width: '100%' }}>
          {animationStart && (
            <>
              <BubbleText variant="h3" weight="bold" right={120}>
                <Icon name="AlarmFilled" /> UPDATE
                <Dot />
                <StarIcon
                  src={`https://${process.env.IMAGE_DOMAIN}/assets/images/appIntro/white_star.png`}
                  alt="star icon"
                />
              </BubbleText>
              <BlueLine alignment="center" gap={10} customStyle={{ height: 30 }}>
                <Flexbox justifyContent="center" alignment="center" gap={7}>
                  <Icon name="Logo_45_45" size="medium" />
                  <Icon name="LogoText_96_20" height={15} width={70} />
                </Flexbox>
                <Flexbox justifyContent="center" alignment="center" gap={7}>
                  <Icon name="Logo_45_45" size="medium" />
                  <Icon name="LogoText_96_20" height={15} width={70} />
                </Flexbox>
                <Flexbox justifyContent="center" alignment="center" gap={7}>
                  <Icon name="Logo_45_45" size="medium" />
                  <Icon name="LogoText_96_20" height={15} width={70} />
                </Flexbox>
                <Flexbox justifyContent="center" alignment="center" gap={7}>
                  <Icon name="Logo_45_45" size="medium" />
                  <Icon name="LogoText_96_20" height={15} width={70} />
                </Flexbox>
              </BlueLine>
              <GrayLine alignment="center" gap={10}>
                <Flexbox
                  justifyContent="center"
                  alignment="center"
                  gap={7}
                  customStyle={{ height: 30 }}
                >
                  <Icon name="Logo_45_45" size="medium" />
                  <Icon name="LogoText_96_20" height={15} width={70} />
                </Flexbox>
                <Flexbox
                  justifyContent="center"
                  alignment="center"
                  gap={7}
                  customStyle={{ height: 30 }}
                >
                  <Icon name="Logo_45_45" size="medium" />
                  <Icon name="LogoText_96_20" height={15} width={70} />
                </Flexbox>
                <Flexbox
                  justifyContent="center"
                  alignment="center"
                  gap={7}
                  customStyle={{ height: 30 }}
                >
                  <Icon name="Logo_45_45" size="medium" />
                  <Icon name="LogoText_96_20" height={15} width={70} />
                </Flexbox>
                <Flexbox
                  justifyContent="center"
                  alignment="center"
                  gap={7}
                  customStyle={{ height: 30 }}
                >
                  <Icon name="Logo_45_45" size="medium" />
                  <Icon name="LogoText_96_20" height={15} width={70} />
                </Flexbox>
              </GrayLine>
            </>
          )}
          <ProductImageArea justifyContent="space-between" alignment="center">
            <Image
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/appIntro/left_cloth.png`}
              disableAspectRatio
            />
            <Image
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/appIntro/right_bag.png`}
              disableAspectRatio
            />
          </ProductImageArea>
        </Box>
        <Box customStyle={{ textAlign: 'center', marginTop: 35 }}>
          <Typography variant="h1" weight="bold">
            대신 찾아주는
            <br />
            꿀매물
          </Typography>
          <Typography variant="h3" customStyle={{ marginTop: 12, color: dark.palette.common.ui60 }}>
            가격 하락, 꿀매물 알아서 전부 챙겨드려요
          </Typography>
        </Box>
      </Flexbox>
    </StyledWrap>
  );
}

const StyledWrap = styled(Flexbox)`
  width: 100%;
  height: calc(100vh - ${APP_TOP_STATUS_HEIGHT}px);
  height: calc((var(--vh, 1vh) * 100) - ${APP_TOP_STATUS_HEIGHT}px);
  overflow: hidden;
`;

const GrayLine = styled(Flexbox)`
  position: absolute;
  width: 433.49px;
  height: 34.98px;
  left: -43.49px;
  bottom: 55px;
  background: #313438;
  transform: rotate(-20.03deg);
  padding: 0 20px;
  z-index: 1;
  animation: slide-in-bl 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  @keyframes slide-in-bl {
    0% {
      transform: translateY(500px) translateX(-1000px) rotate(-20.03deg);
      opacity: 0;
    }
    100% {
      transform: translateY(0) translateX(0) rotate(-20.03deg);
      opacity: 1;
    }
  }
`;

const BlueLine = styled(Flexbox)`
  position: absolute;
  width: 368.47px;
  height: 29.73px;
  left: 56.29px;
  bottom: 74px;
  background: #2937ff;
  transform: rotate(22.32deg);
  padding: 0 20px;
  z-index: 3;
  animation: slide-in-br 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation-delay: 0.2s;
  @keyframes slide-in-br {
    0% {
      transform: translateY(500px) translateX(1000px) rotate(22.32deg);
      opacity: 0;
    }
    100% {
      transform: translateY(0) translateX(0) rotate(22.32deg);
      opacity: 1;
    }
  }
`;

const Dot = styled.div`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #90d1ff;
  position: absolute;
  left: -20px;
  bottom: 0;
  opacity: 0;
  animation: fade-in 0.5s both;
  animation-delay: 1.5s;
  @keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

const StarIcon = styled.img`
  position: absolute;
  top: -23px;
  right: -30px;
  width: 23px;
  height: 23px;
  animation-delay: 0.5s;
  opacity: 0;
  animation: fade-in 0.5s both;
  animation-delay: 1.5s;
  @keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

const ProductImageArea = styled(Flexbox)`
  position: relative;
  z-index: 2;
`;

const BubbleText = styled(Typography)<{
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  afterLeft?: number;
}>`
  padding: 8px 14px;
  background: ${dark.palette.secondary.red.main};
  color: ${dark.palette.common.uiBlack};
  border-radius: 36px;
  position: relative;
  width: 127px;
  margin: 0 auto;
  bottom: -20px;
  animation: slide-in-elliptic-top-fwd 0.7s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
  animation-delay: 0.5s;
  @keyframes slide-in-elliptic-top-fwd {
  0% {
    transform: translateY(-600px) rotateX(-30deg) scale(0);
    transform-origin: 50% 100%;
    opacity: 0;
  }
  100% {
    transform: translateY(0) rotateX(0) scale(1);
    transform-origin: 50% 1400px;
    opacity: 1;
  }
}
  &:after {
    content: "";
    position: absolute;
    border: 0 solid transparent;
    width: 15px;
    height: 30px;
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
            borderTop: `9px solid ${dark.palette.secondary.red.main}`,
            borderRadius: '0 20px 0',
            transform: 'rotate(90deg) translateX(20px)',
            right: 20
          }
        : {};
    }};
`;

export default AppIntro03;
