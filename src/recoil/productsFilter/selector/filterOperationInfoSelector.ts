import { selector } from 'recoil';

import { filterCodeIds, filterGenders, idFilterOptions } from '@constants/productsFilter';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber } from '@utils/common';

import type { SelectedSearchOptionHistory } from '@typings/products';

import {
  activeTabCodeIdState,
  brandFilterOptionsSelector,
  colorFilterOptionsSelector,
  genderFilterOptionsSelector,
  lineFilterOptionsSelector,
  platformFilterOptionsSelector,
  productsFilterAtomParamState,
  productsFilterTotalCountStateFamily,
  searchOptionsStateFamily,
  selectedSearchOptionsStateFamily
} from '..';

import {
  categoryFilterOptionsSelector,
  detailFilterOptionsSelector,
  sizeFilterOptionsSelector
} from '.';

const filterOperationInfoSelector = selector({
  key: 'productsFilter/filterOperationInfoSelector',
  get: ({ get }) => {
    const atomParam = get(productsFilterAtomParamState);
    const {
      searchOptions: { genders = [], parentCategories = [] }
    } = get(searchOptionsStateFamily(`base-${atomParam}`));
    const activeTabCodeId = get(activeTabCodeIdState);
    const { selectedSearchOptions } = get(selectedSearchOptionsStateFamily(`active-${atomParam}`));
    const { count: totalCount } = get(
      productsFilterTotalCountStateFamily(`searchOption-${atomParam}`)
    );
    const categoryFilterOptions = get(categoryFilterOptionsSelector);
    const brandFilterOptions = get(brandFilterOptionsSelector);
    const sizeFilterOptions = get(sizeFilterOptionsSelector);
    const platformFilterOptions = get(platformFilterOptionsSelector);
    const lineFilterOptions = get(lineFilterOptionsSelector);
    const colorFilterOptions = get(colorFilterOptionsSelector);
    const {
      season: { checkedAll: seasonCheckedAll, filterOptions: seasonFilterOptions },
      material: { checkedAll: materialCheckedAll, filterOptions: materialFilterOptions }
    } = get(detailFilterOptionsSelector);
    const genderFilterOptions = get(genderFilterOptionsSelector);

    let selectedSearchOptionsHistory: SelectedSearchOptionHistory[] = selectedSearchOptions
      .filter(({ codeId }) => ![filterCodeIds.order].includes(codeId))
      .map(
        (
          {
            id,
            codeId,
            parentId,
            parentCategoryId,
            categorySizeId,
            name,
            viewName,
            viewSize,
            genderIds = [],
            minPrice = 0,
            maxPrice = 0,
            count,
            gender,
            description
          },
          index
        ) => {
          let prefixDisplayName: string | undefined;
          let displayName: string;
          let genderId = 0;

          if (
            codeId === filterCodeIds.id &&
            idFilterOptions.some((idFilterOption) => idFilterOption.id === id)
          ) {
            displayName =
              (idFilterOptions.find((idFilterOption) => idFilterOption.id === id) || {}).name || '';
          } else if (codeId === filterCodeIds.map) {
            displayName = '내 주변';
          } else if (id === filterCodeIds.safePayment) {
            displayName = '채팅가능';
          } else if (codeId === filterCodeIds.price) {
            displayName = `${commaNumber(getTenThousandUnitPrice(minPrice))}만원 ~ ${commaNumber(
              getTenThousandUnitPrice(maxPrice)
            )}만원`;
          } else {
            if (codeId === filterCodeIds.category) {
              genderId =
                genderIds.filter(
                  (historyGenderId) => historyGenderId !== filterGenders.common.id
                )[0] || 0;

              if (genderId) prefixDisplayName = (genders.find((g) => g.id === genderId) || {}).name;
            } else if (codeId === filterCodeIds.size) {
              const selectedParentCategory = parentCategories.find(
                (parentCategory) => parentCategory.id === parentCategoryId
              );

              if (selectedParentCategory)
                prefixDisplayName = selectedParentCategory.name.replace(/\(P\)/g, '');
            }

            displayName = prefixDisplayName
              ? `${prefixDisplayName}, ${viewSize || viewName || name}`
              : viewSize || viewName || name || '알 수 없음';
          }

          return {
            id,
            codeId,
            parentId,
            parentCategoryId,
            categorySizeId,
            genderId,
            displayName,
            grouping: false,
            count,
            index,
            gender,
            description
          };
        }
      );

    // 그룹화 시작
    categoryFilterOptions.forEach(
      ({ id, name, parentCategories: genderParentCategories, checkedAll, count }) => {
        if (checkedAll) {
          const currentFilterOptions = selectedSearchOptionsHistory.filter(
            ({ codeId, genderId }) => codeId === filterCodeIds.category && genderId === id
          );
          const startIndex = selectedSearchOptionsHistory.findIndex(
            ({ codeId, genderId }) => codeId === filterCodeIds.category && genderId === id
          );
          const endIndex = startIndex + currentFilterOptions.length - 1;

          selectedSearchOptionsHistory[endIndex] = {
            codeId: filterCodeIds.category,
            genderId: id,
            displayName: name,
            grouping: true,
            groupingDepth: 1,
            count
          };

          selectedSearchOptionsHistory = selectedSearchOptionsHistory.filter(
            ({ codeId, genderId }, index) => {
              if (codeId !== filterCodeIds.category) return true;
              if (genderId !== id) return true;

              return !(index >= startIndex && index < endIndex);
            }
          );
        } else {
          genderParentCategories.forEach(
            ({
              id: genderParentCategoryId,
              name: genderParentCategoryName,
              checkedAll: genderParentCategoryCheckedAll,
              count: genderParentCategoryCount
            }) => {
              if (genderParentCategoryCheckedAll) {
                const currentFilterOptions = selectedSearchOptionsHistory.filter(
                  ({ codeId, parentId, genderId }) =>
                    codeId === filterCodeIds.category &&
                    genderId === id &&
                    parentId === genderParentCategoryId
                );
                const startIndex = selectedSearchOptionsHistory.findIndex(
                  ({ codeId, parentId, genderId }) =>
                    codeId === filterCodeIds.category &&
                    genderId === id &&
                    parentId === genderParentCategoryId
                );
                const endIndex = startIndex + currentFilterOptions.length - 1;

                selectedSearchOptionsHistory[endIndex] = {
                  codeId: filterCodeIds.category,
                  parentId: genderParentCategoryId,
                  genderId: id,
                  displayName: `${name}, ${genderParentCategoryName.replace(/\(P\)/g, '')}`,
                  grouping: true,
                  groupingDepth: 2,
                  count: genderParentCategoryCount
                };

                selectedSearchOptionsHistory = selectedSearchOptionsHistory.filter(
                  ({ codeId, parentId, genderId }, index) => {
                    if (codeId !== filterCodeIds.category) return true;
                    if (genderId !== id) return true;
                    if (parentId !== genderParentCategoryId) return true;

                    return !(index >= startIndex && index < endIndex);
                  }
                );
              }
            }
          );
        }
      }
    );

    sizeFilterOptions.forEach(({ id, name, checkedAll, count }) => {
      if (checkedAll) {
        const currentFilterOptions = selectedSearchOptionsHistory.filter(
          ({ codeId, parentCategoryId }) => codeId === filterCodeIds.size && parentCategoryId === id
        );
        const startIndex = selectedSearchOptionsHistory.findIndex(
          ({ codeId, parentCategoryId }) => codeId === filterCodeIds.size && parentCategoryId === id
        );
        const endIndex = startIndex + currentFilterOptions.length - 1;

        selectedSearchOptionsHistory[endIndex] = {
          codeId: filterCodeIds.size,
          parentCategoryId: id,
          displayName: `${name.replace(/\(P\)/g, '')}, 전체`,
          grouping: true,
          groupingDepth: 1,
          count
        };

        selectedSearchOptionsHistory = selectedSearchOptionsHistory.filter(
          ({ codeId, parentCategoryId }, index) => {
            if (codeId !== filterCodeIds.size) return true;
            if (parentCategoryId !== id) return true;

            return !(index >= startIndex && index < endIndex);
          }
        );
      }
    });

    if (seasonCheckedAll) {
      const currentFilterOptions = selectedSearchOptionsHistory.filter(
        ({ codeId }) => codeId === filterCodeIds.season
      );
      const startIndex = selectedSearchOptionsHistory.findIndex(
        ({ codeId }) => codeId === filterCodeIds.season
      );
      const endIndex = startIndex + currentFilterOptions.length - 1;

      selectedSearchOptionsHistory[endIndex] = {
        codeId: filterCodeIds.season,
        displayName: '연식, 전체',
        grouping: true,
        groupingDepth: 1,
        count: currentFilterOptions
          .map(({ count }) => count)
          .reduce((a, b) => (a as number) + (b as number), 0)
      };

      selectedSearchOptionsHistory = selectedSearchOptionsHistory.filter(({ codeId }, index) => {
        if (codeId !== filterCodeIds.season) return true;

        return !(index >= startIndex && index < endIndex);
      });
    }

    if (materialCheckedAll) {
      const currentFilterOptions = selectedSearchOptionsHistory.filter(
        ({ codeId }) => codeId === filterCodeIds.material
      );
      const startIndex = selectedSearchOptionsHistory.findIndex(
        ({ codeId }) => codeId === filterCodeIds.material
      );
      const endIndex = startIndex + currentFilterOptions.length - 1;

      selectedSearchOptionsHistory[endIndex] = {
        codeId: filterCodeIds.material,
        displayName: '소재, 전체',
        grouping: true,
        groupingDepth: 1,
        count: currentFilterOptions
          .map(({ count }) => count)
          .reduce((a, b) => (a as number) + (b as number), 0)
      };

      selectedSearchOptionsHistory = selectedSearchOptionsHistory.filter(({ codeId }, index) => {
        if (codeId !== filterCodeIds.material) return true;

        return !(index >= startIndex && index < endIndex);
      });
    }

    const selectedTotalCounts = [
      genderFilterOptions
        .filter(({ checked }) => checked)
        .map(({ codeId, count }) => [codeId, count]),
      categoryFilterOptions
        .map(({ parentCategories: categoryParentCategories }) =>
          categoryParentCategories
            .map(({ subParentCategories: categorySubParentCategories }) =>
              categorySubParentCategories
                .filter(({ checked }) => checked)
                .map(({ codeId, count }) => [codeId, count])
            )
            .flat()
        )
        .flat(),
      brandFilterOptions
        .filter(({ checked }) => checked)
        .map(({ codeId, count }) => [codeId, count]),
      sizeFilterOptions
        .map(({ categorySizes }) =>
          categorySizes.filter(({ checked }) => checked).map(({ codeId, count }) => [codeId, count])
        )
        .flat(),
      platformFilterOptions
        .filter(({ checked }) => checked)
        .map(({ codeId, count }) => [codeId, count]),
      lineFilterOptions
        .filter(({ checked }) => checked)
        .map(({ codeId, count }) => [codeId, count]),
      seasonFilterOptions
        .filter(({ checked }) => checked)
        .map(({ codeId, count }) => [codeId, count]),
      colorFilterOptions
        .filter(({ checked }) => checked)
        .map(({ codeId, count }) => [codeId, count]),
      materialFilterOptions
        .filter(({ checked }) => checked)
        .map(({ codeId, count }) => [codeId, count])
    ].flat();

    let selectedTotalCount = 0;

    // 기존 필터 기능 카운팅 로직 반영
    // TODO 동작이 약간 이상함, 추후 기획과 협의 후 로직 개선
    if (activeTabCodeId === filterCodeIds.detailOption) {
      const selectedSeasonFilterOptionsCount = selectedTotalCounts
        .filter((counts) => counts[0] === filterCodeIds.season)
        .map((counts) => counts[1])
        .reduce((a, b) => a + b, 0);
      const selectedMaterialFilterOptionsCount = selectedTotalCounts
        .filter((counts) => counts[0] === filterCodeIds.material)
        .map((counts) => counts[1])
        .reduce((a, b) => a + b, 0);

      if (selectedSeasonFilterOptionsCount || selectedMaterialFilterOptionsCount) {
        selectedTotalCount = Math.min(
          ...[selectedSeasonFilterOptionsCount, selectedMaterialFilterOptionsCount].filter(
            (count) => count
          )
        );
      }
    } else if (activeTabCodeId === filterCodeIds.gender) {
      selectedTotalCount =
        genderFilterOptions.filter(({ checked }) => checked).length > 1
          ? totalCount
          : selectedTotalCounts
              .filter((counts) => counts[0] === activeTabCodeId)
              .map((counts) => counts[1])
              .reduce((a, b) => a + b, 0);
    } else {
      selectedTotalCount = selectedTotalCounts
        .filter((counts) => counts[0] === activeTabCodeId)
        .map((counts) => counts[1])
        .reduce((a, b) => a + b, 0);
    }

    if (!selectedTotalCount) selectedTotalCount = totalCount;

    return {
      selectedSearchOptionsHistory,
      selectedTotalCount
    };
  }
});

export default filterOperationInfoSelector;
