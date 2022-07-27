import { useEffect } from 'react';

import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

import OnboardingBottomCTA from './OnboardingBottomCTA';

interface OnboardingWelcomeProps {
  onClick: () => void;
}

function OnboardingWelcome({ onClick }: OnboardingWelcomeProps) {
  const {
    theme: { palette }
  } = useTheme();
  const { data: accessUser } = useQueryAccessUser();

  useEffect(() => {
    logEvent(attrKeys.welcome.VIEW_WELCOME);
  }, []);

  const handleClick = () => {
    logEvent(attrKeys.welcome.CLICK_PERSONAL_INPUT, {
      name: attrProperty.productName.WELCOME
    });
    onClick();
  };

  return (
    <>
      <Flexbox direction="vertical">
        <OnboardingWelcomeImg src="images/onboardingWelcome.png" alt="onboardingWelcome.png" />
      </Flexbox>
      <Box customStyle={{ padding: '24px 20px 32px', flex: 1 }}>
        <Typography
          variant="h2"
          weight="bold"
          customStyle={{ '& > span': { color: palette.primary.main } }}
        >
          <span>카멜</span>에 오신 것을 <span>환영</span>합니다 🎉
        </Typography>
        <Typography
          variant="h4"
          weight="medium"
          customStyle={{ color: palette.common.grey['60'], marginTop: 4 }}
        >
          {accessUser?.userName || '회원'}님에 대해서 알려주시면,
          <br />더 편하게 매물 찾도록 도와드릴게요
        </Typography>
      </Box>
      <OnboardingBottomCTA onClick={handleClick}>카멜 시작하기</OnboardingBottomCTA>
    </>
  );
}

const OnboardingWelcomeImg = styled.img``;

export default OnboardingWelcome;
