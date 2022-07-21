import { Box, Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

function MypageQnA() {
  const {
    theme: { palette }
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
        borderBottom: `1px solid ${palette.common.grey['90']}`
      }}
    >
      <Typography
        variant="h4"
        weight="bold"
        customStyle={{ color: palette.common.grey['20'], marginBottom: 16 }}
      >
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
          startIcon={<Icon name="KakaoFilled" size="small" />}
          onClick={handleClickQnAKakao}
        >
          <Typography variant="small1">문의하기</Typography>
        </KakaoButton>
      </Flexbox>
    </Box>
  );
}

const Title = styled(Typography)`
  color: ${({ theme: { palette } }) => palette.common.grey['20']};
`;

const Content = styled(Typography)`
  color: ${({ theme: { palette } }) => palette.common.grey['40']};
  margin-top: 4px;
`;

const KakaoButton = styled(Button)`
  background: #f6e14b;
  color: ${({ theme: { palette } }) => palette.common.grey['20']};
  border: none;
  width: 78px;
  height: 34px;
  gap: 4px;
  padding: 0;
`;

export default MypageQnA;
