import { useCallback } from 'react';

import { Flexbox, Typography } from 'mrcamel-ui';

import { CategoryList } from '@components/UI/organisms';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function SearchCategoryList() {
  const { data: accessUser } = useQueryAccessUser();

  const handleClickCategory = useCallback(
    ({
      parentId: _parentId,
      subParentId: _subParentId,
      parentCategoryName: _parentCategoryName,
      subParentCategoryName,
      callback
    }: {
      parentId: number | null;
      subParentId: number | null;
      parentCategoryName: string;
      subParentCategoryName: string;
      callback: () => void;
    }) => {
      logEvent(attrKeys.search.CLICK_MAIN_BUTTON, {
        name: attrProperty.productName.SEARCHMODAL,
        title: attrProperty.productTitle.CATEGORY,
        att: subParentCategoryName
      });
      callback();
    },
    []
  );

  return (
    <Flexbox component="section" direction="vertical" gap={12} customStyle={{ marginTop: 52 }}>
      <Typography variant="h4" weight="bold" customStyle={{ padding: '0 20px' }}>
        {accessUser ? '자주 찾는 카테고리' : '인기 카테고리'}
      </Typography>
      <CategoryList variant="outlined" onClickCategory={handleClickCategory} />
    </Flexbox>
  );
}
export default SearchCategoryList;
