import { forwardRef, useEffect } from 'react';

import { useRouter } from 'next/router';
import { Box, CustomStyle, Tab, TabGroup, useTheme } from 'mrcamel-ui';

// import Tabs from '@components/UI/molecules/Tabs';

import { logEvent } from '@library/amplitude';

import { TAB_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

interface UserShopTabsProps {
  value: string;
  customStyle?: CustomStyle;
  sellCount?: number;
  soldoutCount?: number;
  reviewCount?: number;
}

const UserShopTabs = forwardRef<HTMLDivElement, UserShopTabsProps>(function UserShopTabs(
  { value, customStyle, sellCount, soldoutCount, reviewCount },
  ref
) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();

  useEffect(() => {
    logEvent(attrKeys.camelSeller.VIEW_MY_STORE, {
      name: attrProperty.name.MY_STORE,
      title: value === '1' ? attrProperty.title.SOLD : attrProperty.title.SALE
    });
  }, [value]);

  const handleChange = (newValue: string | number) => {
    router
      .replace(
        {
          pathname: '/user/shop',
          query: {
            tab: newValue
          }
        },
        undefined,
        { shallow: true }
      )
      .then(() => {
        window.scrollTo(0, 0);
      });
  };

  return (
    <Box
      ref={ref}
      component="section"
      customStyle={{ minHeight: TAB_HEIGHT, zIndex: 1, userSelect: 'none', ...customStyle }}
    >
      <TabGroup
        fullWidth
        onChange={handleChange}
        value={value}
        customStyle={{ background: common.uiWhite }}
      >
        <Tab text={`판매중 ${sellCount}`} value="0" />
        <Tab text={`판매완료 ${soldoutCount}`} value="1" />
        <Tab text={`후기 ${reviewCount}`} value="2" />
      </TabGroup>
    </Box>
  );
});

export default UserShopTabs;
