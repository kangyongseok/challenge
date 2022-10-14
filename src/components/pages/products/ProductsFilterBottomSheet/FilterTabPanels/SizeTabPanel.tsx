import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Chip, Flexbox } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  selectedSearchOptionsStateFamily,
  sizeFilterOptionsSelector
} from '@recoil/productsFilter';

import FilterOption from '../FilterOption';
import FilterAccordion from '../FilterAccordion';

function SizeTabPanel() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const parentCategories = useRecoilValue(sizeFilterOptionsSelector);
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );

  const handleClickSelectedAll = ({
    e,
    parentCategoryCodeId,
    id
  }: {
    e: MouseEvent<HTMLButtonElement>;
    parentCategoryCodeId: number;
    id: number;
  }) => {
    e.stopPropagation();

    const selectedParenCategoryIndex = parentCategories.findIndex(
      (parentCategory) => parentCategory.id === id
    );
    const selectedParenCategory = parentCategories[selectedParenCategoryIndex];

    if (selectedParenCategory) {
      if (!selectedParenCategory.checkedAll) {
        logEvent(attrKeys.products.selectFilter, {
          name: attrProperty.name.productList,
          title: attrProperty.title.size,
          index: selectedParenCategoryIndex,
          count: selectedParenCategory.count,
          value: `${selectedParenCategory.name}, 전체`
        });
      }
      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: !selectedParenCategory.checkedAll
          ? [
              ...selectedSearchOptions.filter(
                ({ codeId, parentCategoryId }) =>
                  codeId !== parentCategoryCodeId || parentCategoryId !== selectedParenCategory.id
              ),
              ...selectedParenCategory.categorySizes.filter(
                ({ parentCategoryId }) => parentCategoryId === selectedParenCategory.id
              )
            ]
          : selectedSearchOptions.filter(
              ({ codeId, parentCategoryId }) =>
                codeId !== parentCategoryCodeId || parentCategoryId !== selectedParenCategory.id
            )
      }));
    }
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const dataCodeId = Number(e.currentTarget.getAttribute('data-code-id'));
    const dataParentCategoryId = Number(
      e.currentTarget.getAttribute('data-parent-category-id') || 0
    );
    const dataCategorySizeId = Number(e.currentTarget.getAttribute('data-category-size-id') || 0);
    const dataGrouping = String(e.currentTarget.getAttribute('data-grouping') || '');

    const selectedSearchOption = selectedSearchOptions.find(
      ({ codeId, parentCategoryId, categorySizeId }) =>
        codeId === dataCodeId &&
        parentCategoryId === dataParentCategoryId &&
        categorySizeId === dataCategorySizeId
    );

    if (selectedSearchOption && dataGrouping) {
      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: [
          ...selectedSearchOptions.filter(({ codeId, parentCategoryId }) => {
            if (codeId !== dataCodeId) return true;
            return parentCategoryId !== dataParentCategoryId;
          }),
          selectedSearchOption
        ]
      }));
      return;
    }

    if (selectedSearchOption) {
      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: selectedSearchOptions.filter(
          ({ categorySizeId, codeId, parentCategoryId }) =>
            codeId !== selectedSearchOption.codeId ||
            parentCategoryId !== selectedSearchOption.parentCategoryId ||
            categorySizeId !== selectedSearchOption.categorySizeId
        )
      }));
    } else {
      const selectedParentCategory = parentCategories.find(
        (parentCategory) => parentCategory.id === dataParentCategoryId
      );

      if (selectedParentCategory) {
        const selectedCategorySizeIndex = selectedParentCategory.categorySizes.findIndex(
          ({ categorySizeId, parentCategoryId }) =>
            parentCategoryId === dataParentCategoryId && categorySizeId === dataCategorySizeId
        );
        const selectedCategorySize =
          selectedParentCategory.categorySizes[selectedCategorySizeIndex];

        if (selectedCategorySize) {
          logEvent(attrKeys.products.selectFilter, {
            name: attrProperty.name.productList,
            title: attrProperty.title.size,
            index: selectedCategorySizeIndex,
            count: selectedCategorySize.count,
            value: selectedCategorySize.name
          });

          setSelectedSearchOptionsState(({ type }) => ({
            type,
            selectedSearchOptions: selectedSearchOptions.concat(selectedCategorySize)
          }));
        }
      }
    }
  };

  return (
    <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
      <Box customStyle={{ flex: 1, overflowY: 'auto' }}>
        {parentCategories.map(
          ({
            id: parentCategoryId,
            codeId: parentCategoryCodeId,
            name: parentCategoryName,
            categorySizes,
            checkedAll
          }) => (
            <FilterAccordion
              key={`pc-filter-option-${parentCategoryId}`}
              expanded={parentCategories.length === 1}
              summary={parentCategoryName.replace(/\(P\)/g, '')}
              customButton={
                checkedAll ? (
                  <Chip
                    variant="contained"
                    brandColor="primary"
                    size="xsmall"
                    onClick={(e) =>
                      handleClickSelectedAll({
                        e,
                        parentCategoryCodeId,
                        id: parentCategoryId
                      })
                    }
                    customStyle={{ marginLeft: 12 }}
                  >
                    전체선택
                  </Chip>
                ) : (
                  <Chip
                    variant="outlined"
                    brandColor="gray"
                    size="xsmall"
                    weight="medium"
                    onClick={(e) =>
                      handleClickSelectedAll({
                        e,
                        parentCategoryCodeId,
                        id: parentCategoryId
                      })
                    }
                    customStyle={{ marginLeft: 12 }}
                  >
                    전체선택
                  </Chip>
                )
              }
              onClickButton={(e) =>
                handleClickSelectedAll({
                  e,
                  parentCategoryCodeId,
                  id: parentCategoryId
                })
              }
            >
              {categorySizes.map(({ codeId, checked, count, viewSize, name, categorySizeId }) => (
                <FilterOption
                  key={`cs-filter-option-${parentCategoryId}-${categorySizeId}`}
                  data-code-id={codeId}
                  data-parent-category-id={parentCategoryId}
                  data-category-size-id={categorySizeId}
                  data-grouping={checkedAll || ''}
                  checked={checkedAll ? false : checked}
                  count={count}
                  onClick={handleClick}
                >
                  {viewSize || name}
                </FilterOption>
              ))}
            </FilterAccordion>
          )
        )}
      </Box>
    </Flexbox>
  );
}

export default SizeTabPanel;
