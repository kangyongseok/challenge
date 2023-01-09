import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { useMutation, useQueryClient } from 'react-query';
import { Flexbox, Switch } from 'mrcamel-ui';

import { Menu, MenuItem } from '@components/UI/molecules';

import { putAlarm } from '@api/user';

import queryKeys from '@constants/queryKeys';

import { AllAlarmControllState } from '@recoil/mypage';

function ChatAlarm({ alarm }: { alarm?: boolean }) {
  const queryClient = useQueryClient();
  const [isChatAlarm, setChatAlarm] = useState(false);
  const [recoilAllAlarmCheck, setRecoilAllAlarmCheck] = useRecoilState(AllAlarmControllState);

  const { mutate: switchAlarm } = useMutation(putAlarm, {
    onSuccess: () => {
      setChatAlarm((props) => !props);
      queryClient.invalidateQueries(queryKeys.users.alarms(), { refetchInactive: true });
    }
  });

  useEffect(() => {
    setChatAlarm(!!alarm);
  }, [alarm]);

  const handleChange = () => {
    setRecoilAllAlarmCheck({ ...recoilAllAlarmCheck, isNotiChannel: !isChatAlarm });
    switchAlarm({
      isNotiChannel: !isChatAlarm
    });
  };

  const infoMenu = [
    {
      label: '메세지 받았을 때',
      check: isChatAlarm,
      onSwitch: handleChange
    }
  ];

  return (
    <Menu title="채팅 알림" gap={12}>
      {infoMenu.map(({ label, onSwitch, check }) => (
        <MenuItem
          key={`info-menu-${label}`}
          weight="regular"
          action={
            <Flexbox gap={4} alignment="center">
              <Switch checked={check} onChange={onSwitch} />
            </Flexbox>
          }
        >
          {label}
        </MenuItem>
      ))}
    </Menu>
  );
}

export default ChatAlarm;
