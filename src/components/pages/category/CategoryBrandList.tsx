import { useCallback } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import { BrandList } from '@components/UI/organisms';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import categoryState from '@recoil/category';

function CategoryBrandList() {
  const {
    theme: { palette }
  } = useTheme();
  const router = useRouter();
  const { gender } = useRecoilValue(categoryState);

  const handleClickBrand = ({
    id: _id,
    name: _name,
    callback
  }: {
    id: number;
    name: string;
    callback: () => void;
  }) => {
    logEvent(attrKeys.category.CLICK_BRAND_NAME, {
      name: attrProperty.productName.CATEGORY,
      title: attrProperty.productTitle.RECOMMEND
    });
    callback();
  };

  const handleClickBrandAll = useCallback(() => {
    logEvent(attrKeys.category.CLICK_BRAND_LIST, {
      name: attrProperty.productName.CATEGORY
    });
    router.push('/brand');
  }, [router]);

  return (
    <Flexbox component="section" direction="vertical" gap={20} customStyle={{ padding: '20px 0' }}>
      <Typography variant="h3" weight="bold" customStyle={{ padding: '0 20px' }}>
        추천 브랜드
      </Typography>
      <BrandList
        color="white"
        gender={gender}
        customStyle={{ gap: '20px 0', padding: '0 12px' }}
        onClickBrand={handleClickBrand}
      />
      <Box customStyle={{ padding: '12px 20px 0' }}>
        <Button
          fullWidth
          variant="ghost"
          onClick={handleClickBrandAll}
          customStyle={{ color: palette.common.grey['20'] }}
        >
          브랜드 전체보기
        </Button>
      </Box>
    </Flexbox>
  );
}

export default CategoryBrandList;
