import type { MouseEvent } from 'react';
import { useCallback } from 'react';

import { useRecoilState } from 'recoil';
import { Box } from 'mrcamel-ui';

import { Tabs } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { GENDER } from '@constants/user';
import { TAB_HEIGHT } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import categoryState from '@recoil/category';

interface CategoryGenderTabsProps {
  resetSelectedParentCategory: () => void;
}

function CategoryGenderTabs({ resetSelectedParentCategory }: CategoryGenderTabsProps) {
  const [{ gender }, setCategoryState] = useRecoilState(categoryState);

  const changeSelectedValue = useCallback(
    (_: MouseEvent<HTMLButtonElement> | null, newValue: string) => {
      logEvent(attrKeys.category.CLICK_CATEGORY_GENDER, {
        name: 'CATEGORY',
        gender: newValue === 'male' ? 'M' : 'F'
      });
      setCategoryState((prevCategory) => ({
        ...prevCategory,
        parentId: 0,
        subParentId: 0,
        gender: newValue as keyof typeof GENDER
      }));
      resetSelectedParentCategory();
    },
    [setCategoryState, resetSelectedParentCategory]
  );

  return (
    <Box component="section" customStyle={{ minHeight: TAB_HEIGHT, zIndex: 1 }}>
      <Tabs
        value={gender}
        changeValue={changeSelectedValue}
        labels={Object.entries(GENDER).map(([key, value]) => ({ key, value }))}
        customStyle={{ position: 'fixed', width: '100%' }}
      />
    </Box>
  );
}

export default CategoryGenderTabs;
