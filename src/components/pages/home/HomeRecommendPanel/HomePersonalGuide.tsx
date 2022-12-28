import { useEffect, useMemo, useState } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Avatar, Box, Flexbox, Icon, Skeleton, Typography, useTheme } from 'mrcamel-ui';
import { uniqBy } from 'lodash-es';
import styled from '@emotion/styled';

import type { Category } from '@dto/category';
import type { Brand } from '@dto/brand';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchParentCategories } from '@api/category';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { defaultNonMemberPersonalGuideList } from '@constants/home';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { activeMyFilterState } from '@recoil/productsFilter';
import { accessUserSettingValuesState } from '@recoil/common';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

type HomePersonalGuide = (Brand | Category) & {
  type?: string;
  src?: string;
};

function HomePersonalGuide() {
  const router = useRouter();
  const {
    theme: {
      mode,
      palette: { common }
    }
  } = useTheme();
  const [openBanner, setOpenBanner] = useState(false);
  const setActiveMyFilterState = useSetRecoilState(activeMyFilterState);
  // TODO 일단 지금은 개인화 가이드 배너 close 여부 확인에만 활용, 추후 로그인 계정 별 설정 값 저장이 필요한 경우가 생기면 리팩터링하여 확대 적용
  const [accessUserSettingValues, setAccessUserSettingValuesState] = useRecoilState(
    accessUserSettingValuesState
  );
  const { data: parentCategories = [], isLoading: isLoadingParentCategories } = useQuery(
    queryKeys.categories.parentCategories(),
    fetchParentCategories,
    {
      select: (data) => data.flatMap(({ parentCategory }) => parentCategory)
    }
  );

  const { data: accessUser } = useQueryAccessUser();
  const {
    data: {
      info: { value: { gender = 'M' } = {} } = {},
      personalStyle: { styles = [], defaultStyles = [] } = {},
      size: { value: { tops = [], bottoms = [], shoes = [] } = {} } = {}
    } = {},
    isLoading
  } = useQueryUserInfo();

  const sizes = useMemo(() => [tops, bottoms, shoes].flat(), [tops, bottoms, shoes]);
  const defaultStylesResult = defaultStyles.map((defaultStyle) => {
    if (defaultStyle.brand) {
      return {
        ...defaultStyle.brand,
        type: 'brand',
        src: `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/${
          mode === 'light' ? 'white' : 'black'
        }/${(defaultStyle.brand.nameEng || '').toLowerCase().replace(/\s/g, '')}.jpg`
      };
    }

    if (defaultStyle.category) {
      return {
        ...defaultStyle.category,
        type: 'category',
        src: `https://${process.env.IMAGE_DOMAIN}/assets/images/category/ico_cate_${
          (defaultStyle.category || {}).subParentId || (defaultStyle.category || {}).id
        }_${(gender || 'm').toLowerCase()}.png`
      };
    }
    return {};
  });

  const guides = useMemo(() => {
    let newGuides: Array<
      Partial<Brand | Category> & {
        type?: string;
        src?: string;
      }
    > = Array.from({
      length: styles.length
    })
      .map((_, index) => [
        styles[index].brand
          ? {
              ...styles[index].brand,
              src: '',
              type: 'brand'
            }
          : styles[index].brand,
        styles[index].category
          ? {
              ...styles[index].category,
              src: '',
              type: 'category'
            }
          : styles[index].category
      ])
      .flat()
      .filter((guide) => guide)
      .map((guide: HomePersonalGuide) => ({
        ...guide,
        src:
          guide && guide.type === 'brand'
            ? `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/${
                mode === 'light' ? 'white' : 'black'
              }/${(guide.nameEng || '').toLowerCase().replace(/\s/g, '')}.jpg`
            : `https://${process.env.IMAGE_DOMAIN}/assets/images/category/ico_cate_${
                (guide || {}).subParentId || (guide || {}).id
              }_${(gender || 'm').toLowerCase()}.png`
      }))
      .slice(0, 8);

    if (newGuides.length && newGuides.length <= 8) {
      newGuides = uniqBy([...newGuides, ...defaultStylesResult], 'id').slice(0, 8);
    }

    if (!newGuides.length) {
      newGuides = defaultNonMemberPersonalGuideList;
    }

    return newGuides;
  }, [styles, mode, gender, defaultStylesResult]);

  const handleClick =
    ({ id, parentId, type, name, subParentId }: Partial<HomePersonalGuide>) =>
    () => {
      if (type === 'brand') {
        logEvent(attrKeys.home.CLICK_MAIN_BUTTON, {
          name: attrProperty.name.MAIN,
          title: attrProperty.title.BRAND,
          att: name
        });
        SessionStorage.set(sessionStorageKeys.productsEventProperties, {
          name: attrProperty.name.MAIN,
          title: attrProperty.title.BRAND,
          type: attrProperty.type.INPUT
        });
        router.push({
          pathname: `/products/brands/${name}`,
          query: {
            genders: gender === 'F' ? 'female' : 'male'
          }
        });
      } else {
        const { name: parentCategoryName } =
          parentCategories.find(({ id: parentCategoryId }) => parentCategoryId === parentId) || {};

        logEvent(attrKeys.home.CLICK_MAIN_BUTTON, {
          name: attrProperty.name.MAIN,
          title: attrProperty.title.CATEGORY,
          att: name
        });
        SessionStorage.set(sessionStorageKeys.productsEventProperties, {
          name: attrProperty.name.MAIN,
          title: attrProperty.title.CATEGORY,
          type: attrProperty.type.INPUT
        });

        const categorySizeIds = sizes
          .filter(({ parentCategoryId }) => parentCategoryId === parentId)
          .map(({ categorySizeId }) => categorySizeId);
        setActiveMyFilterState(true);
        router.push({
          pathname: `/products/categories/${(parentCategoryName || '').replace(/\(P\)/g, '')}`,
          query: {
            subParentIds: [Number(subParentId || id || 0)],
            genders: gender === 'F' ? 'female' : 'male',
            categorySizeIds,
            parentId
          }
        });
      }
    };

  const handleClickClose = () => {
    setAccessUserSettingValuesState((prevState) =>
      prevState
        .filter(({ userId }) => userId !== (accessUser || {}).userId)
        .concat([
          {
            userId: (accessUser || {}).userId || 0,
            personalGuideBannerClose: true
          }
        ])
    );
    setOpenBanner(false);
  };

  useEffect(() => {
    if (accessUser && styles.length > 0) {
      const accessUserSettingValue = accessUserSettingValues.find(
        ({ userId }) => userId === (accessUser || {}).userId
      );

      if (!accessUserSettingValue) {
        setOpenBanner(true);
      } else if (accessUserSettingValue && !accessUserSettingValue.personalGuideBannerClose) {
        setOpenBanner(true);
      }
    }
  }, [accessUser, accessUserSettingValues, styles]);

  useEffect(() => {
    if (openBanner) {
      logEvent(attrKeys.home.VIEW_PERSONAL_ONBOARDING, {
        name: attrProperty.name.MAIN
      });
    }
  }, [openBanner]);

  return (
    <section>
      {openBanner && (
        <PersonalBanner justifyContent="center" alignment="center">
          <Typography weight="medium" customStyle={{ color: common.uiWhite }}>
            찾고 있는 매물로 화면을 구성했어요!
          </Typography>
          <CloseIcon name="CloseOutlined" size="medium" onClick={handleClickClose} />
        </PersonalBanner>
      )}
      <Box customStyle={{ marginTop: 20 }}>
        <List>
          {(isLoadingParentCategories || isLoading) &&
            Array.from({ length: 8 }).map((_, index) => (
              <Flexbox
                // eslint-disable-next-line react/no-array-index-key
                key={`home-personal-guide-skeleton-${index}`}
                direction="vertical"
                gap={8}
                alignment="center"
                justifyContent="center"
                customStyle={{ minWidth: 72, maxWidth: 72 }}
              >
                <Skeleton width={48} height={48} round="50%" disableAspectRatio />
                <Skeleton width={31} height={16} round={8} disableAspectRatio />
              </Flexbox>
            ))}
          {!isLoadingParentCategories &&
            !isLoading &&
            guides.map(({ id, parentId, src = '', type, name, subParentId }) => (
              <Flexbox
                key={`home-personal-guide-${name}`}
                direction="vertical"
                gap={8}
                alignment="center"
                justifyContent="center"
                onClick={handleClick({ id, parentId, type, name, subParentId })}
                customStyle={{ minWidth: 72, maxWidth: 72 }}
              >
                <AvatarStyle src={src} alt="Personal Guide Img" />
                <Name variant="small1">{name}</Name>
              </Flexbox>
            ))}
        </List>
      </Box>
    </section>
  );
}

const PersonalBanner = styled(Flexbox)`
  display: flex;
  width: 100%;
  height: 44px;
  position: relative;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.cmn80};
  &::after {
    content: '';
    width: 0;
    height: 0;
    border-top: 6px solid
      ${({
        theme: {
          palette: { common }
        }
      }) => common.cmn80};
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    position: absolute;
    bottom: -6px;
    /* left: 50%; */
  }
`;

const CloseIcon = styled(Icon)`
  position: absolute;
  right: 20px;
  top: 11px;
  color: ${({ theme: { palette } }) => palette.common.uiWhite};
`;

const List = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 4px;
  padding: 0 12px;
  min-height: 80px;
  overflow-x: auto;
`;

const AvatarStyle = styled(Avatar)`
  width: 48px;
  height: 48px;
  padding: 4px;
  border: 1px solid ${({ theme: { palette } }) => palette.common.line01};
  border-radius: 50%;
`;

const Name = styled(Typography)`
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

export default HomePersonalGuide;
