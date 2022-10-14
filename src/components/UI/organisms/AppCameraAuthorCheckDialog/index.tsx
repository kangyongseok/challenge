import { useRecoilState } from 'recoil';
import { Button, Dialog, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import { checkAgent } from '@utils/common';

import { camelSellerDialogStateFamily } from '@recoil/camelSeller';

function AppCameraAuthorCheckDialog() {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const [openCameraSetting, setOpenCameraSetting] = useRecoilState(
    camelSellerDialogStateFamily('cameraAuth')
  );

  const handleClickMoveToSetting = () => {
    // 브릿지 호출
    if (
      checkAgent.isIOSApp() &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callMoveToSetting &&
      window.webkit.messageHandlers.callMoveToSetting.postMessage
    ) {
      window.webkit.messageHandlers.callMoveToSetting.postMessage(0);
    }
  };

  const handleClickCancel = () => {
    // 모달 닫음
    setOpenCameraSetting(({ type }) => ({
      type,
      open: false
    }));
  };

  return (
    <Dialog
      open={openCameraSetting.open}
      onClose={handleClickCancel}
      customStyle={{ width: '311px', padding: '32px 20px' }}
    >
      <Typography variant="h3" customStyle={{ textAlign: 'center' }} weight="bold">
        모든 사진 권한 및 카메라 권한을
      </Typography>
      <Typography variant="h3" customStyle={{ textAlign: 'center' }} weight="bold">
        설정해주세요.
      </Typography>
      <Typography variant="h4" customStyle={{ textAlign: 'center', marginTop: 8 }}>
        내 물건의 사진을 등록하려면
        <br />
        권한이 필요해요
      </Typography>
      <Flexbox customStyle={{ marginTop: 16 }} gap={8} direction="vertical">
        <Button
          fullWidth
          variant="contained"
          brandColor="primary"
          onClick={handleClickMoveToSetting}
          size="large"
        >
          설정으로 이동
        </Button>
        <Button
          fullWidth
          variant="contained"
          customStyle={{ background: common.ui95, color: primary.main }}
          onClick={handleClickCancel}
          size="large"
        >
          취소
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default AppCameraAuthorCheckDialog;
