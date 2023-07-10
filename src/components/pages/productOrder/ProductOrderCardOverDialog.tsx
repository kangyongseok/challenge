import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Typography } from '@mrcamelhub/camel-ui';

import { getTenThousandUnitPrice } from '@utils/formats';

import useQueryProductOrder from '@hooks/useQueryProductOrder';

function ProductOrderCardOverDialog({ includeLegit }: { includeLegit: boolean }) {
  const router = useRouter();
  const { id } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);

  const { data: { price } = {} } = useQueryProductOrder({ productId, includeLegit });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (getTenThousandUnitPrice(price || 0) > 3500) {
      setOpen(true);
    }
  }, [price]);

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <Typography weight="bold" variant="h3">
        가상계좌로만 결제할 수 있어요.
      </Typography>
      <Typography variant="h4" customStyle={{ marginTop: 8 }}>
        결제금액이 3,500만원 이상인 경우
        <br />
        카드결제가 불가능해요.
      </Typography>
      <Button
        fullWidth
        variant="solid"
        brandColor="black"
        size="large"
        onClick={() => setOpen(false)}
        customStyle={{ marginTop: 32 }}
      >
        확인했어요
      </Button>
    </Dialog>
  );
}

export default ProductOrderCardOverDialog;
