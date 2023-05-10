import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Image, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function AppIntro04({ animationStart }: { animationStart: boolean }) {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClickLogin = () => {
    logEvent(attrKeys.intro.CLICK_LOGIN, {
      name: attrProperty.name.APP_INTRO,
      title: attrProperty.title.BOTTOM
    });

    router.push('/login');
  };

  useEffect(() => {
    logEvent(attrKeys.intro.VIEW_LOGIN_BUTTON, {
      name: attrProperty.name.APP_INTRO
    });
  }, []);

  return (
    <Flexbox
      alignment="center"
      direction="vertical"
      customStyle={{ height: 350, justifyContent: 'flex-end' }}
    >
      <Box customStyle={{ position: 'relative' }}>
        <Image
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/appIntro/legit_box.png`}
          alt="Legit Box Img"
          disableAspectRatio
          width={240}
        />
        {animationStart && (
          <>
            <TextBox type="origin" variant="h3" weight="bold" delay={0.3}>
              <Icon name="OpinionAuthenticOutlined" />
              정품의견
            </TextBox>
            <TextBox type="fake" variant="h3" weight="bold" delay={0.5}>
              <Icon name="OpinionFakeFilled" />
              가품의심
            </TextBox>
          </>
        )}
      </Box>
      <Box customStyle={{ textAlign: 'center' }}>
        <Typography variant="h1" weight="bold">
          사진으로 받는
          <br />
          정가품 의견
        </Typography>
        <Typography variant="h3" customStyle={{ marginTop: 12, color: common.ui60 }}>
          사기 전에 전문가에게 물어보세요
        </Typography>
      </Box>
      {animationStart && (
        <LoginButton
          fullWidth
          variant="solid"
          size="xlarge"
          customStyle={{ marginTop: 'auto', marginBottom: 20 }}
          onClick={handleClickLogin}
        >
          카멜 회원가입하기
        </LoginButton>
      )}
    </Flexbox>
  );
}

const TextBox = styled(Typography)<{ type: 'origin' | 'fake'; delay?: number }>`
  width: 113px;
  height: 40px;
  border-radius: 8px;
  background: ${({ type }) => (type === 'origin' ? '#373D8C' : '#8C2B33')};
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: ${({ type }) => (type === 'origin' ? 100 : 170)}px;
  left: ${({ type }) => (type === 'origin' ? -50 : '100%')}px;
  right: -50px;
  animation: slide-in-fwd-center 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation-delay: ${({ delay }) => delay || 0}s;
  @keyframes slide-in-fwd-center {
    0% {
      transform: translateZ(-1400px);
      opacity: 0;
    }
    100% {
      transform: translateZ(0);
      opacity: 1;
    }
  }
`;

const LoginButton = styled(Button)`
  position: absolute;
  bottom: 0;
  width: calc(100% - 40px);
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui60};
  animation: color 0.5s forwards;
  animation-delay: 1s;
  @keyframes color {
    100% {
      background: #2937ff;
    }
  }
`;

export default AppIntro04;
