import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { useMutation, useQueryClient } from 'react-query';
import { Flexbox, Switch } from 'mrcamel-ui';

import { Menu, MenuItem } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { putAlarm } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

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
    logEvent(attrKeys.mypage.CLICK_SELLER_ALARM, {
      title: attrProperty.title.WISH,
      att: isSellerProductAlarm ? 'OFF' : 'ON'
    });
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

  return (
    <Menu title="판매 매물" gap={12}>
      <MenuItem
        weight="regular"
        action={
          <Flexbox gap={4} alignment="center">
            <Switch checked={isSellerProductAlarm} onChange={handleSellerProductSwitch} />
          </Flexbox>
        }
      >
        내 매물 찜 되었을 때
      </MenuItem>
    </Menu>
  );
}

export default SellerProductAlarm;
