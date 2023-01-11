import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { useMutation, useQueryClient } from 'react-query';
import { Flexbox, Switch } from 'mrcamel-ui';

import { Menu, MenuItem } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { putAlarm } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import { AllAlarmControllState } from '@recoil/mypage';

function WishProductAlarm({
  wishAlarm,
  saveProductAlarm
}: {
  wishAlarm?: boolean;
  saveProductAlarm?: boolean;
}) {
  const queryClient = useQueryClient();
  const [isWishAlarm, setIsWishAlarm] = useState(false);
  const [isSaveAlarm, setIsSaveAlarm] = useState(false);
  const { mutate: switchAlarm } = useMutation(putAlarm, {
    onSuccess() {
      queryClient.invalidateQueries(queryKeys.users.alarms(), { refetchInactive: true });
    }
  });
  const [recoilAllAlarmCheck, setRecoilAllAlarmCheck] = useRecoilState(AllAlarmControllState);

  useEffect(() => {
    setIsWishAlarm(!!wishAlarm);
    setIsSaveAlarm(!!saveProductAlarm);
  }, [saveProductAlarm, wishAlarm]);

  const handleSaveProductsSwitch = () => {
    logEvent(attrKeys.mypage.CLICK_MYLIST_ALARM, { att: isSaveAlarm ? 'OFF' : 'ON' });
    setRecoilAllAlarmCheck({ ...recoilAllAlarmCheck, isNotiProductList: !isSaveAlarm });

    switchAlarm(
      {
        isNotiProductList: !isSaveAlarm
      },
      {
        onSuccess: () => {
          setIsSaveAlarm((props) => !props);
        }
      }
    );
  };

  const handleWishSwitch = () => {
    logEvent(attrKeys.mypage.CLICK_WISH_ALARM, { att: isWishAlarm ? 'OFF' : 'ON' });
    setRecoilAllAlarmCheck({ ...recoilAllAlarmCheck, isNotiProductWish: !isWishAlarm });

    switchAlarm(
      {
        isNotiProductWish: !isWishAlarm
      },
      {
        onSuccess: () => {
          setIsWishAlarm((props) => !props);
        }
      }
    );
  };

  const infoMenu = [
    {
      label: '저장한 매물 관련 알림',
      check: isSaveAlarm,
      onSwitch: handleSaveProductsSwitch
    },
    {
      label: '찜한 매물 관련 알림',
      check: isWishAlarm,
      onSwitch: handleWishSwitch
    }
  ];
  return (
    <Menu title="관심 매물 알림" gap={12}>
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

export default WishProductAlarm;
