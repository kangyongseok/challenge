import { useRouter } from 'next/router';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Typography } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

interface CamelSellerNotiChannelDialogProps {
  open: boolean;
}

function CamelSellerNotiChannelDialog({ open }: CamelSellerNotiChannelDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open}>
      <Typography customStyle={{ fontSize: 52 }}>🫢</Typography>
      <Typography weight="bold" variant="h3" customStyle={{ marginTop: 32 }}>
        채팅알림이 꺼져있어요!
      </Typography>
      <Typography variant="h4" customStyle={{ marginTop: 8 }}>
        알림이 꺼져있으면 채팅을 받을 수 없어요.
      </Typography>
      <Button
        fullWidth
        variant="solid"
        brandColor="primary"
        size="large"
        onClick={() => {
          logEvent(attrKeys.camelSeller.CLICK_ALARM, {
            name: attrProperty.name.ALARM_POPUP,
            title: 'ALARM'
          });

          router.push('/mypage/settings/alarm?setting=true');
        }}
        customStyle={{
          marginTop: 20
        }}
      >
        채팅알림 켜기
      </Button>
    </Dialog>
  );
}

export default CamelSellerNotiChannelDialog;
