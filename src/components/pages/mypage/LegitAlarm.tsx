import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { useMutation, useQueryClient } from 'react-query';
import { Flexbox, Switch } from 'mrcamel-ui';

import { Menu, MenuItem } from '@components/UI/molecules';

import { putAlarm } from '@api/user';

import queryKeys from '@constants/queryKeys';

import { AllAlarmControllState } from '@recoil/mypage';

function LegitAlarm({ alarm }: { alarm?: boolean }) {
  const queryClient = useQueryClient();
  const [isLegitAlarm, setIsLegitAlarm] = useState(false);
  const { mutate: switchAlarm } = useMutation(putAlarm);
  const [recoilAllAlarmCheck, setRecoilAllAlarmCheck] = useRecoilState(AllAlarmControllState);

  useEffect(() => {
    setIsLegitAlarm(!!alarm);
  }, [alarm]);

  const handleLegitSwitch = () => {
    setRecoilAllAlarmCheck({ ...recoilAllAlarmCheck, isNotiLegit: !isLegitAlarm });

    switchAlarm(
      {
        isNotiLegit: !isLegitAlarm
      },
      {
        onSuccess: () => {
          setIsLegitAlarm((props) => !props);
          queryClient.invalidateQueries(queryKeys.users.alarms(), { refetchInactive: true });
        }
      }
    );
  };

  const infoMenu = [
    {
      label: '감정 의뢰 알림',
      check: isLegitAlarm,
      onSwitch: handleLegitSwitch
    }
  ];
  return (
    <Menu title="감정 알림" gap={12}>
      {infoMenu.map(({ label, check, onSwitch }) => (
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

export default LegitAlarm;
