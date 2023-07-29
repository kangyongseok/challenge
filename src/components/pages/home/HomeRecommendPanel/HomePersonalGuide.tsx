import { useEffect, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { uniqBy } from 'lodash-es';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { Flexbox, Image, Label, Skeleton, Typography, useTheme } from '@mrcamelhub/camel-ui';
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

import { getImageResizePath } from '@utils/common';

import { activeMyFilterState } from '@recoil/productsFilter';
import useSession from '@hooks/useSession';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

type PersonalGuide = (Brand | Category) & {
  type?: string;
  src?: string;
};

type PersonalNewGuide = {
  isDeleted: boolean;
  dateUpdated: string;
  dateCreated: string;
  id: number;
  groupId: number;
  tierId: number;
  name: string;
  nameEng: string;
  viewName: null;
  parentId: number;
  isLegitProduct: boolean;
  type: 'brand' | 'category';
  src: string;
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

  const { isLoggedIn } = useSession();

  const {
    data: {
      info: { value: { gender = 'M' } = {} } = {},
      personalStyle: { styles = [], defaultStyles = [] } = {},
      size: { value: { tops = '', bottoms = '', shoes = '' } = {} } = {}
    } = {},
    isInitialLoading
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

        if (isLoggedIn) {
          setActiveMyFilterState(true);
        }
        if (parentCategoryName) {
          router.push({
            pathname: `/products/categories/${(parentCategoryName || '').replace(/\(P\)/g, '')}`,
            query: {
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

  const handleClickErusha = () => {
    logEvent(attrKeys.home.CLICK_MAIN_BUTTON, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.ERUSHA,
      att: '안전결제'
    });

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.ERUSHA,
      type: attrProperty.type.GUIDED
    });

    router.push({
      pathname: '/products/categories/가방',
      query: {
        brandIds: [39, 11, 44],
        minPrice: 3000000,
        order: 'recommDesc'
      }
    });
  };

  useEffect(() => {
    const guideRenderCount = 13;
    const themeMode = mode === 'light' ? 'white' : 'black';

    const defaultStyleBrands = defaultStyles
      .filter((defaultStyle) => defaultStyle.brand)
      .map((defaultStyle) => {
        return {
          ...defaultStyle.brand,
          type: 'brand',
          src: `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/${themeMode}/${(
            defaultStyle.brand.nameEng || ''
          )
            .toLowerCase()
            .replace(/\s/g, '')}.jpg`
        };
      });
    const defaultStyleCategory = defaultStyles
      .filter((defaultStyle) => defaultStyle.category)
      .map((defaultStyle) => {
        const categoryId = defaultStyle?.category?.subParentId || defaultStyle?.category?.id;
        return {
          ...defaultStyle.category,
          type: 'category',
          src: `https://${
            process.env.IMAGE_DOMAIN
          }/assets/images/category/ico_cate_${categoryId}_${(gender || 'm').toLowerCase()}.png`
        };
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
      .slice(0, guideRenderCount) as PersonalNewGuide[];

    if (!newGuides.length) {
      setGuides(defaultNonMemberPersonalGuideList);
      return;
    }

    if (newGuides.length <= guideRenderCount) {
      const categories = uniqBy(
        [
          ...newGuides.filter((guide: PersonalNewGuide) => guide.type === 'category'),
          ...defaultStyleCategory
        ],
        'name'
      ).slice(0, 5);
      const brands = uniqBy(
        [
          ...newGuides.filter((guide: PersonalNewGuide) => guide.type === 'brand'),
          ...defaultStyleBrands
        ],
        'id'
      ).slice(0, 8);

      setGuides([...categories, ...brands]);
    }
  }, [defaultStyles, gender, mode, setGuides, styles]);

  useEffect(() => {
    setSizes([tops || [], bottoms || [], shoes || []].flat());
  }, [tops, bottoms, shoes]);

  useEffect(() => {
    if (!SessionStorage.get(sessionStorageKeys.personalProductsCache)) {
      SessionStorage.set(
        sessionStorageKeys.personalProductsCache,
        dayjs().format('YYYY-MM-DD HH:mm')
      );
    }
    return () => SessionStorage.remove(sessionStorageKeys.personalProductsCache);
  }, []);

  return (
    <List>
      {(isLoadingParentCategories || isInitialLoading || !guides.length) &&
        Array.from({ length: 16 }).map((_, index) => (
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
      {!isLoadingParentCategories && !isInitialLoading && !!guides.length && (
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
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/camel-auth.png`,
                w: 48
              })}
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
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/dog-honey.png`,
                w: 48
              })}
              alt="Personal Guide Img"
              round={12}
              disableAspectRatio
            />
            <Typography variant="body2" weight="bold" noWrap>
              급처,개꿀매모음
            </Typography>
          </Flexbox>
          <Flexbox
            direction="vertical"
            gap={8}
            alignment="center"
            justifyContent="center"
            onClick={handleClickErusha}
            customStyle={{ position: 'relative', minWidth: 72, maxWidth: 72 }}
          >
            <Label
              brandColor="red"
              text="명품백"
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
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/bag.png`,
                w: 48
              })}
              alt="Personal Guide Img"
              round={12}
              disableAspectRatio
            />
            <Typography variant="body2" weight="bold" noWrap>
              에•루•샤
            </Typography>
          </Flexbox>
        </>
      )}
      {!isLoadingParentCategories &&
        !isInitialLoading &&
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
                src={getImageResizePath({ imagePath: src, w: 40 })}
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
  grid-template-columns: repeat(8, 1fr);
  gap: 28px 8px;
  padding: 32px 12px 32px;
  min-height: 80px;
  overflow-x: auto;
`;

export default HomePersonalGuide;
