import { forwardRef } from 'react';

import { useRouter } from 'next/router';
import { Box, CustomStyle, Tab, TabGroup, useTheme } from 'mrcamel-ui';

// import Tabs from '@components/UI/molecules/Tabs';

import { TAB_HEIGHT } from '@constants/common';

interface UserShopTabsProps {
  value: string;
  customStyle?: CustomStyle;
  reviewCount: number;
  sellCount: number;
  soldoutCount: number;
}

const UserShopTabs = forwardRef<HTMLDivElement, UserShopTabsProps>(function UserShopTabs(
  { value, customStyle, reviewCount, sellCount, soldoutCount },
  ref
) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();

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
