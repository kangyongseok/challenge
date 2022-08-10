import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Typography } from 'mrcamel-ui';
import omitBy from 'lodash-es/omitBy';
import isEmpty from 'lodash-es/isEmpty';

import CategoryList from '@components/UI/organisms/CategoryList';
import { BrandList } from '@components/UI/organisms';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { filterGenders } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  searchHelperPopupStateFamily,
  searchParamsState,
  selectedSearchOptionsDefault,
  selectedSearchOptionsState
} from '@recoil/searchHelper';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface HomeBrandsCategoriesProps {
  isViewSearchHelperOnboarding: () => boolean;
}

function HomeBrandsCategories({ isViewSearchHelperOnboarding }: HomeBrandsCategoriesProps) {
  const router = useRouter();
  const setSearchParams = useSetRecoilState(searchParamsState);
  const [selectedSearchOptions, setSelectedSearchOptions] = useRecoilState(
    selectedSearchOptionsState
  );
  const setSearchHelperPopup = useSetRecoilState(searchHelperPopupStateFamily('continue'));
  const { data: accessUser } = useQueryAccessUser();
  const { data: { info: { value: { gender = '' } = {} } = {} } = {} } = useQueryUserInfo();
  const genderName = gender === 'F' ? 'female' : 'male';
  const genderId = filterGenders[genderName as keyof typeof filterGenders].id;

  const handleClickBrand = ({
    id,
    name,
    callback
  }: {
    id: number;
    name: string;
    callback: () => void;
  }) => {
    logEvent(attrKeys.home.CLICK_MAIN, {
      title: 'BRAND',
      att: name
    });

    if (isViewSearchHelperOnboarding()) {
      setSelectedSearchOptions({
        ...selectedSearchOptionsDefault,
        pathname: router.pathname,
        brand: { id, name },
        gender: gender ? { id: genderId, name: genderName } : selectedSearchOptionsDefault.gender
      });
      setSearchParams(
        omitBy(
          {
            brandIds: [id],
            genderIds: gender ? [genderId, filterGenders.common.id] : []
          },
          isEmpty
        )
      );
      return;
    }

    if (selectedSearchOptions.brand.id === id) {
      setSearchHelperPopup(true);
      return;
    }

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.BRAND,
      type: attrProperty.productType.INPUT
    });

    callback();
  };

  const handleClickCategory = ({
    parentId,
    subParentId,
    parentCategoryName,
    subParentCategoryName,
    callback
  }: {
    parentId: number | null;
    subParentId: number | null;
    parentCategoryName: string;
    subParentCategoryName: string;
    callback: () => void;
  }) => {
    logEvent(attrKeys.home.CLICK_MAIN, {
      title: 'CATEGORY',
      att: subParentCategoryName
    });

    if (isViewSearchHelperOnboarding()) {
      setSelectedSearchOptions({
        ...selectedSearchOptionsDefault,
        pathname: router.pathname,
        gender: gender ? { id: genderId, name: genderName } : selectedSearchOptionsDefault.gender,
        parentCategory: { id: parentId || 0, name: parentCategoryName },
        subParentCategory: { id: subParentId || 0, name: subParentCategoryName }
      });
      setSearchParams(
        omitBy(
          {
            genderIds: gender ? [genderId, filterGenders.common.id] : [],
            parentIds: parentId ? [parentId] : [],
            subParentIds: subParentId ? [subParentId] : []
          },
          isEmpty
        )
      );
      return;
    }

    if (
      selectedSearchOptions.subParentCategory.id > 0
        ? selectedSearchOptions.parentCategory.id === parentId &&
          selectedSearchOptions.subParentCategory.id === subParentId
        : selectedSearchOptions.parentCategory.id === parentId
    ) {
      setSearchHelperPopup(true);
      return;
    }

    callback();
  };

  return (
    <Flexbox component="section" direction="vertical" gap={12}>
      <Flexbox direction="vertical" gap={20} customStyle={{ padding: '20px 0' }}>
        <Typography
          variant="h4"
          weight="bold"
          brandColor="black"
          customStyle={{ padding: '0 20px' }}
        >
          {accessUser ? '자주 찾는' : '인기'} 브랜드 & 카테고리
        </Typography>
        <BrandList onClickBrand={handleClickBrand} />
      </Flexbox>
      <Box customStyle={{ padding: '20px 0' }}>
        <CategoryList onClickCategory={handleClickCategory} />
      </Box>
    </Flexbox>
  );
}

export default HomeBrandsCategories;
