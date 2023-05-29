import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Typography } from '@mrcamelhub/camel-ui';

import { handleClickAppDownload } from '@utils/common';

interface FeatureIsMobileAppDownDialogProps {
  open: boolean;
  onClose: () => void;
}

function FeatureIsMobileAppDownDialog({ open, onClose }: FeatureIsMobileAppDownDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <Typography variant="h3" weight="bold">
        이 기능은 앱에서만 이용할 수 있어요!
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 7
        }}
      >
        지금 바로 앱을 다운받아볼까요?
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

export default FeatureIsMobileAppDownDialog;
