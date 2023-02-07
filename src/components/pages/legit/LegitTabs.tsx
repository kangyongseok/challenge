import { useRouter } from 'next/router';
import { Box, Flexbox, Tab, TabGroup, useTheme } from 'mrcamel-ui';

import Badge from '@components/UI/atoms/Badge';

import { logEvent } from '@library/amplitude';

import { TAB_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryUserInfo from '@hooks/useQueryUserInfo';

function LegitTabs() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const { tab = 'live' } = router.query;

  const { data: { notViewedLegitCount = 0 } = {}, isLoading } = useQueryUserInfo();

  const handleChange = (newValue: string | number) => {
    logEvent(attrKeys.legit.CLICK_LEGIT_TAB, {
      name: tab === 'live' ? attrProperty.legitName.LEGIT_MAIN : attrProperty.legitName.LEGIT_MY,
      att: newValue === 'live' ? 'LEGIT_MAIN' : 'LEGIT_MY'
    });

    router.replace({
      pathname: '/legit',
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
        <Tab text="실시간 사진감정" value="live" customStyle={{ wordBreak: 'keep-all' }} />
        <Tab
          text={
            <Flexbox alignment="center" gap={4} onClick={() => handleChange('my')}>
              내 사진감정
              {!isLoading && notViewedLegitCount > 0 && (
                <Badge variant="two-tone" brandColor="red" type="alone" open width={20} height={20}>
                  N
                </Badge>
              )}
            </Flexbox>
          }
          value="my"
        />
      </TabGroup>
    </Box>
  );
}

export default LegitTabs;
