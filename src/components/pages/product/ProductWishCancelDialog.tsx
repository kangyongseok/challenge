import { Box, Button, Dialog, Flexbox, Typography } from '@mrcamelhub/camel-ui';

interface ProductWishCancelDialogProps {
  open: boolean;
  setOpenRemoveWishDialog: (parameter: boolean) => void;
  submit: () => void;
}

function ProductWishCancelDialog({
  open,
  setOpenRemoveWishDialog,
  submit
}: ProductWishCancelDialogProps) {
  return (
    <Dialog open={open} onClose={() => setOpenRemoveWishDialog(false)}>
      <Box
        customStyle={{
          width: 285
        }}
      >
        <Typography
          weight="medium"
          customStyle={{
            textAlign: 'center',
            padding: '24px 0'
          }}
        >
          찜을 취소하시겠어요?
        </Typography>
        <Flexbox gap={8}>
          <Button
            fullWidth
            variant="ghost"
            brandColor="primary"
            customStyle={{ marginTop: 10 }}
            onClick={() => setOpenRemoveWishDialog(false)}
          >
            취소
          </Button>
          <Button
            fullWidth
            variant="solid"
            brandColor="primary"
            customStyle={{ marginTop: 10 }}
            onClick={submit}
          >
            확인
          </Button>
        </Flexbox>
      </Box>
    </Dialog>
  );
}

export default ProductWishCancelDialog;
