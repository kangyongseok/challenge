import type { Dispatch, MouseEvent, SetStateAction } from 'react';
import { useCallback, useMemo } from 'react';

import { useRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Image } from '@components/UI/atoms';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchParentCategories } from '@api/category';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import categoryState from '@recoil/category';

interface CategoryListProps {
  selectedParentCategory: number;
  setSelectedParentCategory: Dispatch<SetStateAction<number>>;
}

function CategoryList({ selectedParentCategory, setSelectedParentCategory }: CategoryListProps) {
  const router = useRouter();
  const { data: parentCategories = [] } = useQuery(
    queryKeys.categories.parentCategories(),
    fetchParentCategories
  );
  const [{ parentId, subParentId, gender }, setCategoryState] = useRecoilState(categoryState);
  const isMale = gender === 'male';

  const groupedCategories = useMemo(() => {
    const filteredParentCategories = parentCategories.filter(
      ({ parentCategory: { name, nameEng } }) =>
        isMale ? name !== '원피스(P)' && nameEng : nameEng
    );
    const newGroupedCategoriesLength =
      Math.floor(filteredParentCategories.length / 4) +
      (Math.floor(filteredParentCategories.length % 4) > 0 ? 1 : 0);
    const newGroupedCategories = [];

    for (let i = 0; i <= newGroupedCategoriesLength; i += 1) {
      newGroupedCategories.push(filteredParentCategories.splice(0, 4));
    }

    return newGroupedCategories.filter((category) => category.length);
  }, [isMale, parentCategories]);

  const handleClickParentCategory = useCallback(
    (parentCategoryId: number) => () => {
      setCategoryState((currVal) => ({ ...currVal, parentId: 0, subParentId: 0 }));
      setSelectedParentCategory(selectedParentCategory === parentCategoryId ? 0 : parentCategoryId);
    },
    [selectedParentCategory, setCategoryState, setSelectedParentCategory]
  );

  const handleClickSubParentCategoryAll = useCallback(
    (selectedParentCategoryId: number, selectedParentName: string) => () => {
      setCategoryState((prevCategory) => ({
        ...prevCategory,
        parentId: selectedParentCategoryId,
        subParentId: 0,
        gender
      }));
      logEvent(attrKeys.category.CLICK_CATEGORY, {
        name: 'CATEGORY',
        title: 'PARENT',
        type: 'GUIDED',
        parentCategory: selectedParentName,
        subParentIds: '',
        category: selectedParentName,
        gender: gender === 'male' ? 'M' : 'F'
      });
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.productName.CATEGORY,
        title: attrProperty.productTitle.PARENT,
        type: attrProperty.productType.GUIDED
      });
      router.push(
        `/products/categories/${selectedParentName.replace(/\(P\)/g, '')}?genders=${gender}`
      );
    },
    [gender, router, setCategoryState]
  );

  const handleClickSubParentCategory = useCallback(
    ({
        parentCategoryName,
        parentCategoryId,
        subParentCategoryId,
        subParentCategoryName
      }: {
        parentCategoryName: string;
        parentCategoryId: number;
        subParentCategoryId: number;
        subParentCategoryName: string;
      }) =>
      (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        logEvent(attrKeys.category.CLICK_CATEGORY, {
          name: 'CATEGORY',
          title: 'SUBPARENT',
          type: 'GUIDED',
          parentCategory: parentCategoryName,
          subParentIds: subParentCategoryId,
          category: subParentCategoryName,
          gender: isMale ? 'M' : 'F'
        });
        setCategoryState((prevCategory) => ({
          ...prevCategory,
          parentId: parentCategoryId,
          subParentId: subParentCategoryId,
          gender
        }));
        SessionStorage.set(sessionStorageKeys.productsEventProperties, {
          name: attrProperty.productName.CATEGORY,
          title: attrProperty.productTitle.SUBPARENT,
          type: attrProperty.productType.GUIDED
        });
        router.push({
          pathname: `/products/categories/${parentCategoryName.replace(/\(P\)/g, '')}`,
          query: {
            genders: [gender],
            parentIds: [parentCategoryId],
            subParentIds: [subParentCategoryId]
          }
        });
      },
    [gender, isMale, router, setCategoryState]
  );

  return (
    <Flexbox component="section" direction="vertical" gap={20} customStyle={{ padding: '20px 0' }}>
      <Typography variant="h3" weight="bold" customStyle={{ padding: '0 20px' }}>
        카테고리
      </Typography>
      {groupedCategories.map((groupedCategory, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Box key={`grouped-category-${index}`}>
          <ParentCategoryList>
            {groupedCategory.map(
              ({
                parentCategory: {
                  id: parentCategoryId,
                  name: parentCategoryName,
                  nameEng: parentCategoryNameEng
                }
              }) => (
                <Flexbox
                  key={`parent-category-${parentCategoryId}`}
                  direction="vertical"
                  gap={4}
                  customStyle={{ margin: 'auto' }}
                  onClick={handleClickParentCategory(parentCategoryId)}
                >
                  <ImageBox isSelected={selectedParentCategory === parentCategoryId}>
                    <Image
                      src={`https://${
                        process.env.IMAGE_DOMAIN
                      }/assets/images/category/ico_cate_${parentCategoryNameEng}_${gender.charAt(
                        0
                      )}.jpg`}
                      width={48}
                      height={48}
                      disableAspectRatio
                      customStyle={{ mixBlendMode: 'multiply' }}
                    />
                  </ImageBox>
                  <Typography
                    weight={selectedParentCategory === parentCategoryId ? 'bold' : 'regular'}
                  >
                    {parentCategoryName.replace(/\(P\)/g, '')}
                  </Typography>
                </Flexbox>
              )
            )}
          </ParentCategoryList>
          {groupedCategory.map(
            ({
              parentCategory: { id: parentCategoryId, name: parentCategoryName },
              subParentCategories
            }) => (
              <SubParentCategoryList
                key={`sub-parent-category-${parentCategoryId}`}
                isSelected={selectedParentCategory === parentCategoryId}
              >
                <SubParentCategory
                  variant="h4"
                  weight={parentId === parentCategoryId && subParentId === 0 ? 'bold' : 'regular'}
                  brandColor={
                    parentId === parentCategoryId && subParentId === 0 ? 'primary' : 'black'
                  }
                  isSelected={selectedParentCategory === parentCategoryId}
                  onClick={handleClickSubParentCategoryAll(parentCategoryId, parentCategoryName)}
                >
                  {parentCategoryName.replace(/\(P\)/g, '')} 전체보기
                </SubParentCategory>
                {subParentCategories
                  .filter(
                    ({ name: subParentCategoryName }) =>
                      !(
                        gender === 'male' ? ['스커트', '힐/펌프스', '버킷백', '그릇'] : ['그릇']
                      ).includes(subParentCategoryName)
                  )
                  .map(({ id: subParentCategoryId, name: subParentCategoryName }) => (
                    <SubParentCategory
                      key={`sub-parent-category-${subParentCategoryId}`}
                      variant="h4"
                      weight={subParentId === subParentCategoryId ? 'bold' : 'regular'}
                      brandColor={subParentId === subParentCategoryId ? 'primary' : 'black'}
                      isSelected={selectedParentCategory === parentCategoryId}
                      onClick={handleClickSubParentCategory({
                        parentCategoryName,
                        parentCategoryId,
                        subParentCategoryId,
                        subParentCategoryName
                      })}
                    >
                      {subParentCategoryName}
                    </SubParentCategory>
                  ))}
              </SubParentCategoryList>
            )
          )}
        </Box>
      ))}
    </Flexbox>
  );
}

const ParentCategoryList = styled.div`
  padding: 0 12px;
  text-align: center;
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: repeat(4, minmax(0, 1fr));
`;

const ImageBox = styled.div<{ isSelected: boolean }>`
  padding: 8px;
  background-color: ${({ theme: { palette }, isSelected }) =>
    isSelected && palette.common.grey['95']};
  border-radius: 20px;
`;

const SubParentCategoryList = styled.div<{ isSelected: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  background-color: ${({ theme }) => theme.palette.common.grey['98']};
  opacity: ${({ isSelected }) => Number(isSelected)};
  padding: ${({ isSelected }) => (isSelected ? '20px 32px' : '0px 32px')};
  margin-top: ${({ isSelected }) => (isSelected ? 20 : 0)}px;
  transition: padding 0.2s ease-in-out;
`;

const SubParentCategory = styled(Typography)<{ isSelected: boolean }>`
  max-height: ${({ isSelected }) => !isSelected && 0};
  padding: ${({ isSelected }) => (isSelected ? '12px 0' : 0)};
`;

export default CategoryList;
