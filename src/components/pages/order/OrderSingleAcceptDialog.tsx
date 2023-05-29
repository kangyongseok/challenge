import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { postOrderApprove } from '@api/order';

function OrderSingleAcceptDialog({
  open,
  setOpenAcceptDialog,
  setApproval
}: {
  open: boolean;
  setOpenAcceptDialog: (value: boolean) => void;
  setApproval: (value: boolean) => void;
}) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const { query } = useRouter();

  const { mutate: approveMutate } = useMutation(postOrderApprove);

  const handleClickApprove = () => {
    approveMutate(Number(query.id), {
      onSuccess() {
        setApproval(true);
        setOpenAcceptDialog(false);
      }
    });
  };

  return (
    <Dialog open={open}>
      <Typography weight="bold" variant="h3" textAlign="center">
        안전결제 요청을 수락할까요?
      </Typography>
      <Typography variant="h4" textAlign="center" customStyle={{ marginTop: 8 }}>
        상품을 보내주시면
        <br />
        카멜이 확인 후 정산해드려요.
      </Typography>
      <Flexbox
        customStyle={{ background: common.bg02, borderRadius: 8, padding: 13, margin: '32px 0' }}
        gap={8}
        direction="vertical"
      >
        <Flexbox alignment="flex-start" gap={5}>
          <Icon
            name="CheckCircleFilled"
            customStyle={{ minWidth: 16, maxWidth: 16, height: 16 }}
            color="primary-light"
          />
          <Typography variant="body2">
            등록한 사진, 내용(상태, 구성품, 사이즈)을 기준으로 동일한 상품인지 확인합니다.
          </Typography>
        </Flexbox>
        <Flexbox alignment="center" gap={5}>
          <Icon
            name="CheckCircleFilled"
            customStyle={{ minWidth: 16, maxWidth: 16, height: 16 }}
            color="primary-light"
          />
          <Typography variant="body2">정가품여부를 확인합니다.</Typography>
        </Flexbox>
        <Flexbox alignment="center" gap={5}>
          <Icon
            name="BangCircleFilled"
            customStyle={{ minWidth: 18, maxWidth: 18, height: 18 }}
            color="red-light"
          />
          <Typography variant="body2">해당 과정에 문제가 있다면 반품됩니다.</Typography>
        </Flexbox>
      </Flexbox>
      <Button
        fullWidth
        size="large"
        brandColor="black"
        variant="solid"
        onClick={handleClickApprove}
      >
        수락하기
      </Button>
      <Button
        fullWidth
        size="large"
        brandColor="black"
        variant="ghost"
        customStyle={{ marginTop: 8 }}
        onClick={() => setOpenAcceptDialog(false)}
      >
        취소
      </Button>
    </Dialog>
  );
}

export default OrderSingleAcceptDialog;
