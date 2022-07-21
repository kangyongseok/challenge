import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, CtaButton, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

import { showAppDownloadBannerState } from '@recoil/common';

function AuthInfo() {
  const router = useRouter();
  const { id } = router.query;
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  return (
    <GeneralTemplate
      header={<Header />}
      footer={
        <Box customStyle={{ height: 89 }}>
          <Box
            customStyle={{
              position: 'fixed',
              bottom: 0,
              width: '100%',
              padding: 20,
              borderTop: `1px solid ${common.grey['90']}`
            }}
          >
            <CtaButton
              fullWidth
              variant="contained"
              brandColor="primary"
              size="large"
              onClick={() => router.push(`/products/${id}`)}
            >
              해당 매물로 돌아가기
            </CtaButton>
          </Box>
        </Box>
      }
    >
      <Flexbox
        direction="vertical"
        alignment="center"
        gap={20}
        customStyle={{
          height: `calc(100vh - ${
            showAppDownloadBanner ? 145 + APP_DOWNLOAD_BANNER_HEIGHT : 145
          }px)`
        }}
      >
        <Flexbox
          alignment="center"
          justifyContent="center"
          customStyle={{
            width: 52,
            height: 52,
            marginTop: 120,
            backgroundColor: primary.highlight,
            borderRadius: 20
          }}
        >
          😢
        </Flexbox>
        <Flexbox direction="vertical" customStyle={{ textAlign: 'center' }}>
          <Typography variant="h4" weight="bold">
            지금은 결과를 확인할 수 없습니다
          </Typography>
          <br />
          <Typography>
            카멜의 실시간 사진감정 <br />
            업그레이드 중입니다.
          </Typography>
          <br />
          <Typography>
            7월 25일,
            <br />더 업그레이드 된 모습으로 돌아오겠습니다.
          </Typography>
        </Flexbox>
      </Flexbox>
    </GeneralTemplate>
  );
}

export default AuthInfo;
