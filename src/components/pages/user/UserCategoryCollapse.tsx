import { Dispatch, useEffect, useRef, useState } from 'react';

import { useQuery } from 'react-query';
import { Flexbox } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { fetchParentCategories } from '@api/category';

import queryKeys from '@constants/queryKeys';

import type { CategoryState } from 'pages/user/categoryInput';

import CategoryAccordion from './CategoryAccordion';

interface CategoryCollapseInputProps {
  categoryState: CategoryState;
  setCategoryState: Dispatch<CategoryState>;
  showToast: () => void;
}

function UserCategoryCollapse({
  categoryState,
  setCategoryState,
  showToast
}: CategoryCollapseInputProps) {
  const { data: parentCategories } = useQuery(
    queryKeys.categories.parentCategories(),
    fetchParentCategories
  );
  const wrapRef = useRef(null);
  const [openedParentCategoryIds, setOpenedParentCategoryIds] = useState<number[]>([]);

  useEffect(() => {
    if (openedParentCategoryIds.includes(443) && wrapRef.current) {
      (wrapRef.current as HTMLElement).scrollTo(0, document.body.scrollHeight + 180);
    }
  }, [openedParentCategoryIds]);

  if (!parentCategories) {
    return null;
  }

  return (
    <AccordionWrap direction="vertical" component="section" ref={wrapRef}>
      {parentCategories.map(({ parentCategory, subParentCategories }) => {
        if (subParentCategories.length === 0) {
          return null;
        }
        return (
          <CategoryAccordion
            key={`parent-category-${parentCategory.id}`}
            parentCategory={parentCategory}
            subParentCategories={subParentCategories}
            openedParentCategoryIds={openedParentCategoryIds}
            setOpenedParentCategoryIds={setOpenedParentCategoryIds}
            categoryState={categoryState}
            setCategoryState={setCategoryState}
            showToast={showToast}
          />
        );
      })}
    </AccordionWrap>
  );
}

const AccordionWrap = styled(Flexbox)`
  margin: 16px 0;
  flex-grow: 1;
  overflow: auto;
  height: calc(100vh - 280px);
`;

export default UserCategoryCollapse;
