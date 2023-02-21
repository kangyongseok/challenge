import { useEffect, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, Image, Label, Skeleton, Typography, useTheme } from 'mrcamel-ui';
import { uniqBy } from 'lodash-es';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import type { SizeResult } from '@dto/user';
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
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

type PersonalGuide = (Brand | Category) & {
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

  const setActiveMyFilterState = useSetRecoilState(activeMyFilterState);

  const [sizes, setSizes] = useState<SizeResult[]>([]);
  const [guides, setGuides] = useState<Array<Partial<PersonalGuide>>>([]);

  const { data: parentCategories = [], isLoading: isLoadingParentCategories } = useQuery(
    queryKeys.categories.parentCategories(),
    fetchParentCategories,
    {
      select: ({ parentCategories: newParentCategories = [] }) =>
        (newParentCategories || []).flatMap(({ parentCategory }) => parentCategory)
    }
  );

  const { data: accessUser } = useQueryAccessUser();

  const {
    data: {
      info: { value: { gender = 'M' } = {} } = {},
      personalStyle: { styles = [], defaultStyles = [] } = {},
      size: { value: { tops = '', bottoms = '', shoes = '' } = {} } = {}
    } = {},
    isLoading
  } = useQueryUserInfo();

  const handleClick =
    ({ id, parentId, type, name, subParentId }: Partial<PersonalGuide>) =>
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
            genders: gender === 'F' ? 'female' : 'male',
            idFilterIds: [5]
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

        if (accessUser) {
          setActiveMyFilterState(true);
        }
        if (parentCategoryName) {
          router.push({
            pathname: `/products/categories/${(parentCategoryName || '').replace(/\(P\)/g, '')}`,
            query: {
              idFilterIds: [5],
              subParentIds: [Number(subParentId || id || 0)],
              genders: gender === 'F' ? 'female' : 'male',
              categorySizeIds,
              parentIds: [Number(parentId)]
            }
          });
        }
      }
    };

  const handleClickCamelAuth = () => {
    logEvent(attrKeys.home.CLICK_MAIN_BUTTON, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.CONTENT,
      att: '카멜인증'
    });

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.CAMEL,
      type: attrProperty.type.GUIDED
    });

    router.push({
      pathname: '/products/camel',
      query: {
        idFilterIds: [5]
      }
    });
  };

  const handleClickDogHoney = () => {
    logEvent(attrKeys.home.CLICK_MAIN_BUTTON, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.CONTENT,
      att: '급처,개꿀매모음'
    });

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.name.EVENT_DETAIL,
      title: '2301_DOG_HONEY',
      type: attrProperty.type.GUIDED
    });

    router.push('/events/dogHoney');
  };

  useEffect(() => {
    const guideRenderCount = 8;
    const themeMode = mode === 'light' ? 'white' : 'black';
    const defaultStylesResult = defaultStyles.map((defaultStyle) => {
      const categoryId = defaultStyle?.category?.subParentId || defaultStyle?.category?.id;

      if (defaultStyle.brand) {
        return {
          ...defaultStyle.brand,
          type: 'brand',
          src: `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/${themeMode}/${(
            defaultStyle.brand.nameEng || ''
          )
            .toLowerCase()
            .replace(/\s/g, '')}.jpg`
        };
      }

      if (defaultStyle.category) {
        return {
          ...defaultStyle.category,
          type: 'category',
          src: `https://${
            process.env.IMAGE_DOMAIN
          }/assets/images/category/ico_cate_${categoryId}_${(gender || 'm').toLowerCase()}.png`
        };
      }
      return {};
    });
    const divisionStyles = styles
      .map((style) => {
        return [
          { ...style.brand, type: 'brand' },
          { ...style.category, type: 'category' }
        ];
      })
      .flat();
    const newGuides = divisionStyles
      .map((divisionStyle) => {
        const imageName = divisionStyle.nameEng?.toLowerCase().replace(/\s/g, '');
        const categoryId = divisionStyle?.subParentId || divisionStyle?.id;

        if (divisionStyle && divisionStyle.type === 'brand') {
          return {
            ...divisionStyle,
            src: `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/${themeMode}/${imageName}.jpg`
          };
        }
        if (divisionStyle && divisionStyle.type === 'category') {
          return {
            ...divisionStyle,
            src: `https://${
              process.env.IMAGE_DOMAIN
            }/assets/images/category/ico_cate_${categoryId}_${(gender || 'm').toLowerCase()}.png`
          };
        }

        return {};
      })
      .slice(0, guideRenderCount);

    if (!newGuides.length) {
      setGuides(defaultNonMemberPersonalGuideList);
      return;
    }
    if (newGuides.length <= guideRenderCount) {
      setGuides(uniqBy([...newGuides, ...defaultStylesResult], 'id').slice(0, guideRenderCount));
    }
  }, [defaultStyles, gender, mode, setGuides, styles]);

  useEffect(() => {
    setSizes([tops || [], bottoms || [], shoes || []].flat());
  }, [tops, bottoms, shoes]);

  return (
    <List>
      {(isLoadingParentCategories || isLoading || !guides.length) &&
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
            <Skeleton width={48} height={48} round={12} disableAspectRatio />
            <Skeleton width={42} height={16} round={8} disableAspectRatio />
          </Flexbox>
        ))}
      {!isLoadingParentCategories && !isLoading && (
        <>
          <Flexbox
            direction="vertical"
            gap={8}
            alignment="center"
            justifyContent="center"
            onClick={handleClickCamelAuth}
            customStyle={{ position: 'relative', minWidth: 72, maxWidth: 72 }}
          >
            <Label
              brandColor="red"
              text="정품보장"
              size="xsmall"
              round={9}
              customStyle={{
                position: 'absolute',
                top: -18,
                left: '50%',
                zIndex: 1,
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap'
              }}
            />
            <Image
              width={48}
              height={48}
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/home/camel-auth.png`}
              alt="Personal Guide Img"
              round={12}
              disableAspectRatio
            />
            <Typography variant="body2" weight="bold" noWrap>
              카멜인증
            </Typography>
          </Flexbox>
          <Flexbox
            direction="vertical"
            gap={8}
            alignment="center"
            justifyContent="center"
            onClick={handleClickDogHoney}
            customStyle={{ position: 'relative', minWidth: 72, maxWidth: 72 }}
          >
            <Label
              brandColor="red"
              text="꿀매물"
              size="xsmall"
              round={9}
              customStyle={{
                position: 'absolute',
                top: -18,
                left: '50%',
                zIndex: 1,
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap'
              }}
            />
            <Image
              width={48}
              height={48}
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/home/dog-honey.png`}
              alt="Personal Guide Img"
              round={12}
              disableAspectRatio
            />
            <Typography variant="body2" weight="bold" noWrap>
              급처,개꿀매모음
            </Typography>
          </Flexbox>
        </>
      )}
      {!isLoadingParentCategories &&
        !isLoading &&
        guides.map(({ name = '', src = '', ...guide }) => (
          <Flexbox
            key={`home-personal-guide-${name}`}
            direction="vertical"
            gap={8}
            alignment="center"
            justifyContent="center"
            onClick={handleClick({ name, ...guide })}
            customStyle={{ minWidth: 72, maxWidth: 72 }}
          >
            <Flexbox
              alignment="center"
              justifyContent="center"
              customStyle={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: common.bg02
              }}
            >
              <Image
                width={40}
                height={40}
                src={src}
                alt="Personal Guide Img"
                round={12}
                disableAspectRatio
                customStyle={{
                  mixBlendMode: 'darken'
                }}
              />
            </Flexbox>
            <Typography variant="body2" noWrap>
              {name}
            </Typography>
          </Flexbox>
        ))}
    </List>
  );
}

const List = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 8px;
  padding: 22px 12px 32px;
  min-height: 80px;
  overflow-x: auto;
`;

export default HomePersonalGuide;
