import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { Flexbox, Switch } from 'mrcamel-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Menu, MenuItem } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { putAlarm } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import { AllAlarmControllState } from '@recoil/mypage';

function ChatAlarm({ alarm }: { alarm?: boolean }) {
  const queryClient = useQueryClient();
  const [isChatAlarm, setChatAlarm] = useState(false);
  const [recoilAllAlarmCheck, setRecoilAllAlarmCheck] = useRecoilState(AllAlarmControllState);

  const { mutate: switchAlarm } = useMutation(putAlarm, {
    onSuccess: () => {
      setChatAlarm((props) => !props);
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.alarms(),
        refetchType: 'inactive'
      });
    }
  });

  useEffect(() => {
    setChatAlarm(!!alarm);
  }, [alarm]);

  const handleChange = () => {
    logEvent(attrKeys.mypage.CLICK_CHANNEL_ALARM, { att: isChatAlarm ? 'OFF' : 'ON' });
    setRecoilAllAlarmCheck({ ...recoilAllAlarmCheck, isNotiChannel: !isChatAlarm });
    switchAlarm({
      isNotiChannel: !isChatAlarm
    });
  };

  return (
    <Menu title="채팅 알림" gap={12}>
      <MenuItem
        weight="regular"
        action={
          <Flexbox gap={4} alignment="center">
            <Switch checked={isChatAlarm} onChange={handleChange} />
          </Flexbox>
        }
      >
        메세지 받았을 때
      </MenuItem>
    </Menu>
  );
}

export default ChatAlarm;
