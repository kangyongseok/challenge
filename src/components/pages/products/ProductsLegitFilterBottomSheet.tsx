import { MouseEvent } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { BottomSheet, Box, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { filterCodeIds, idFilterOptions, legitIdFilterOptionIds } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  productsFilterStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

function ProductsLegitFilterBottomSheet() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];
  const [{ open }, setProductsLegitFilterState] = useRecoilState(
    productsFilterStateFamily(`legit-${atomParam}`)
  );
  const [
    {
      searchParams: { idFilterIds = [] }
    },
    setSearchParamsState
  ] = useRecoilState(searchParamsStateFamily(`search-${atomParam}`));
  const setSelectedSearchOptionsState = useSetRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );

  const handleClick = (e: MouseEvent<HTMLLIElement>) => {
    const dataId = Number(e.currentTarget.getAttribute('data-id') || 0);
    let att = (idFilterOptions.find(({ id }) => id === dataId) || {}).name;
    if (att === '사진감정') att = '전체';

    logEvent(attrKeys.products.SELECT_LEGIT_FILTER, {
      name: attrProperty.productName.PRODUCT_LIST,
      att
    });

    setSelectedSearchOptionsState(({ type, selectedSearchOptions: prevSearchOptions }) => ({
      type,
      selectedSearchOptions: [
        ...prevSearchOptions.filter(
          ({ codeId, id = 0 }) =>
            codeId !== filterCodeIds.id || !legitIdFilterOptionIds.includes(id)
        ),
        {
          codeId: filterCodeIds.id,
          id: dataId
        }
      ]
    }));
    setSearchParamsState(({ type, searchParams }) => ({
      type,
      searchParams: {
        ...searchParams,
        idFilterIds: (searchParams.idFilterIds || [])
          .filter((id) => !legitIdFilterOptionIds.includes(id))
          .concat([dataId])
      }
    }));
    setProductsLegitFilterState(({ type }) => ({
      type,
      open: false
    }));
  };

  return (
    <BottomSheet
      open={open}
      onClose={() =>
        setProductsLegitFilterState(({ type }) => ({
          type,
          open: false
        }))
      }
      disableSwipeable
    >
      <Flexbox
        justifyContent="space-between"
        customStyle={{ margin: '16px 20px 0 20px', textAlign: 'right' }}
      >
        <Typography variant="h3" weight="bold">
          사진감정
        </Typography>
        <Icon
          name="CloseOutlined"
          size="large"
          onClick={() =>
            setProductsLegitFilterState(({ type }) => ({
              type,
              open: false
            }))
          }
        />
      </Flexbox>
      <Box component="ul" customStyle={{ margin: '24px 8px 32px 8px' }}>
        {idFilterOptions
          .filter(({ id }) => legitIdFilterOptionIds.includes(id))
          .map(({ id, viewName }) => (
            <LegitFilterOption
              key={`legit-filter-option-${id}`}
              data-id={id}
              isActive={idFilterIds.includes(id)}
              onClick={handleClick}
            >
              {viewName}
            </LegitFilterOption>
          ))}
      </Box>
    </BottomSheet>
  );
}

const LegitFilterOption = styled.li<{
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
    color: isActive ? primary.main : common.ui20
  })};

  cursor: pointer;
`;

export default ProductsLegitFilterBottomSheet;
