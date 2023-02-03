import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

interface Error500Props {
  logging?: boolean;
}

function Error500({ logging = true }: Error500Props) {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClick = () => {
    logEvent(attrKeys.commonEvent.CLICK_BACK, {
      name: 'ERROR',
      title: 500
    });
    window.location.replace('/');
  };

  useEffect(() => {
    if (logging) {
      logEvent(attrKeys.commonEvent.SCRIPT_ERROR, {
        title: 500,
        userAgent: window.navigator.userAgent,
        url: window.location.href
      });
    }
  }, [logging]);

  useEffect(() => {
    router.beforePopState(() => {
      window.location.replace('/');
      return false;
    });
  }, [router]);

  return (
    <GeneralTemplate customStyle={{ backgroundColor: common.ui98 }} hideAppDownloadBanner>
      <Flexbox
        direction="vertical"
        alignment="center"
        justifyContent="center"
        customStyle={{ flex: 1 }}
      >
        <Icon name="Logo_45_45" />
        <Camel />
        <Typography customStyle={{ marginTop: 24 }}>예상치 못한 오류가 발생했어요.</Typography>
        <Typography>깔끔한 경험을 드리지 못해 죄송합니다😔</Typography>
        <Typography variant="h4" weight="bold" customStyle={{ marginTop: 16 }}>
          카멜에게 어떤 오류였는지 알려주시겠어요?
        </Typography>
        <Flexbox direction="vertical" gap={12} customStyle={{ width: '100%', marginTop: 24 }}>
          <Button
            variant="solid"
            brandColor="primary"
            fullWidth
            onClick={() => window.open('http://pf.kakao.com/_mYdxexb/chat')}
          >
            불편한 점 알려주기
          </Button>
          <Button variant="outline" fullWidth onClick={handleClick}>
            이전 페이지 이동
          </Button>
        </Flexbox>
        <Typography variant="body2" customStyle={{ marginTop: 16, color: common.ui60 }}>
          * 오류를 알려주신 분께 감사의 의미로 기프티콘을 드립니다.
        </Typography>
      </Flexbox>
    </GeneralTemplate>
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

export default Error500;
