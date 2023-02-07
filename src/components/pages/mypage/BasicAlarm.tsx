import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { Flexbox, Switch, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Menu, MenuItem } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { putAlarm } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import { AllAlarmControllState } from '@recoil/mypage';

function BasicAlarm({
  eventAlarm,
  nightAlarm,
  date
}: {
  eventAlarm?: boolean;
  nightAlarm?: boolean;
  date?: string;
}) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const queryClient = useQueryClient();
  const [isAgree, setIsAgree] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [recoilAllAlarmCheck, setRecoilAllAlarmCheck] = useRecoilState(AllAlarmControllState);

  const { mutate: switchAlarm } = useMutation(putAlarm, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.alarms(),
        refetchType: 'inactive'
      });
    }
  });

  useEffect(() => {
    setIsAgree(!!eventAlarm);
    setIsNight(!!nightAlarm);
  }, [eventAlarm, nightAlarm]);

  const handleAlarmSwitch = () => {
    const { CLICK_PUSH_ON, CLICK_PUSH_OFF } = attrKeys.mypage;
    logEvent(!isAgree ? CLICK_PUSH_ON : CLICK_PUSH_OFF);

    setRecoilAllAlarmCheck({ ...recoilAllAlarmCheck, isNotiEvent: !isAgree });
    switchAlarm(
      {
        isNotiEvent: !isAgree
      },
      {
        onSuccess: () => {
          setIsAgree((props) => !props);
        }
      }
    );
  };

  const handleNightSwitch = () => {
    logEvent(attrKeys.mypage.CLICK_NIGHT_ALARM, {
      name: 'MY',
      att: !isNight ? 'YES' : 'NO'
    });

    setRecoilAllAlarmCheck({ ...recoilAllAlarmCheck, isNotiNotNight: !isNight });
    switchAlarm(
      {
        isNotiNotNight: !isNight
      },
      {
        onSuccess: () => {
          setIsNight((props) => !props);
        }
      }
    );
  };

  const infoMenu = [
    {
      label: '야간 방해 금지모드',
      check: isNight,
      onSwitch: handleNightSwitch,
      infoText: '10시 이후 모든 알림을 아침에 받겠습니다'
    },
    {
      label: '이벤트 및 혜택 알림',
      check: isAgree,
      onSwitch: handleAlarmSwitch,
      infoText: date
        ? `(${dayjs(date).format('YYYY.M.D')} 마케팅 수신 ${isAgree ? '동의' : '미동의'})`
        : ''
    }
  ];

  return (
    <Menu title="기본 알림" gap={12}>
      {infoMenu.map(({ label, check, onSwitch, infoText }) => (
        <MenuItem
          key={`info-menu-${label}`}
          weight="regular"
          action={
            <Flexbox gap={4} alignment="center" customStyle={{ marginTop: -20 }}>
              <Switch checked={check} onChange={onSwitch} />
            </Flexbox>
          }
        >
          {label}
          <Typography variant="small1" customStyle={{ color: common.ui60, marginTop: 6 }}>
            {infoText}
          </Typography>
        </MenuItem>
      ))}
    </Menu>
  );
}

export default BasicAlarm;
