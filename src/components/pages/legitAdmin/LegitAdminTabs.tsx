import { useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Tab, Tabs, useTheme } from 'mrcamel-ui';

import { Badge } from '@components/UI/atoms';

import { legitRequestListCountsState, legitRequestParamsState } from '@recoil/legitRequest';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

function LegitAdminTabs() {
  const router = useRouter();
  const { tab = 'home' } = router.query;

  const resetLegitRequestParamsState = useResetRecoilState(legitRequestParamsState);
  const resetLegitRequestListCountsState = useResetRecoilState(legitRequestListCountsState);

  const { data: { notProcessedLegitCount = 0 } = {} } = useQueryUserInfo();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleChange = (newValue: string | number) => {
    if (newValue === 'request') {
      resetLegitRequestParamsState();
      resetLegitRequestListCountsState();
    }

    router.replace({
      pathname: '/legit/admin',
      query: {
        tab: newValue
      }
    });
  };

  return (
    <Box component="section" customStyle={{ borderBottom: `1px solid ${common.line01}` }}>
      <Tabs fullWidth onChange={handleChange} value={String(tab)}>
        <Tab text="홈" value="home" />
        <Tab text="내 사진감정" value="my" />
        <Tab
          // TODO UI 라이브러리 Tab 컴포넌트 text props 타입 수정 필요
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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
        <Tab text="내 프로필" value="profile" />
      </Tabs>
    </Box>
  );
}

export default LegitAdminTabs;
