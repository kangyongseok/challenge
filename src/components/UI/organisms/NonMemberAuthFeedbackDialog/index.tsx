import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Typography } from '@mrcamelhub/camel-ui';

interface NonMemberAuthFeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

function NonMemberAuthFeedbackDialog({
  open,
  onClose,
  title = '인증에 실패했어요.',
  description
}: NonMemberAuthFeedbackDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <Typography variant="h3" weight="bold" dangerouslySetInnerHTML={{ __html: title }} />
      {description && (
        <Typography
          variant="h4"
          dangerouslySetInnerHTML={{ __html: description }}
          customStyle={{
            marginTop: 8
          }}
        />
      )}
      <Button
        variant="solid"
        brandColor="black"
        size="large"
        fullWidth
        onClick={onClose}
        customStyle={{
          marginTop: 32
        }}
      >
        확인
      </Button>
    </Dialog>
  );
}

export default NonMemberAuthFeedbackDialog;
