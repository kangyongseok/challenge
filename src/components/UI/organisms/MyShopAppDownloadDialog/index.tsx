import { useRecoilState } from 'recoil';
import { Button, Dialog, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import { handleClickAppDownload } from '@utils/common';

import { camelSellerDialogStateFamily } from '@recoil/camelSeller';

function MyShopAppDownloadDialog() {
  const {
    theme: {
      palette: { primary }
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
      <Typography customStyle={{ textAlign: 'center' }} weight="medium">
        상품등록을 하려면 모바일앱이 필요해요.
      </Typography>
      <Typography customStyle={{ textAlign: 'center' }} weight="medium">
        카멜 앱을 다운받아보세요.
      </Typography>
      <Flexbox customStyle={{ marginTop: 16 }} gap={8} direction="vertical">
        <Button
          fullWidth
          variant="contained"
          brandColor="primary"
          onClick={() => handleClickAppDownload({})}
        >
          카멜 앱 다운로드
        </Button>
        <Button
          fullWidth
          variant="contained"
          customStyle={{ background: primary.highlight, color: primary.main }}
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
