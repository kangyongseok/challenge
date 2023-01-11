import { forwardRef } from 'react';

import { useRouter } from 'next/router';
import { CustomStyle, Tab, TabGroup } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { TAB_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

interface SellerInfoTabsProps {
  value: string;
  customStyle?: CustomStyle;
  sellerId: number;
  productCount: string;
  reviewCount: string;
}

const SellerInfoTabs = forwardRef<HTMLDivElement, SellerInfoTabsProps>(function SellerInfoTabs(
  { value, customStyle, sellerId, productCount, reviewCount },
  ref
) {
  const router = useRouter();

  const handleChange = (newValue: string | number) => {
    if (value === 'products') {
      logEvent(attrKeys.sellerInfo.CLICK_SELLER_REVIEW, {
        name: attrProperty.name.SELLER_REVIEW,
        att: 'TAB',
        sellerId
      });
    } else {
      logEvent(attrKeys.sellerInfo.CLICK_SELLER_PRODUCT, {
        name: attrProperty.name.SELLER_PRODUCT,
        att: 'TAB',
        sellerId
      });
    }

    router
      .replace(
        {
          pathname: `/sellerInfo/${sellerId}`,
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
      <TabGroup fullWidth value={value} onChange={handleChange}>
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

export default SellerInfoTabs;
