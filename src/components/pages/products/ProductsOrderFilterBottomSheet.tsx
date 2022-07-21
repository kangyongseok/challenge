import type { MouseEvent } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { BottomSheet, Box, Flexbox, Icon, Typography } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import type { ProductOrder } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { filterCodeIds, orderFilterOptions } from '@constants/productsFilter';
import { PRODUCT_NAME } from '@constants/product';
import attrKeys from '@constants/attrKeys';

import getEventPropertyOrder from '@utils/products/getEventPropertyOrder';

import {
  productsFilterStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

function ProductsOrderFilterBottomSheet() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const [{ open }, setProductsOrderFilterState] = useRecoilState(
    productsFilterStateFamily(`order-${atomParam}`)
  );
  const [
    {
      searchParams: { order: selectedOrder }
    },
    setSearchParamsState
  ] = useRecoilState(searchParamsStateFamily(`search-${atomParam}`));
  const setSelectedSearchOptionsState = useSetRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );

  const handleClick = (e: MouseEvent<HTMLLIElement>) => {
    const dataOrder = String(e.currentTarget.getAttribute('data-order')) as ProductOrder;

    const { keyword } = router.query;

    const eventProperties = {
      title: PRODUCT_NAME.PRODUCT_LIST,
      keyword
    };

    if (router.pathname !== '/products/search/[keyword]') delete eventProperties.keyword;

    logEvent(attrKeys.products.CLICK_SORT, eventProperties);
    logEvent(attrKeys.products.SELECT_SORT, {
      title: PRODUCT_NAME.PRODUCT_LIST,
      order: getEventPropertyOrder(dataOrder)
    });

    setSelectedSearchOptionsState(({ type, selectedSearchOptions: prevSearchOptions }) => ({
      type,
      selectedSearchOptions: [
        ...prevSearchOptions.filter(({ codeId }) => codeId !== filterCodeIds.order),
        {
          codeId: filterCodeIds.order,
          productOrder: dataOrder
        }
      ]
    }));
    setSearchParamsState(({ type, searchParams }) => ({
      type,
      searchParams: {
        ...searchParams,
        order: dataOrder
      }
    }));
    setProductsOrderFilterState(({ type }) => ({
      type,
      open: false
    }));
  };

  return (
    <BottomSheet
      open={open}
      disableSwipeable
      onClose={() =>
        setProductsOrderFilterState(({ type }) => ({
          type,
          open: false
        }))
      }
    >
      <Flexbox
        justifyContent="space-between"
        customStyle={{ margin: '16px 20px 0 20px', textAlign: 'right' }}
      >
        <Typography variant="h4" weight="bold">
          정렬 필터
        </Typography>
        <Icon
          name="CloseOutlined"
          size="large"
          onClick={() =>
            setProductsOrderFilterState(({ type }) => ({
              type,
              open: false
            }))
          }
        />
      </Flexbox>
      <Box component="ul" customStyle={{ margin: '24px 8px 32px 8px' }}>
        {orderFilterOptions.map(({ name, order }) => (
          <OrderFilterOption
            key={`order-filter-option-${order}`}
            data-order={order}
            isActive={selectedOrder === order}
            onClick={handleClick}
          >
            {name}
          </OrderFilterOption>
        ))}
      </Box>
    </BottomSheet>
  );
}

const OrderFilterOption = styled.li<{
  isActive?: boolean;
}>`
  height: 41px;
  line-height: 41px;
  padding: 0 12px;
  border-radius: ${({
    theme: {
      box: { round }
    }
  }) => round['8']};

  ${({
    theme: {
      palette: { primary }
    },
    isActive
  }): CSSObject =>
    isActive
      ? {
          backgroundColor: primary.highlight
        }
      : {}}

  ${({
    theme: {
      palette: { primary, common },
      typography: {
        body1: { size, weight, letterSpacing }
      }
    },
    isActive
  }): CSSObject => ({
    fontSize: size,
    fontWeight: weight.medium,
    letterSpacing,
    color: isActive ? primary.main : common.grey['20']
  })};

  cursor: pointer;
`;

export default ProductsOrderFilterBottomSheet;
