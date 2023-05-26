import { useEffect, useState } from 'react';

import { Box, Chip, Flexbox, Image, Typography, dark } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { IOS_SAFE_AREA_TOP } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

function ButlerDemo02({ currentSection }: { currentSection: number }) {
  const [innerHeight, setInnerHeight] = useState(0);

  useEffect(() => {
    setInnerHeight(document.body.clientHeight);
  }, []);

  return (
    <Box
      customStyle={{
        textAlign: 'center',
        marginTop: `calc(52px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'})`
      }}
    >
      <Typography variant="h2" weight="bold">
        내가 찾는 모델
        <br />
        맞춤 페이지 제작
      </Typography>
      <Typography customStyle={{ marginTop: 12 }} color="ui60" variant="h4">
        내가 원하는 조건의 매물만
        <br />
        실시간으로 업데이트
      </Typography>
      <Flexbox
        customStyle={{ marginTop: 52, position: 'relative' }}
        alignment="center"
        justifyContent="center"
      >
        <Image
          width={innerHeight < 700 ? '90%' : '100%'}
          height="auto"
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/butler/butler_demo_02.png`}
          alt="내가 찾는 모델 맞춤 페이지 제작"
          round={20}
          disableAspectRatio
        />
        <Box
          customStyle={{
            background: 'white',
            width: '100%',
            height: 80,
            position: 'absolute',
            bottom: -43
          }}
        />
        {currentSection >= 1 && (
          <>
            <BubbleText top={114} left={70} order={2} size="xlarge">
              # 블랙
            </BubbleText>
            <BubbleText
              top={210}
              left={60}
              afterLeft={70}
              order={4}
              size="xlarge"
              customStyle={{ fontSize: 22 }}
            >
              # 새상품급
            </BubbleText>
            <BubbleText top={140} right={50} order={3} size="xlarge" customStyle={{ fontSize: 18 }}>
              # 카프스킨
            </BubbleText>
          </>
        )}
      </Flexbox>
    </Box>
  );
}

const BubbleText = styled(Chip)<{
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  afterLeft?: number;
  order: number;
  afterTop?: number;
}>`
  padding: 8px 14px;
  background: ${dark.palette.common.uiBlack};
  color: ${dark.palette.common.uiWhite};
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
  /* &:after {
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
  }}; */
`;

export default ButlerDemo02;
