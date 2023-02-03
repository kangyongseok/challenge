import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Grid, Image, Skeleton, Typography, useTheme } from 'mrcamel-ui';

import type { ParentCategory } from '@dto/category';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchParentCategories } from '@api/category';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  camelSellerBrandSearchValueState,
  camelSellerCategoryBrandState
} from '@recoil/camelSeller';

function CamelSellerSelectCategoryGrid() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const setCamelSellerCategoryBrandState = useSetRecoilState(camelSellerCategoryBrandState);
  const resetBrandSearchValue = useResetRecoilState(camelSellerBrandSearchValueState);

  const { data: { productParentCategories = [] } = {}, isLoading } = useQuery(
    queryKeys.categories.parentCategories(),
    fetchParentCategories
  );

  const handleClick = (parentCategory: ParentCategory) => () => {
    const { id, name } = parentCategory;
    logEvent(attrKeys.camelSeller.CLICK_CATEGORY, {
      title: attrProperty.title.PRODUCT_PARENT,
      name: attrProperty.name.PRODUCT_MAIN,
      att: name,
      data: parentCategory
    });

    setCamelSellerCategoryBrandState((prevState) => ({
      ...prevState,
      category: {
        id,
        parentId: 0,
        parentCategoryName: '',
        subParentId: 0,
        name: name.replace(/\(P\)/g, '')
      }
    }));
    SessionStorage.set(sessionStorageKeys.camelSellerSelectBrandSource, 'PRODUCT_PARENT');
    resetBrandSearchValue();
    router.replace('/camelSeller/registerConfirm/selectBrand');
  };

  return (
    <Grid container columnGap={12} rowGap={12}>
      {isLoading &&
        Array.from({ length: 6 }).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Grid key={`camel-seller-select-category-skeleton-${index}`} item xs={2}>
            <Skeleton width="100%" height={114} round={8} disableAspectRatio />
          </Grid>
        ))}
      {!isLoading &&
        productParentCategories
          .filter(({ parentCategory: { name } }) =>
            ['가방', '지갑', '상의', '하의', '신발', '기타'].includes(name.replace(/\(P\)/, ''))
          )
          .map(({ parentCategory }) => (
            <Grid key={`camel-seller-select-category-${parentCategory.id}`} item xs={2}>
              <Flexbox
                direction="vertical"
                gap={4}
                alignment="center"
                onClick={handleClick(parentCategory)}
                customStyle={{
                  padding: '20px 0',
                  border: `1px solid ${common.line01}`,
                  borderRadius: 8
                }}
              >
                <Image
                  src={`https://${process.env.IMAGE_DOMAIN}/assets/images/category/${
                    parentCategory.nameEng || 'etc'
                  }_black.png`}
                  alt={parentCategory.name}
                  width={48}
                  height={48}
                  round={8}
                  disableAspectRatio
                />
                <Typography variant="h4" weight="medium">
                  {parentCategory.name.replace(/\(P\)/g, '')}
                </Typography>
              </Flexbox>
            </Grid>
          ))}
    </Grid>
  );
}

export default CamelSellerSelectCategoryGrid;
