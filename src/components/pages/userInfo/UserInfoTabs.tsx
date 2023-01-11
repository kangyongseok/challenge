import { forwardRef } from 'react';

import { useRouter } from 'next/router';
import { CustomStyle, Tab, TabGroup, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { TAB_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

interface UserInfoTabsProps {
  value: string;
  customStyle?: CustomStyle;
  userId: number;
  productCount: string;
  reviewCount: string;
}

const UserInfoTabs = forwardRef<HTMLDivElement, UserInfoTabsProps>(function UserInfoTabs(
  { value, customStyle, userId, productCount, reviewCount },
  ref
) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();

  const handleChange = (newValue: string | number) => {
    if (value === 'products') {
      logEvent(attrKeys.userInfo.CLICK_SELLER_REVIEW, {
        name: attrProperty.name.SELLER_REVIEW,
        att: 'TAB',
        userId
      });
    } else {
      logEvent(attrKeys.userInfo.CLICK_SELLER_PRODUCT, {
        name: attrProperty.name.SELLER_PRODUCT,
        att: 'TAB',
        userId
      });
    }

    router
      .replace(
        {
          pathname: `/userInfo/${userId}`,
          query: {
            tab: newValue
          }
        },
        undefined,
        { shallow: true }
      )
      .then(() => window.scrollTo(0, 0));
  };

  return (
    <TabWrapper ref={ref} css={customStyle}>
      <TabGroup
        fullWidth
        value={value}
        onChange={handleChange}
        customStyle={{ background: common.uiWhite }}
      >
        <Tab text={`매물 ${productCount || 0}개`} value="products" />
        <Tab text={`후기 ${reviewCount || 0}개`} value="reviews" />
      </TabGroup>
    </TabWrapper>
  );
});

const TabWrapper = styled.section`
  min-height: ${TAB_HEIGHT}px;
  z-index: 1;
  user-select: none;
`;

export default UserInfoTabs;
