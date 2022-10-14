import { Box, Button, Flexbox, Icon, Typography, light, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

function MypageQnA() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClickQnAKakao = () => {
    logEvent(attrKeys.mypage.CLICK_KAKAOCH, {
      name: 'MY'
    });

    window.open('http://pf.kakao.com/_mYdxexb');
  };
  return (
    <Box
      customStyle={{
        padding: '32px 0 27px',
        borderBottom: `1px solid ${common.ui90}`
      }}
    >
      <Typography variant="h4" weight="bold" customStyle={{ color: common.ui20, marginBottom: 16 }}>
        문의
      </Typography>
      <Flexbox alignment="center" justifyContent="space-between" customStyle={{ marginBottom: 24 }}>
        <Box>
          <Title variant="body1" weight="medium">
            사용 중 불편한 점이 있으신가요?
          </Title>
          <Content variant="small1">카카오 채널로 문의하시면, 빠르게 답변 드릴게요!</Content>
        </Box>
        <KakaoButton
          startIcon={<Icon name="KakaoFilled" size="small" color={light.palette.common.ui20} />}
          onClick={handleClickQnAKakao}
        >
          <Typography variant="small1" customStyle={{ color: light.palette.common.ui20 }}>
            문의하기
          </Typography>
        </KakaoButton>
      </Flexbox>
    </Box>
  );
}

const Title = styled(Typography)`
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
`;

const Content = styled(Typography)`
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui60};
  margin-top: 4px;
`;

const KakaoButton = styled(Button)`
  background: #f6e14b;
  color: ${light.palette.common.ui20};
  border: none;
  width: 78px;
  height: 34px;
  gap: 4px;
  padding: 0;
`;

export default MypageQnA;
