import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { BottomSheet, Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

import Image from '@components/UI/atoms/Image';

import { checkAgent } from '@utils/common';

import { loginBottomSheetState } from '@recoil/common';

function LoginBottomSheet() {
  const {
    theme: { palette }
  } = useTheme();
  const router = useRouter();
  const [open, setOpen] = useRecoilState(loginBottomSheetState);
  const handleClickLogin = () => {
    router.push({
      pathname: '/login',
      query: { returnUrl: `${router.asPath}?login=success` }
    });
  };

  return (
    <BottomSheet
      open={open}
      onClose={() => setOpen(false)}
      disableSwipeable
      customStyle={{ padding: '52px 20px 32px 20px', textAlign: 'center' }}
    >
      <Flexbox gap={10} alignment="center" justifyContent="center">
        <Icon name="Logo_45_45" width={36} height={31} />
        <Icon name="LogoText_96_20" width={124} height={31} />
      </Flexbox>
      <Typography customStyle={{ margin: '20px 0 ' }}>
        꿀매물과 가격변동 알림부터
        <br />내 주변, 내 사이즈 매물만 보기까지!
      </Typography>
      <Typography>로그인하고 득템하세요 🙌</Typography>
      <Flexbox direction="vertical" gap={8} customStyle={{ marginTop: 32 }}>
        <Button
          fullWidth
          size="large"
          startIcon={
            <Icon name="KakaoFilled" customStyle={{ color: `${palette.common.ui20} !important` }} />
          }
          customStyle={{ background: '#FEE500' }}
          variant="contained"
          onClick={handleClickLogin}
        >
          <Typography weight="medium" variant="h4">
            카카오톡으로 계속하기
          </Typography>
        </Button>
        <Button
          fullWidth
          size="large"
          customStyle={{ background: palette.secondary.blue.light, color: palette.common.uiWhite }}
          variant="contained"
          onClick={handleClickLogin}
        >
          <Image
            width={20}
            height={20}
            disableAspectRatio
            src={`https://${process.env.IMAGE_DOMAIN}/assets/img/login-facebook-icon.png`}
            alt="Kakao Logo Img"
          />
          페이스북으로 계속하기
        </Button>
        {checkAgent.isIOSApp() && (
          <Button
            fullWidth
            size="large"
            variant="outlined"
            startIcon={<Icon name="BrandAppleFilled" />}
            customStyle={{ border: `1px solid ${palette.common.ui20}` }}
            onClick={handleClickLogin}
          >
            Apple로 계속하기
          </Button>
        )}
        <Button fullWidth customStyle={{ border: 'none', margin: '20px 0', textAlign: 'center' }}>
          <Typography variant="h4" weight="medium" customStyle={{ color: palette.common.ui60 }}>
            로그인하지 않고 둘러보기
          </Typography>
        </Button>
      </Flexbox>
    </BottomSheet>
  );
}

export default LoginBottomSheet;
