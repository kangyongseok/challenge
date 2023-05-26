import { useEffect, useState } from 'react';

import { Box, Flexbox, Image, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { IOS_SAFE_AREA_TOP } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

function ButlerDemo03({ currentSection }: { currentSection: number }) {
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
        중고 실거래가 스캐너
      </Typography>
      <Typography customStyle={{ marginTop: 12 }} color="ui60" variant="h4">
        중고 거래가와 새상품 가격을
        <br />
        한번에 볼 수 있어요
      </Typography>
      <Flexbox
        customStyle={{ marginTop: 52, position: 'relative' }}
        alignment="center"
        justifyContent="center"
      >
        <Image
          width={innerHeight < 700 ? '90%' : '100%'}
          height="auto"
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/butler/butler_demo_03.png`}
          alt="내가 찾는 모델 맞춤 페이지 제작"
          round={20}
          disableAspectRatio
        />
        {currentSection >= 2 && (
          <ScaleUp innerHeight={innerHeight < 700}>
            <Image
              width={innerHeight < 700 ? '90%' : '100%'}
              height="auto"
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/butler/butler_demo_03-2.png`}
              alt="내가 찾는 모델 맞춤 페이지 제작"
              round={20}
              disableAspectRatio
            />
          </ScaleUp>
        )}
        <Box
          customStyle={{
            background: 'white',
            width: '100%',
            height: 80,
            position: 'absolute',
            bottom: -43
          }}
        />
      </Flexbox>
    </Box>
  );
}

const ScaleUp = styled.div<{ innerHeight: boolean }>`
  position: absolute;
  top: ${({ innerHeight }) => (innerHeight ? '90px' : '113px')};
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scale-in-center 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation-delay: 1s;

  @keyframes scale-in-center {
    0% {
      transform: scale(0);
      transform-origin: 50% 50%;
      opacity: 0;
    }
    100% {
      transform: scale(1);
      transform-origin: 50% 50%;
      opacity: 1;
    }
  }
`;

export default ButlerDemo03;
