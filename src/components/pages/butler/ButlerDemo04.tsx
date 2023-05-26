import { useEffect, useState } from 'react';

import { Box, Flexbox, Image, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { IOS_SAFE_AREA_TOP } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

function ButlerDemo04({ currentSection }: { currentSection: number }) {
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
        개인 맞춤 필터로
        <br />
        최저가 매물 구매까지
      </Typography>
      <Typography customStyle={{ marginTop: 12 }} color="ui60" variant="h4">
        실시간으로 요청사항을 전달하고
        <br />
        구매 요청까지 한번에
      </Typography>
      <Flexbox
        customStyle={{ marginTop: 52, position: 'relative' }}
        alignment="center"
        justifyContent="center"
      >
        <Image
          width={innerHeight < 700 ? '90%' : '100%'}
          height="auto"
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/butler/butler_demo_04.png`}
          alt="개인 맞춤 필터로 최저가 매물 구매까지"
          round={20}
          disableAspectRatio
        />
        {currentSection === 3 && (
          <ScaleUp>
            <Image
              width="100%"
              height="auto"
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/butler/butler_demo_04-1.png`}
              alt="구매 요청하기"
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

const ScaleUp = styled.div`
  position: absolute;
  left: 0;
  bottom: 45px;
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

export default ButlerDemo04;
