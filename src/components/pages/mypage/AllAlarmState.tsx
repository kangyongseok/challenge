import { useCallback, useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { Flexbox, Switch, Typography } from 'mrcamel-ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { AlarmsParams } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { fetchMyUserInfo, putAlarm } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import { AllAlarmControllState } from '@recoil/mypage';

function AllAlarmState({ alarmsInfo }: { alarmsInfo?: AlarmsParams }) {
  const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery(queryKeys.users.myUserInfo(), fetchMyUserInfo);
  const [recoilAllAlarmCheck, setRecoilAllAlarmCheck] = useRecoilState(AllAlarmControllState);
  const [allAlarm, setAllAlarm] = useState(false);
  const { mutate: switchAlarm } = useMutation(putAlarm, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.alarms(),
        refetchType: 'active'
      });
    }
  });

  const excludeAuthAlarm = useCallback(
    (alarmCheck: AlarmsParams) => {
      const isAuthLegit =
        myUserInfo?.roles?.includes('PRODUCT_LEGIT') ||
        myUserInfo?.roles?.includes('PRODUCT_LEGIT_HEAD');

      const allAlarmCheck = { ...alarmCheck };

      if (!isAuthLegit) {
        delete allAlarmCheck.isNotiLegit;
      }

      return allAlarmCheck;
    },
    [myUserInfo?.roles]
  );

  useEffect(() => {
    if (alarmsInfo) {
      const result = excludeAuthAlarm(alarmsInfo);
      const activeAlarmCheck = Object.values(result).filter((value) => typeof value !== 'string');
      setRecoilAllAlarmCheck(result);
      if (allAlarm !== activeAlarmCheck.includes(true)) {
        setAllAlarm(activeAlarmCheck.includes(true));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alarmsInfo, excludeAuthAlarm]);

  useEffect(() => {
    const result = excludeAuthAlarm(recoilAllAlarmCheck);
    const activeAlarmCheck = Object.values(result).filter((value) => typeof value !== 'string');
    if (allAlarm !== activeAlarmCheck.includes(true)) {
      setAllAlarm(activeAlarmCheck.includes(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludeAuthAlarm, recoilAllAlarmCheck]);

  const handleChange = () => {
    logEvent(attrKeys.mypage.CLICK_PUSH, {
      atr: allAlarm ? 'OFF' : 'ON'
    });

    if (allAlarm) {
      switchAlarm({
        isNotiChannel: false,
        isNotiEvent: false,
        isNotiLegit: false,
        isNotiMyProductWish: false,
        isNotiNotNight: false,
        isNotiProductList: false,
        isNotiProductWish: false,
        isNotiKeyword: false
      });
    } else {
      switchAlarm({
        isNotiChannel: true,
        isNotiEvent: true,
        isNotiLegit: true,
        isNotiMyProductWish: true,
        isNotiNotNight: true,
        isNotiProductList: true,
        isNotiProductWish: true,
        isNotiKeyword: true
      });
    }
    setAllAlarm((props) => !props);
  };

  return (
    <Flexbox
      justifyContent="space-between"
      alignment="center"
      customStyle={{ padding: '0 20px', marginBottom: 20 }}
    >
      <Typography variant="h3" weight="bold">
        알림 받기
      </Typography>
      <Switch checked={allAlarm} size="large" onChange={handleChange} />
    </Flexbox>
  );
}

export default AllAlarmState;
