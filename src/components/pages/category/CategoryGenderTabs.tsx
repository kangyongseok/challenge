import { useCallback } from 'react';

import { useRecoilState } from 'recoil';
import { Box, Tab, TabGroup, useTheme } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import { GENDER } from '@constants/user';
import { TAB_HEIGHT } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import categoryState from '@recoil/category';

interface CategoryGenderTabsProps {
  resetSelectedParentCategory: () => void;
}

function CategoryGenderTabs({ resetSelectedParentCategory }: CategoryGenderTabsProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [{ gender }, setCategoryState] = useRecoilState(categoryState);

  const changeSelectedValue = useCallback(
    (newValue: string | number) => {
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
      <TabGroup
        value={gender}
        onChange={changeSelectedValue}
        fullWidth
        customStyle={{ position: 'fixed', width: '100%', backgroundColor: common.uiWhite }}
      >
        {Object.entries(GENDER)
          .map(([key, value]) => ({ key, value }))
          .map(({ key, value }) => (
            <Tab key={`label-${key}`} text={value} value={key} />
          ))}
      </TabGroup>
    </Box>
  );
}

export default CategoryGenderTabs;
