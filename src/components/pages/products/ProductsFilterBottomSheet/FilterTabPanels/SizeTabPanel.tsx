import { useState } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Grid, Icon } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { ProductsVariant } from '@typings/products';
import {
  selectedSearchOptionsStateFamily,
  sizeFilterOptionsSelector
} from '@recoil/productsFilter';

import MyFilterInfo from '../MyFilterInfo';
import FilterOption from '../FilterOption';
import FilterAccordion from '../FilterAccordion';

interface SizeTabPanelProps {
  variant: ProductsVariant;
}

function SizeTabPanel({ variant }: SizeTabPanelProps) {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const parentCategories = useRecoilValue(sizeFilterOptionsSelector);
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );

  const [extendsCategorySizes, setExtendsCategorySizes] = useState<string[]>([]);

  const handleClickSelectedAll = (parentCategoryCodeId: number, newId: number) => () => {
    const selectedParenCategoryIndex = parentCategories.findIndex(
      (parentCategory) => parentCategory.id === newId
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

  const handleClick =
    ({
      newCodeId,
      newParentCategoryId,
      newCategorySizeId,
      newGrouping
    }: {
      newCodeId: number;
      newParentCategoryId: number;
      newCategorySizeId: number;
      newGrouping: boolean;
    }) =>
    () => {
      const selectedSearchOption = selectedSearchOptions.find(
        ({ codeId, parentCategoryId, categorySizeId }) =>
          codeId === newCodeId &&
          parentCategoryId === newParentCategoryId &&
          categorySizeId === newCategorySizeId
      );

      if (selectedSearchOption && newGrouping) {
        setSelectedSearchOptionsState(({ type }) => ({
          type,
          selectedSearchOptions: [
            ...selectedSearchOptions.filter(({ codeId, parentCategoryId }) => {
              if (codeId !== newCodeId) return true;
              return parentCategoryId !== newParentCategoryId;
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
          (parentCategory) => parentCategory.id === newParentCategoryId
        );

        if (selectedParentCategory) {
          const selectedCategorySizeIndex = selectedParentCategory.categorySizes.findIndex(
            ({ categorySizeId, parentCategoryId }) =>
              parentCategoryId === newParentCategoryId && categorySizeId === newCategorySizeId
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

  const handleClickMore = (parentCategoryName: string) => () =>
    setExtendsCategorySizes((prevState) => [...prevState, parentCategoryName]);

  return (
    <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
      <Box customStyle={{ flex: 1, overflowY: 'auto' }}>
        <MyFilterInfo variant={variant} />
        <Box
          customStyle={{
            padding: '0 20px 20px'
          }}
        >
          {parentCategories
            .filter(({ categorySizes = [] }) => categorySizes.length)
            .map(
              ({
                id: parentCategoryId,
                codeId: parentCategoryCodeId,
                name: parentCategoryName,
                categorySizes,
                filteredCategorySizes,
                checkedAll
              }) => (
                <FilterAccordion
                  key={`pc-filter-option-${parentCategoryId}`}
                  title={`${parentCategoryName.replace(/\(P\)/g, '')} 사이즈`}
                  subText={categorySizes
                    .map(({ count }) => count)
                    .reduce((a, b) => a + b, 0)
                    .toLocaleString()}
                  expand={parentCategories.length === 1}
                  expandIcon={
                    categorySizes.filter(({ checked }) => checked).length >= 1 ? (
                      <Icon name="CheckOutlined" color="primary" />
                    ) : undefined
                  }
                  isActive={categorySizes.filter(({ checked }) => checked).length >= 1}
                  checkedAll={checkedAll}
                  onClick={handleClickSelectedAll(parentCategoryCodeId, parentCategoryId)}
                >
                  <Grid
                    container
                    columnGap={8}
                    customStyle={{
                      padding: '0 12px'
                    }}
                  >
                    {!extendsCategorySizes.includes(parentCategoryName.replace(/\(P\)/g, '')) &&
                    filteredCategorySizes.length > 0
                      ? filteredCategorySizes.map(
                          ({ codeId, checked, count, viewSize, name, categorySizeId }) => (
                            <Grid
                              key={`cs-filter-option-${parentCategoryId}-${categorySizeId}`}
                              item
                              xs={2}
                            >
                              <FilterOption
                                checked={checkedAll ? false : checked}
                                count={count}
                                onClick={handleClick({
                                  newCodeId: codeId,
                                  newParentCategoryId: parentCategoryId,
                                  newCategorySizeId: categorySizeId,
                                  newGrouping: checkedAll
                                })}
                              >
                                {viewSize || name}
                              </FilterOption>
                            </Grid>
                          )
                        )
                      : categorySizes.map(
                          ({ codeId, checked, count, viewSize, name, categorySizeId }) => (
                            <Grid
                              key={`cs-filter-option-${parentCategoryId}-${categorySizeId}`}
                              item
                              xs={2}
                            >
                              <FilterOption
                                checked={checkedAll ? false : checked}
                                count={count}
                                onClick={handleClick({
                                  newCodeId: codeId,
                                  newParentCategoryId: parentCategoryId,
                                  newCategorySizeId: categorySizeId,
                                  newGrouping: checkedAll
                                })}
                              >
                                {viewSize || name}
                              </FilterOption>
                            </Grid>
                          )
                        )}
                  </Grid>
                  {['아우터', '상의', '하의', '신발'].includes(
                    parentCategoryName.replace(/\(P\)/g, '')
                  ) &&
                    !extendsCategorySizes.includes(parentCategoryName.replace(/\(P\)/g, '')) && (
                      <Box
                        customStyle={{
                          margin: '8px 12px 12px'
                        }}
                      >
                        <Button
                          variant="ghost"
                          brandColor="black"
                          fullWidth
                          onClick={handleClickMore(parentCategoryName.replace(/\(P\)/g, ''))}
                        >
                          사이즈 더보기
                        </Button>
                      </Box>
                    )}
                </FilterAccordion>
              )
            )}
        </Box>
      </Box>
    </Flexbox>
  );
}

export default SizeTabPanel;
