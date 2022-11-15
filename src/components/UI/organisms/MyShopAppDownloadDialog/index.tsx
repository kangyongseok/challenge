import { useRecoilState } from 'recoil';
import { Button, Dialog, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import { handleClickAppDownload } from '@utils/common';

import { camelSellerDialogStateFamily } from '@recoil/camelSeller';

function MyShopAppDownloadDialog() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const [openAppDown, setOpenAppDown] = useRecoilState(
    camelSellerDialogStateFamily('nonMemberAppdown')
  );
  return (
    <Dialog
      open={openAppDown.open}
      onClose={() =>
        setOpenAppDown(({ type }) => ({
          type,
          open: false
        }))
      }
      customStyle={{ width: '100%' }}
    >
      <Typography customStyle={{ textAlign: 'center' }} weight="bold" variant="h3">
        판매하시려면
      </Typography>
      <Typography customStyle={{ textAlign: 'center' }} weight="bold" variant="h3">
        카멜 앱이 필요해요
      </Typography>
      <Typography customStyle={{ textAlign: 'center', marginTop: 8 }} variant="h4">
        지금 바로 앱을 다운받아볼까요?
      </Typography>
      <Flexbox customStyle={{ marginTop: 32 }} gap={8} direction="vertical">
        <Button
          fullWidth
          variant="contained"
          brandColor="primary"
          onClick={() => handleClickAppDownload({})}
          size="large"
        >
          카멜 앱 다운로드
        </Button>
        <Button
          fullWidth
          variant="contained"
          customStyle={{ background: common.ui95, color: common.ui20 }}
          size="large"
          onClick={() =>
            setOpenAppDown(({ type }) => ({
              type,
              open: false
            }))
          }
        >
          취소
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default MyShopAppDownloadDialog;
