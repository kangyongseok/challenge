import { useEffect } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Box } from '@mrcamelhub/camel-ui';

import { Gap } from '@components/UI/atoms';

import ChannelTalk from '@library/channelTalk';

import { fetchAlarm, fetchMyUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';

import WishProductAlarm from './WishProductAlarm';
import SellerProductAlarm from './SellerProductAlarm';
import LegitAlarm from './LegitAlarm';
import ChatAlarm from './ChatAlarm';
import BasicAlarm from './BasicAlarm';
import AllAlarmState from './AllAlarmState';

function MypageAlarmSetting() {
  const { data: alarmsInfo } = useQuery(queryKeys.users.alarms(), fetchAlarm, {
    refetchOnMount: true
  });
  const { data: myUserInfo } = useQuery(queryKeys.users.myUserInfo(), fetchMyUserInfo);
  const queryClient = useQueryClient();

  const exactFalse = (value: boolean | null | undefined) => {
    if (value === false) return false;
    return true;
  };

  useEffect(() => {
    ChannelTalk.hideChannelButton();
    return () => {
      ChannelTalk.showChannelButton();
      queryClient.invalidateQueries(queryKeys.users.alarms());
    };
  }, [queryClient]);

  return (
    <Box customStyle={{ paddingTop: 32 }}>
      <AllAlarmState alarmsInfo={alarmsInfo} />
      <Gap height={8} />
      <BasicAlarm
        eventAlarm={exactFalse(alarmsInfo?.isNotiEvent)}
        nightAlarm={exactFalse(alarmsInfo?.isNotiNotNight)}
        date={alarmsInfo?.dateIsNotiEventAgree}
      />
      <Gap height={1} />
      <ChatAlarm alarm={exactFalse(alarmsInfo?.isNotiChannel)} />
      <Gap height={1} />
      <WishProductAlarm
        wishAlarm={exactFalse(alarmsInfo?.isNotiProductWish)}
        saveProductAlarm={exactFalse(alarmsInfo?.isNotiProductList)}
        keywordAlarm={exactFalse(alarmsInfo?.isNotiKeyword)}
      />
      {(myUserInfo?.roles?.includes('PRODUCT_LEGIT') ||
        myUserInfo?.roles?.includes('PRODUCT_LEGIT_HEAD')) && (
        <>
          <Gap height={1} />
          <LegitAlarm alarm={exactFalse(alarmsInfo?.isNotiLegit)} />
        </>
      )}
      <Gap height={1} />
      <SellerProductAlarm alarm={exactFalse(alarmsInfo?.isNotiMyProductWish)} />
    </Box>
  );
}

export default MypageAlarmSetting;
