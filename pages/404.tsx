import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { CtaButton, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

function Error404() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClick = () => {
    logEvent(attrKeys.commonEvent.clickBack, {
      name: 'ERROR',
      title: 404
    });
    router.back();
  };

  useEffect(() => {
    logEvent(attrKeys.commonEvent.scriptError, {
      title: 404,
      userAgent: window.navigator.userAgent,
      url: window.location.href
    });
  }, []);

  return (
    <Flexbox customStyle={{ height: '100vh', backgroundColor: common.grey['98'] }}>
      <Flexbox
        direction="vertical"
        alignment="center"
        customStyle={{ width: '100%', padding: '0 20px' }}
      >
        <Icon name="Logo_45_45" customStyle={{ marginTop: 24 }} />
        <Camel />
        <Typography customStyle={{ marginTop: 24 }}>존재하지 않는 페이지네요.</Typography>
        <Typography>깔끔한 경험을 드리지 못해 죄송합니다😔</Typography>
        <Typography variant="h4" weight="bold" customStyle={{ marginTop: 16 }}>
          카멜에게 지금 상황을 알려주시겠어요?
        </Typography>
        <Flexbox direction="vertical" gap={12} customStyle={{ width: '100%', marginTop: 24 }}>
          <CtaButton
            variant="contained"
            brandColor="primary"
            fullWidth
            onClick={() => window.open('http://pf.kakao.com/_mYdxexb/chat')}
          >
            불편한 점 알려주기
          </CtaButton>
          <CtaButton variant="outlined" fullWidth onClick={handleClick}>
            이전 페이지 이동
          </CtaButton>
        </Flexbox>
        <Typography variant="body2" customStyle={{ marginTop: 16, color: common.grey['60'] }}>
          * 오류를 알려주신 분께 감사의 의미로 기프티콘을 드립니다.
        </Typography>
      </Flexbox>
    </Flexbox>
  );
}

const Camel = styled.div`
  display: block;
  width: 100%;
  max-width: 345px;
  height: 313px;
  background-size: 100%;
  background-image: url('https://${process.env.IMAGE_DOMAIN}/assets/images/ico/error_page.png');
  background-repeat: no-repeat;
`;

export default Error404;
