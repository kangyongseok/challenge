import { useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Tab, TabGroup, useTheme } from 'mrcamel-ui';

import Badge from '@components/UI/atoms/Badge';

import { TAB_HEIGHT } from '@constants/common';

import { legitRequestParamsState } from '@recoil/legitRequest';
import { legitProfileOpinionLegitsParamsState } from '@recoil/legitProfile';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

function LegitAdminTabs() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const { tab = 'request' } = router.query;

  const resetLegitProfileOpinionLegitsParamsState = useResetRecoilState(
    legitProfileOpinionLegitsParamsState
  );
  const resetLegitRequestParamsState = useResetRecoilState(legitRequestParamsState);

  const { data: { notProcessedLegitCount = 0 } = {} } = useQueryUserInfo();

  const handleChange = (newValue: string | number) => {
    resetLegitProfileOpinionLegitsParamsState();

    if (newValue === 'request') {
      resetLegitRequestParamsState();
    }

    router.replace({
      pathname: '/legit/admin',
      query: {
        tab: newValue
      }
    });
  };

  return (
    <Box component="section" customStyle={{ minHeight: TAB_HEIGHT, zIndex: 2 }}>
      <TabGroup
        fullWidth
        onChange={handleChange}
        value={String(tab)}
        customStyle={{ position: 'fixed', width: '100%', backgroundColor: common.uiWhite }}
      >
        <Tab text="홈" value="home" />
        <Tab text="내 사진감정" value="my" />
        <Tab
          text={
            <Flexbox alignment="center" gap={4} onClick={() => handleChange('request')}>
              감정요청
              {notProcessedLegitCount > 0 && (
                <Badge
                  open
                  variant="two-tone"
                  brandColor="red"
                  type="alone"
                  width="auto"
                  height={20}
                  customStyle={{ minWidth: 20 }}
                >
                  {notProcessedLegitCount > 99 ? '99+' : notProcessedLegitCount}
                </Badge>
              )}
            </Flexbox>
          }
          value="request"
        />
      </TabGroup>
    </Box>
  );
}

export default LegitAdminTabs;
