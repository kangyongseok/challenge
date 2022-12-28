import { useRouter } from 'next/router';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { MESSAGE_APPOINTMENT_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

interface ChannelAppointmentBannerProps {
  dateAppointment: string;
}

function ChannelAppointmentBanner({ dateAppointment }: ChannelAppointmentBannerProps) {
  const {
    theme: { palette }
  } = useTheme();
  const router = useRouter();

  const handleClickViewAppointment = () => {
    logEvent(attrKeys.channel.CLICK_APPOINTMENT, {
      name: attrProperty.name.CHANNEL_DETAIL,
      att: 'EDIT'
    });

    router
      .push({
        pathname: `/channels/${router.query.id}/appointment`
      })
      .then(() => {
        if (checkAgent.isIOSApp()) window.webkit?.messageHandlers?.callInputHide?.postMessage?.(0);
      });
  };

  return (
    <Flexbox customStyle={{ minHeight: MESSAGE_APPOINTMENT_BANNER_HEIGHT, position: 'relative' }}>
      <Banner>
        <Icon name="DateFilled" size="small" color={palette.primary.light} />
        <AppointmentDesc variant="body2" weight="medium">
          {dayjs(dateAppointment).format('MM월 DD일 A HH:mm에 직거래 약속이 있어요!')}
        </AppointmentDesc>
        <Appointment variant="body2" weight="medium" onClick={handleClickViewAppointment}>
          약속 보기
        </Appointment>
      </Banner>
    </Flexbox>
  );
}

const Banner = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 20px;
  gap: 4px;
  width: 100%;
  background-color: ${({ theme: { palette } }) => palette.common.bg02};
`;

const AppointmentDesc = styled(Typography)`
  flex: 1;
  color: ${({ theme: { palette } }) => palette.primary.light};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Appointment = styled(Typography)`
  color: ${({ theme: { palette } }) => palette.primary.light};
  text-decoration: underline;
`;

export default ChannelAppointmentBanner;
