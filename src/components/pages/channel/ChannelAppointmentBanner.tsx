import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

interface ChannelAppointmentBannerProps {
  dateAppointment: string;
}

function ChannelAppointmentBanner({ dateAppointment }: ChannelAppointmentBannerProps) {
  const router = useRouter();
  const { id } = router.query;

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClick = () => {
    logEvent(attrKeys.channel.CLICK_APPOINTMENT, {
      name: attrProperty.name.CHANNEL_DETAIL,
      att: 'EDIT'
    });

    router.push({
      pathname: `/channels/${id}/appointment`
    });
  };

  return (
    <Flexbox
      justifyContent="space-between"
      gap={4}
      customStyle={{ padding: '12px 20px', backgroundColor: common.bg02 }}
    >
      <Flexbox
        gap={4}
        customStyle={{
          flexGrow: 1
        }}
      >
        <Icon name="TimeFilled" width={16} height={16} color="primary-light" />
        <Typography variant="body2" weight="medium">
          {dayjs(dateAppointment).format('MM월 DD일 A HH:mm에 직거래 약속이 있어요!')}
        </Typography>
      </Flexbox>
      <Typography
        variant="body2"
        weight="medium"
        onClick={handleClick}
        color="primary-light"
        customStyle={{
          textDecoration: 'underline'
        }}
      >
        약속 보기
      </Typography>
    </Flexbox>
  );
}

export default ChannelAppointmentBanner;
