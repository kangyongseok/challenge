import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { Box, Tab, TabGroup } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { TAB_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function UserShopTabs() {
  const router = useRouter();
  const { tab = '0' }: { tab?: string } = router.query;

  useEffect(() => {
    logEvent(attrKeys.camelSeller.VIEW_MY_STORE, {
      name: attrProperty.name.MY_STORE,
      title: tab === '1' ? attrProperty.title.SOLD : attrProperty.title.SALE
    });
  }, [tab]);

  const handleChange = (newValue: string | number) => {
    router.replace({
      pathname: '/user/shop',
      query: {
        tab: newValue
      }
    });
  };

  return (
    <Box customStyle={{ minHeight: TAB_HEIGHT, zIndex: 1 }}>
      <StyledUserShopTabs fullWidth onChange={handleChange} value={tab}>
        <Tab text="판매중" value={0} />
        <Tab text="판매완료" value={1} />
      </StyledUserShopTabs>
    </Box>
  );
}

const StyledUserShopTabs = styled(TabGroup)`
  position: fixed;
  width: 100%;
  margin: 0 -20px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
`;

export default UserShopTabs;
