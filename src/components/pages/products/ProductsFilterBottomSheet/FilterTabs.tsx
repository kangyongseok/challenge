import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';

import Badge from '@components/UI/atoms/Badge';

import { logEvent } from '@library/amplitude';

import { filterCodeIds, filterCodes } from '@constants/productsFilter';
import { PRODUCT_NAME } from '@constants/product';
import attrKeys from '@constants/attrKeys';

import getEventPropertyTitle from '@utils/products/getEventPropertyTitle';

import type { ProductsVariant } from '@typings/products';
import { activeTabCodeIdState, selectedSearchOptionsStateFamily } from '@recoil/productsFilter';

interface FilterTabsProps {
  variant: ProductsVariant;
}

function FilterTabs({ variant }: FilterTabsProps) {
  const router = useRouter();
  const [activeTabCodeId, setActiveTabCodeIdState] = useRecoilState(activeTabCodeIdState);
  const { selectedSearchOptions } = useRecoilValue(
    selectedSearchOptionsStateFamily(`active-${router.asPath.split('?')[0]}`)
  );

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const dataIndex = Number(e.currentTarget.getAttribute('data-index') || 0);
    const dataCodeId = Number(e.currentTarget.getAttribute('data-code-id') || 0);
    const { keyword } = router.query;
    const eventProperties = {
      keyword
    };

    if (variant !== 'search') delete eventProperties.keyword;

    logEvent(attrKeys.products.CLICK_FILTER, eventProperties);
    logEvent(attrKeys.products.SELECT_FILTERTAB, {
      name: PRODUCT_NAME.PRODUCT_LIST,
      title: getEventPropertyTitle(dataCodeId),
      index: dataIndex
    });
    setActiveTabCodeIdState(dataCodeId);
  };

  return (
    <StyledFilterTabs>
      {filterCodes[variant].map(({ codeId, name }, index) => (
        <FilterTabWrapper key={`filter-tab-${codeId}`} isActive={activeTabCodeId === codeId}>
          <Badge
            open={selectedSearchOptions.some(({ codeId: selectedCodeId }) => {
              if (codeId === filterCodeIds.detailOption) {
                const { season, color, material } = filterCodeIds;
                return [season, color, material].includes(selectedCodeId);
              }
              return codeId === selectedCodeId;
            })}
          >
            <FilterTab
              isActive={activeTabCodeId === codeId}
              data-index={index}
              data-code-id={codeId}
              onClick={handleClick}
            >
              {name}
            </FilterTab>
          </Badge>
        </FilterTabWrapper>
      ))}
    </StyledFilterTabs>
  );
}

const StyledFilterTabs = styled.section`
  margin-top: 32px;
  padding: 0 20px;
  border-bottom: 1px solid ${({ theme: { palette } }) => palette.common.grey['90']};
  white-space: nowrap;
  overflow-x: auto;

  & > div {
    display: inline-flex;
    align-items: center;
    margin-right: 20px;
  }
  & > div:last-child {
    margin-right: 0;
  }
`;

const FilterTabWrapper = styled.div<{
  isActive?: boolean;
}>`
  height: 41px;
  border-bottom: 2px solid transparent;
  cursor: pointer;

  ${({
    theme: {
      palette: { common }
    },
    isActive
  }) => ({
    borderColor: isActive ? common.grey['20'] : 'transparent'
  })};
`;

const FilterTab = styled.div<{
  isActive?: boolean;
}>`
  ${({
    theme: {
      palette: { common },
      typography: {
        body1: { size, weight, lineHeight, letterSpacing }
      }
    },
    isActive
  }) => ({
    fontSize: size,
    fontWeight: isActive ? weight.medium : weight.regular,
    lineHeight,
    letterSpacing,
    color: isActive ? common.grey['20'] : common.grey['60']
  })};
`;

export default FilterTabs;
