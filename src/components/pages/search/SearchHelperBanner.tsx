import { memo } from 'react';

import { useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Chip, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import omitBy from 'lodash-es/omitBy';
import isEmpty from 'lodash-es/isEmpty';
import styled from '@emotion/styled';

import { fetchParentCategories } from '@api/category';

import queryKeys from '@constants/queryKeys';
import { filterGenders } from '@constants/productsFilter';

import { checkAgent } from '@utils/common';

import {
  searchParamsState,
  selectedSearchOptionsDefault,
  selectedSearchOptionsState
} from '@recoil/searchHelper';
import type { SelectedSearchOptions } from '@recoil/searchHelper';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

interface SearchHelperBannerProps {
  showText?: boolean;
  keyword?: string;
  brandName?: string;
  brandId?: number;
  categoryName?: string;
  parentId?: number;
  subParentId?: number;
}
function SearchHelperBanner({
  showText = false,
  keyword = '',
  brandName = '',
  brandId,
  categoryName = '',
  parentId,
  subParentId
}: SearchHelperBannerProps) {
  const router = useRouter();
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const setSelectedSearchOptions = useSetRecoilState(selectedSearchOptionsState);
  const setSearchParams = useSetRecoilState(searchParamsState);
  const { data: parentCategories = [] } = useQuery(
    queryKeys.categories.parentCategories(),
    fetchParentCategories
  );
  const { userNickName } = useQueryMyUserInfo();
  const { data: { info: { value: { gender = '' } = {} } = {} } = {} } = useQueryUserInfo();
  const parentCategory = parentCategories.find((item) => item.parentCategory.id === parentId);
  const parentName = parentCategory?.parentCategory.name.replace('(P)', '') || '';
  const subParentName =
    parentCategory?.subParentCategories.find(
      (subParentCategory) => subParentCategory.id === subParentId
    )?.name || '';
  const searchKeyword = `${brandName || ''} ${categoryName || ''}`.trim() || keyword;

  const handleClickStart = () => {
    const genderName = gender === 'F' ? 'female' : 'male';
    const genderId = filterGenders[genderName].id;
    const newSelectedSearchOptions: SelectedSearchOptions = {
      ...selectedSearchOptionsDefault,
      pathname: router.pathname
    };

    if (brandId) newSelectedSearchOptions.brand = { id: brandId, name: brandName };

    if (gender) newSelectedSearchOptions.gender = { id: genderId, name: genderName };

    if (parentId) newSelectedSearchOptions.parentCategory = { id: parentId, name: parentName };

    if (
      subParentId &&
      (keyword?.replace(brandName, '') === categoryName ||
        subParentName.split('/').some((name) => keyword.includes(name)))
    )
      newSelectedSearchOptions.subParentCategory = { id: subParentId, name: subParentName };

    setSelectedSearchOptions(newSelectedSearchOptions);
    setSearchParams({
      ...omitBy(
        {
          brandIds: brandId ? [brandId] : [],
          genderIds: gender ? [genderId, filterGenders.common.id] : [],
          parentIds: parentId ? [parentId] : [],
          subParentIds:
            subParentId && subParentName.split('/').some((name) => keyword.includes(name))
              ? [subParentId]
              : []
        },
        isEmpty
      )
    });

    router.push('/searchHelper/brandCategorySize');
  };

  return checkAgent.isMobileApp() ? (
    <Wrapper>
      <Flexbox justifyContent="space-between" alignment="center">
        <Flexbox direction="vertical" customStyle={{ maxWidth: 'calc(100% - 42px)' }}>
          <Flexbox>
            <Typography variant="body1" weight="bold" customStyle={{ whiteSpace: 'nowrap' }}>
              검색집사로&nbsp;
            </Typography>
            {!!searchKeyword && (
              <Keyword variant="body1" weight="bold">
                {searchKeyword}&nbsp;
              </Keyword>
            )}
            <Typography
              variant="body1"
              weight="bold"
              customStyle={{ color: primary.main, whiteSpace: 'nowrap' }}
            >
              꿀매물&nbsp;
            </Typography>
            <Typography variant="body1" weight="bold" customStyle={{ whiteSpace: 'nowrap' }}>
              바로 득템 📡
            </Typography>
          </Flexbox>
          <Typography variant="body2" weight="medium">
            {userNickName}님을 위한 득템 파트너
          </Typography>
        </Flexbox>
        <Chip variant="solid" brandColor="primary" onClick={handleClickStart} size="small">
          {showText && (
            <Typography variant="body2" weight="bold" customStyle={{ color: common.uiWhite }}>
              시작하기
            </Typography>
          )}
          <Icon name="ArrowRightOutlined" size="small" />
        </Chip>
      </Flexbox>
    </Wrapper>
  ) : null;
}

const Wrapper = styled.section`
  padding: 16px 20px;
  background-color: ${({
    theme: {
      palette: { primary }
    }
  }) => primary.highlight};
`;

const Keyword = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({
    theme: {
      palette: { primary }
    }
  }) => primary.main};
`;

export default memo(SearchHelperBanner);
