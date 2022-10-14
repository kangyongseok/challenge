import { useRouter } from 'next/router';
import { Tab, Tabs, useTheme } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function LegitGuideTabs() {
  const router = useRouter();
  const { tab = 'upload' } = router.query;

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClickTab = (value: string | number) => {
    logEvent(attrKeys.legitGuide.CLICK_LEGIT_TAB, {
      name: attrProperty.legitName.LEGIT_HOWITWORKS,
      att: value === 'upload' ? 'TAB01' : 'TAB02'
    });

    router.replace(
      {
        pathname: '/legit/guide',
        query: {
          tab: value
        }
      },
      undefined,
      {
        scroll: false
      }
    );
  };

  return (
    <Tabs
      fullWidth
      onChange={handleClickTab}
      value={String(tab)}
      customStyle={{
        marginTop: 20,
        borderBottom: `1px solid ${common.line01}`
      }}
    >
      <Tab text="1. 사진 올려서 감정신청" value="upload" />
      <Tab text="2. 판매사진으로 감정신청" value="picture" />
    </Tabs>
  );
}

export default LegitGuideTabs;
