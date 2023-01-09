import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { useMutation, useQueryClient } from 'react-query';
import { Flexbox, Switch } from 'mrcamel-ui';

import { Menu, MenuItem } from '@components/UI/molecules';

import { putAlarm } from '@api/user';

import queryKeys from '@constants/queryKeys';

import { AllAlarmControllState } from '@recoil/mypage';

function SellerProductAlarm({ alarm }: { alarm?: boolean }) {
  const queryClient = useQueryClient();
  const [isSellerProductAlarm, setIsSellerProductAlarm] = useState(false);
  const [recoilAllAlarmCheck, setRecoilAllAlarmCheck] = useRecoilState(AllAlarmControllState);
  const { mutate: switchAlarm } = useMutation(putAlarm);

  useEffect(() => {
    setIsSellerProductAlarm(!!alarm);
  }, [alarm]);

  const handleSellerProductSwitch = () => {
    setRecoilAllAlarmCheck({ ...recoilAllAlarmCheck, isNotiMyProductWish: !isSellerProductAlarm });
    switchAlarm(
      {
        isNotiMyProductWish: !isSellerProductAlarm
      },
      {
        onSuccess: () => {
          setIsSellerProductAlarm((props) => !props);
          queryClient.invalidateQueries(queryKeys.users.alarms(), { refetchInactive: true });
        }
      }
    );
  };

  const infoMenu = [
    {
      label: '내 매물 찜 되었을 때',
      check: isSellerProductAlarm,
      onSwitch: handleSellerProductSwitch
    }
  ];

  return (
    <Menu title="판매 매물" gap={12}>
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

export default SellerProductAlarm;
