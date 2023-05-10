import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { toastState } from '@recoil/common';

interface ChannelReservingBannerProps {
  targetUserName: string;
  isSeller: boolean;
  hasLastMessage: boolean;
}

function ChannelReservingBanner({
  targetUserName,
  isSeller,
  hasLastMessage
}: ChannelReservingBannerProps) {
  const router = useRouter();
  const { id } = router.query;

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const setToastState = useSetRecoilState(toastState);

  const handleClick = () => {
    logEvent(attrKeys.channel.CLICK_APPOINTMENT, {
      name: attrProperty.name.CHANNEL_DETAIL,
      att: 'NEW'
    });

    if (!hasLastMessage) {
      setToastState({
        type: 'channel',
        status: 'disabledMakeAppointment',
        params: { userName: targetUserName }
      });

      return;
    }

    router.push({
      pathname: `/channels/${id}/appointment`
    });
  };

  return (
    <Flexbox
      alignment="flex-start"
      justifyContent="space-between"
      gap={4}
      customStyle={{
        padding: '12px 20px',
        backgroundColor: common.bg02
      }}
    >
      <Flexbox gap={4}>
        <Icon name="TimeFilled" width={16} height={16} color="primary-light" />
        <Flexbox direction="vertical" gap={2}>
          <Typography variant="body2" weight="medium">
            {targetUserName}님과 거래 예약을 했어요.
          </Typography>
          {!isSeller && (
            <Typography variant="body3" weight="medium" color="ui60">
              안전결제를 이용하면 사기 위험 없이 거래할 수 있어요.
            </Typography>
          )}
        </Flexbox>
      </Flexbox>
      <Typography
        variant="body2"
        weight="medium"
        color="primary-light"
        onClick={handleClick}
        customStyle={{
          textDecoration: 'underline'
        }}
      >
        직거래 약속
      </Typography>
    </Flexbox>
  );
}

export default ChannelReservingBanner;
