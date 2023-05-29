import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Typography } from '@mrcamelhub/camel-ui';

import { handleClickAppDownload } from '@utils/common';

interface LegitRequestOnlyInAppDialogProps {
  open: boolean;
  onClose: () => void;
}

function LegitRequestOnlyInAppDialog({ open, onClose }: LegitRequestOnlyInAppDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <Typography variant="h3" weight="bold">
        사진으로 감정신청은
        <br />
        App에서만 진행할 수 있어요!
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8
        }}
      >
        카멜App에서 사진으로 간편하게
        <br />
        실시간 정가품의견 받아보세요
      </Typography>
      <Button
        fullWidth
        variant="solid"
        brandColor="primary"
        size="large"
        onClick={() => {
          handleClickAppDownload({});
          onClose();
        }}
        customStyle={{
          marginTop: 20
        }}
      >
        3초 앱 다운로드
      </Button>
    </Dialog>
  );
}

export default LegitRequestOnlyInAppDialog;
