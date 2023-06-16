import { Fragment, useEffect, useState } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, Flexbox, Grid, Image, Skeleton, Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import type { ParentCategories, SubParentCategory } from '@dto/category';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchParentCategories } from '@api/category';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  BOTTOM_NAVIGATION_HEIGHT,
  HEADER_HEIGHT
} from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getImageResizePath } from '@utils/common';

import { searchCategoryState } from '@recoil/search';
import { showAppDownloadBannerState } from '@recoil/common';

function CategoryGrid() {
  const router = useRouter();

  const {
    palette: { common }
  } = useTheme();

  const [filteredSubParentCategories, setFilteredSubParentCategories] = useState<
    SubParentCategory[]
  >([]);
  const [groupedParentCategories, setGroupedParentCategories] = useState<ParentCategories[][]>([]);
  const [selectedParentCategory, setSelectedParentCategory] = useState<ParentCategories>();

  const [{ gender, parentId, subParentId, selectedAll }, setSearchCategoryState] =
    useRecoilState(searchCategoryState);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const { data: { parentCategories = [] } = {}, isLoading } = useQuery(
    queryKeys.categories.parentCategories(),
    fetchParentCategories
  );

  const handleClick = (newParentId: number) => () =>
    setSearchCategoryState((prevState) => ({
      ...prevState,
      parentId: prevState.parentId === newParentId ? 0 : newParentId,
      subParentId: 0,
      selectedAll: false
    }));

  const handleClickSubParentCategoryAll = () => {
    if (!selectedParentCategory) return;

    const {
      parentCategory: { name }
    } = selectedParentCategory;

    setSearchCategoryState((prevCategory) => ({
      ...prevCategory,
      subParentId: 0,
      gender,
      selectedAll: true
    }));

    logEvent(attrKeys.category.CLICK_CATEGORY, {
      name: attrProperty.name.SEARCH,
      title: attrProperty.title.PARENT,
      type: attrProperty.type.GUIDED,
      parentCategory: name,
      category: name,
      gender: gender === 'male' ? 'M' : 'F'
    });

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.name.SEARCH,
      title: attrProperty.title.PARENT,
      type: attrProperty.type.GUIDED
    });

    router.push({
      pathname: `/products/categories/${name.replace(/\(P\)/g, '')}`,
      query: { genders: [gender] }
    });
  };

  const handleClickSubParentCategory =
    ({ id, name, newParentId }: { id: number; name: string; newParentId: number }) =>
    () => {
      const findParentCategories = groupedParentCategories
        .flat()
        .find((groupedParentCategory) => groupedParentCategory.parentCategory.id === newParentId);

      if (!findParentCategories) return;

      const {
        parentCategory: { name: parentCategoryName }
      } = findParentCategories;

      logEvent(attrKeys.category.CLICK_CATEGORY, {
        name: attrProperty.name.SEARCH,
        title: attrProperty.title.SUBPARENT,
        type: attrProperty.type.GUIDED,
        parentCategory: parentCategoryName,
        subParentIds: id,
        category: name,
        gender: gender === 'male' ? 'M' : 'F'
      });

      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.name.SEARCH,
        title: attrProperty.title.SUBPARENT,
        type: attrProperty.type.GUIDED
      });

      setSearchCategoryState((prevState) => ({
        ...prevState,
        subParentId: id,
        selectedAll: false
      }));

      router.push({
        pathname: `/products/categories/${parentCategoryName.replace(/\(P\)/g, '')}`,
        query: {
          genders: [gender],
          parentIds: [newParentId],
          subParentIds: [id]
        }
      });
    };

  useEffect(() => {
    if (isLoading) return;

    const filteredParentCategories = parentCategories.filter(
      ({ parentCategory: { name, nameEng } }) => {
        return gender === 'male' ? name !== '원피스(P)' && nameEng : nameEng;
      }
    );
    const groupSize =
      Math.floor(filteredParentCategories.length / 4) +
      (Math.floor(filteredParentCategories.length % 4) > 0 ? 1 : 0);

    const newGroupedParentCategories = [];

    for (let i = 0; i < groupSize; i += 1) {
      newGroupedParentCategories.push(filteredParentCategories.splice(0, 4));
    }

    setGroupedParentCategories(newGroupedParentCategories);
  }, [gender, parentCategories, isLoading]);

  useEffect(() => {
    setFilteredSubParentCategories(
      groupedParentCategories
        .flat()
        .map(({ subParentCategories }) => subParentCategories)
        .flat()
        .filter(
          ({ name }) =>
            !(gender === 'male' ? ['스커트', '힐/펌프스', '버킷백', '그릇'] : ['그릇']).includes(
              name
            )
        )
        .filter((subParentCategory) => subParentCategory.parentId === parentId)
    );
  }, [groupedParentCategories, gender, parentId]);

  useEffect(() => {
    setSelectedParentCategory(
      groupedParentCategories.flat().find(({ parentCategory }) => parentCategory.id === parentId)
    );
  }, [groupedParentCategories, parentId]);

  return (
    <Flexbox
      direction="vertical"
      gap={20}
      customStyle={{
        // 141: 탭그룹 + 성별 버튼 그룹 높이
        minHeight: `calc(100vh - ${
          HEADER_HEIGHT +
          BOTTOM_NAVIGATION_HEIGHT +
          141 +
          (showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0)
        }px)`
      }}
    >
      <Grid container rowGap={10}>
        {(isLoading || groupedParentCategories.length === 0) &&
          Array.from({ length: 12 })
            .map((_, index) => index)
            .map((index) => (
              <Grid key={`search-parent-category-skeleton-${index}`} item xs={4}>
                <Box
                  customStyle={{
                    maxWidth: 64,
                    margin: 'auto',
                    padding: 8,
                    borderRadius: 20
                  }}
                >
                  <Skeleton width={48} height={48} round={8} disableAspectRatio />
                </Box>
                <Skeleton
                  width={50}
                  height={20}
                  round={8}
                  disableAspectRatio
                  customStyle={{
                    margin: 'auto'
                  }}
                />
              </Grid>
            ))}
        {!isLoading &&
          groupedParentCategories.map((groupedParentCategory, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Fragment key={`search-grouped-parent-categories-${index}`}>
              {groupedParentCategory.map(({ parentCategory: { id, name, nameEng } }) => (
                <Grid key={`search-parent-category-${id}`} item xs={4} onClick={handleClick(id)}>
                  <Box
                    customStyle={{
                      maxWidth: 64,
                      margin: 'auto',
                      padding: 8,
                      borderRadius: 20,
                      backgroundColor: id === parentId ? common.bg02 : undefined
                    }}
                  >
                    {/* TODO UI 라이브러리 Image 컴포넌트 간헐적 렌더링 오동작 현상 손보는게 필요 */}
                    {gender && (
                      <Image
                        width={48}
                        height={48}
                        src={getImageResizePath({
                          imagePath: `https://${
                            process.env.IMAGE_DOMAIN
                          }/assets/images/category/ico_cate_${nameEng}_${gender.charAt(0)}.png`,
                          w: 48
                        })}
                        round={8}
                        alt={name}
                        disableAspectRatio
                      />
                    )}
                  </Box>
                  <Typography textAlign="center">{name.replace(/\(P\)/g, '')}</Typography>
                </Grid>
              ))}
              <Grid item xs={1}>
                <Flexbox
                  customStyle={{
                    display: groupedParentCategories[index]
                      .map(({ parentCategory: { id } }) => id)
                      .includes(parentId)
                      ? 'block'
                      : 'none',
                    marginTop: 10,
                    padding: '20px 32px',
                    backgroundColor: common.bg02
                  }}
                >
                  <Grid container>
                    <Grid item xs={2}>
                      <Button
                        variant="inline"
                        brandColor="black"
                        size="large"
                        fullWidth
                        onClick={handleClickSubParentCategoryAll}
                        customStyle={{
                          justifyContent: 'flex-start',
                          paddingLeft: 0,
                          paddingRight: 0,
                          fontWeight: selectedAll ? 700 : 400
                        }}
                      >
                        {groupedParentCategory
                          .find(({ parentCategory: { id } }) => id === parentId)
                          ?.parentCategory?.name.replace(/\(P\)/g, '')}{' '}
                        전체보기
                      </Button>
                    </Grid>
                    {filteredSubParentCategories.map(
                      ({
                        id,
                        name: subParentCategoryName,
                        parentId: subParentCategoryParentId
                      }) => (
                        <Grid
                          key={`search-sub-parent-category-${subParentCategoryParentId}-${id}`}
                          item
                          xs={2}
                        >
                          <Button
                            variant="inline"
                            brandColor="black"
                            size="large"
                            fullWidth
                            onClick={handleClickSubParentCategory({
                              id,
                              name: subParentCategoryName,
                              newParentId: subParentCategoryParentId
                            })}
                            customStyle={{
                              justifyContent: 'flex-start',
                              paddingLeft: 0,
                              paddingRight: 0,
                              fontWeight: subParentId === id ? 700 : 400
                            }}
                          >
                            {subParentCategoryName}
                          </Button>
                        </Grid>
                      )
                    )}
                  </Grid>
                </Flexbox>
              </Grid>
            </Fragment>
          ))}
      </Grid>
    </Flexbox>
  );
}

export default CategoryGrid;
