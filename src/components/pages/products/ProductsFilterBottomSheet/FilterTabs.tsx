import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';

import Badge from '@components/UI/atoms/Badge';

import { logEvent } from '@library/amplitude';

import {
  filterCodeIds,
  filterCodes,
  productFilterEventPropertyTitle
} from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { ProductsVariant } from '@typings/products';
import { activeTabCodeIdState, selectedSearchOptionsStateFamily } from '@recoil/productsFilter';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface FilterTabsProps {
  variant: ProductsVariant;
}

function FilterTabs({ variant }: FilterTabsProps) {
  const router = useRouter();
  const [activeTabCodeId, setActiveTabCodeIdState] = useRecoilState(activeTabCodeIdState);
  const { selectedSearchOptions } = useRecoilValue(
    selectedSearchOptionsStateFamily(`active-${router.asPath.split('?')[0]}`)
  );

  const { data: accessUser } = useQueryAccessUser();
  const { data: { size: { value: { tops = [], bottoms = [], shoes = [] } = {} } = {} } = {} } =
    useQueryUserInfo();

  const handleClick =
    (index = 0, codeId = 0) =>
    () => {
      const { keyword } = router.query;
      const eventProperties = { keyword };

      if (variant !== 'search') delete eventProperties.keyword;

      logEvent(attrKeys.products.selectFilterTab, {
        name: attrProperty.name.productList,
        title: productFilterEventPropertyTitle[codeId],
        index
      });
      setActiveTabCodeIdState(codeId);
    };

  return (
    <StyledFilterTabs
      disableMyFilter={!accessUser || (!tops.length && !bottoms.length && !shoes.length)}
    >
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
            customStyle={{
              top: -2,
              right: -8
            }}
          >
            <FilterTab
              isActive={activeTabCodeId === codeId}
              data-index={index}
              data-code-id={codeId}
              onClick={handleClick(index, codeId)}
            >
              {name}
            </FilterTab>
          </Badge>
        </FilterTabWrapper>
      ))}
    </StyledFilterTabs>
  );
}

const StyledFilterTabs = styled.section<{ disableMyFilter: boolean }>`
  margin-top: ${({ disableMyFilter }) => (disableMyFilter ? 24 : 32)}px;
  padding: 0 20px;
  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
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
    borderColor: isActive ? common.ui20 : 'transparent'
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
    color: isActive ? common.ui20 : common.ui60
  })};
`;

export default FilterTabs;
