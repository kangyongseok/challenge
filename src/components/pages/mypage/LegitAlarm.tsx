import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { Flexbox, Switch } from 'mrcamel-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Menu, MenuItem } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { putAlarm } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

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
    logEvent(attrKeys.mypage.CLICK_LEGIT_ALARM, {
      title: attrProperty.title.NEW_LEGIT,
      att: isLegitAlarm ? 'OFF' : 'ON'
    });
    setRecoilAllAlarmCheck({ ...recoilAllAlarmCheck, isNotiLegit: !isLegitAlarm });

    switchAlarm(
      {
        isNotiLegit: !isLegitAlarm
      },
      {
        onSuccess: () => {
          setIsLegitAlarm((props) => !props);
          queryClient.invalidateQueries({
            queryKey: queryKeys.users.alarms(),
            refetchType: 'inactive'
          });
        }
      }
    );
  };

  return (
    <Menu title="감정 알림" gap={12}>
      <MenuItem
        weight="regular"
        action={
          <Flexbox gap={4} alignment="center">
            <Switch checked={isLegitAlarm} onChange={handleLegitSwitch} />
          </Flexbox>
        }
      >
        감정 의뢰 알림
      </MenuItem>
    </Menu>
  );
}

export default LegitAlarm;
