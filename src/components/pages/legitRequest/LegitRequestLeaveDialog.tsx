import { useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

import { SAVED_LEGIT_REQUEST } from '@constants/localStorage';

import { legitRequestState, productLegitParamsState } from '@recoil/legitRequest';
import useQueryUserData from '@hooks/useQueryUserData';

function LegitRequestLeaveDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const legitRequest = useRecoilValue(legitRequestState);
  const productLegitParams = useRecoilValue(productLegitParamsState);

  const { set: setUserDate } = useQueryUserData();

  useEffect(() => {
    router.beforePopState(() => {
      if (legitRequest.productId) {
        setOpen(true);
        return false;
      }
      return true;
    });
  }, [router, legitRequest.productId]);

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <Typography variant="h3" weight="bold">
        사진감정 신청을 중단하시겠습니까?
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8
        }}
      >
        매물등록은 완료되며
        <br />
        사진감정은 &quot;마이&quot;에서 이어할 수 있습니다.
      </Typography>
      <Flexbox
        gap={8}
        customStyle={{
          marginTop: 20
        }}
      >
        <Button fullWidth variant="solid" brandColor="primary" size="large">
          취소
        </Button>
        <Button
          fullWidth
          variant="ghost"
          brandColor="black"
          size="large"
          onClick={() =>
            router
              .push(`/product/${legitRequest.productId}`, undefined, { shallow: true })
              .then(() => {
                setUserDate({
                  [SAVED_LEGIT_REQUEST]: {
                    state: legitRequest,
                    params: productLegitParams,
                    showToast: !router.query.already
                  }
                });
              })
          }
        >
          확인
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default LegitRequestLeaveDialog;
