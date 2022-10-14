import { Dispatch, MouseEvent, useCallback, useEffect } from 'react';
import type { ChangeEvent } from 'react';

import { Chip, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import { Accordion } from '@components/UI/molecules';

import { ParentCategory, SubParentCategory } from '@dto/category';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import type { CategoryState } from 'pages/user/categoryInput';

import CategoryCheckbox from './CategoryCheckbox';

const MAX_CATEGORY_COUNT = 9;

interface CategoryAccordionProps {
  categoryState: CategoryState;
  setCategoryState: Dispatch<CategoryState>;
  openedParentCategoryIds: number[];
  setOpenedParentCategoryIds: Dispatch<number[]>;
  parentCategory: ParentCategory;
  subParentCategories: SubParentCategory[];
  showToast: () => void;
}

function addToArrayDedupe(array: number[], element: number) {
  return array.includes(element) ? array : [...array, element];
}

function removeFromArray(array: number[], element: number) {
  return array.filter((e) => e !== element);
}

function CategoryAccordion({
  openedParentCategoryIds,
  setOpenedParentCategoryIds,
  parentCategory,
  subParentCategories,
  categoryState,
  setCategoryState,
  showToast
}: CategoryAccordionProps) {
  const { id: parentCategoryId, name: parentCategoryName } = parentCategory;

  useEffect(() => {
    if (openedParentCategoryIds.length === 0) {
      setOpenedParentCategoryIds(categoryState.parentCategoryIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryState]);

  const handleOpenParentCategory = useCallback(() => {
    if (openedParentCategoryIds.includes(parentCategoryId)) {
      setOpenedParentCategoryIds(openedParentCategoryIds.filter((id) => id !== parentCategoryId));
    } else {
      setOpenedParentCategoryIds(openedParentCategoryIds.concat(parentCategoryId));
    }
  }, [parentCategoryId, openedParentCategoryIds, setOpenedParentCategoryIds]);

  const handleClickAllButton = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const subParentCategoryIds = subParentCategories.map(({ id }) => id);

    if (categoryState.selectAllCategoryIds.includes(parentCategoryId)) {
      const nextSubParentCategoryIds = categoryState.subParentCategoryIds.filter(
        (stateSubParentCategoryId) => !subParentCategoryIds.includes(stateSubParentCategoryId)
      );

      setCategoryState({
        parentCategoryIds: removeFromArray(categoryState.parentCategoryIds, parentCategoryId),
        subParentCategoryIds: nextSubParentCategoryIds,
        selectAllCategoryIds: removeFromArray(categoryState.selectAllCategoryIds, parentCategoryId)
      });
    } else {
      // MAX_CATEGORY_COUNT 체크를 위해 Set union 연산 실행
      const copy = Array.from(
        new Set([...categoryState.subParentCategoryIds, ...subParentCategoryIds])
      );

      if (copy.length > MAX_CATEGORY_COUNT) {
        showToast();
        return;
      }

      setOpenedParentCategoryIds(openedParentCategoryIds.concat(parentCategoryId));
      setCategoryState({
        parentCategoryIds: addToArrayDedupe(categoryState.parentCategoryIds, parentCategoryId),
        subParentCategoryIds: copy,
        selectAllCategoryIds: addToArrayDedupe(categoryState.selectAllCategoryIds, parentCategoryId)
      });
    }
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    if (target.checked) {
      logEvent(attrKeys.userInput.SELECT_ITEM, {
        name: 'CATEGORY',
        att: target.dataset.name
      });
      if (categoryState.subParentCategoryIds.length >= MAX_CATEGORY_COUNT) {
        showToast();
        return;
      }

      const nextSubParentCategoryIds = addToArrayDedupe(
        categoryState.subParentCategoryIds,
        Number(target.dataset.id)
      );
      const allChecked = subParentCategories.every(({ id }) =>
        nextSubParentCategoryIds.includes(id)
      );
      const nextSelectAllCategoryIds = allChecked
        ? addToArrayDedupe(categoryState.selectAllCategoryIds, parentCategoryId)
        : categoryState.selectAllCategoryIds;

      setCategoryState({
        parentCategoryIds: addToArrayDedupe(categoryState.parentCategoryIds, parentCategoryId),
        subParentCategoryIds: nextSubParentCategoryIds,
        selectAllCategoryIds: nextSelectAllCategoryIds
      });
    } else {
      const nextSubParentCategoryIds = removeFromArray(
        categoryState.subParentCategoryIds,
        Number(target.dataset.id)
      );
      // 해당 parentCategoryId가 state에 남아있어야 하는 지 체크.
      const stateContainsParentCategory = nextSubParentCategoryIds.some(
        (selectedSubParentCategoryId) =>
          !!subParentCategories.find(({ id }) => selectedSubParentCategoryId === id)
      );
      const nextParentCategoryIds = !stateContainsParentCategory
        ? removeFromArray(categoryState.parentCategoryIds, parentCategoryId)
        : categoryState.parentCategoryIds;

      const nextSelectAllCategoryIds = categoryState.selectAllCategoryIds.includes(
        parentCategory.id
      )
        ? removeFromArray(categoryState.selectAllCategoryIds, parentCategory.id)
        : categoryState.selectAllCategoryIds;

      setCategoryState({
        parentCategoryIds: nextParentCategoryIds,
        subParentCategoryIds: nextSubParentCategoryIds,
        selectAllCategoryIds: nextSelectAllCategoryIds
      });
    }
  };

  const buttonActive = categoryState.selectAllCategoryIds.includes(parentCategoryId);
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <Accordion
      variant="contained"
      summary={parentCategoryName.replace('(P)', '')}
      expanded={openedParentCategoryIds.includes(parentCategoryId)}
      changeExpandedStatus={handleOpenParentCategory}
      customStyle={{
        overflow: 'initial'
      }}
      customButton={
        <Flexbox
          alignment="center"
          customStyle={{
            marginLeft: '12px'
          }}
        >
          <Chip
            size="xsmall"
            variant={buttonActive ? 'contained' : 'outlined'}
            onClick={handleClickAllButton}
            brandColor={buttonActive ? 'black' : undefined}
          >
            <Typography
              variant="small2"
              weight="medium"
              customStyle={{
                color: buttonActive ? 'white' : common.ui60
              }}
            >
              전체선택
            </Typography>
          </Chip>
        </Flexbox>
      }
    >
      <Flexbox
        customStyle={{
          flexWrap: 'wrap'
        }}
      >
        {subParentCategories.map(({ id: subParentCategoryId, name: subParentCategoryName }) => {
          return (
            <CategoryCheckbox
              key={`sub-category-${subParentCategoryId}`}
              name={subParentCategoryName}
              parent={parentCategory.name}
              onChange={handleOnChange}
              id={subParentCategoryId}
              ids={categoryState.subParentCategoryIds}
            />
          );
        })}
      </Flexbox>
    </Accordion>
  );
}

export default CategoryAccordion;
