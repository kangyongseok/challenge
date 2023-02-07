import { useMemo, useRef } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, Image, Skeleton, Typography, useTheme } from 'mrcamel-ui';
import { isEmpty } from 'lodash-es';
import { useQuery } from '@tanstack/react-query';

import type { AllBrand } from '@dto/brand';

import { logEvent } from '@library/amplitude';

import { fetchBrands, fetchBrandsSuggest } from '@api/brand';

import queryKeys from '@constants/queryKeys';
import { conGroups, doubleCon } from '@constants/consonant';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { parseWordToConsonant, sortBrand } from '@utils/brands';

import {
  camelSellerBrandSearchValueState,
  camelSellerCategoryBrandState,
  camelSellerTempSaveDataState
} from '@recoil/camelSeller';
import useDebounce from '@hooks/useDebounce';

// eslint-disable-next-line no-useless-escape
export const koRegexp = /^[\w`.~!@#$%^&*|\\;:\/?]/;

interface CamelSellerSelectBrandListProps {
  triggered: boolean;
}

function CamelSellerSelectBrandList({ triggered }: CamelSellerSelectBrandListProps) {
  const router = useRouter();

  const {
    theme: {
      mode,
      palette: { common }
    }
  } = useTheme();

  const [{ sizes, categorySizeIds }, setCamelSellerTempSaveDataState] = useRecoilState(
    camelSellerTempSaveDataState
  );
  const { category } = useRecoilValue(camelSellerCategoryBrandState);
  const value = useRecoilValue(camelSellerBrandSearchValueState);
  const resetBrandSearchValue = useResetRecoilState(camelSellerBrandSearchValueState);

  const debouncedValue = useDebounce(value, 300);

  const brandsRef = useRef<HTMLDivElement[][]>([]);

  const { data = [], isLoading } = useQuery(queryKeys.brands.all, fetchBrands);
  const { data: searchBrands = [], isLoading: isLoadingSearch } = useQuery(
    queryKeys.brands.brandName(debouncedValue),
    () => fetchBrandsSuggest({ keyword: debouncedValue }),
    {
      enabled: !!debouncedValue,
      onSuccess(newData) {
        logEvent(attrKeys.camelSeller.LOAD_KEYWORD_AUTO, {
          name: attrProperty.name.PRODUCT_MAIN,
          title: attrProperty.title.BRAND,
          keyword: debouncedValue,
          brands: newData.map(({ name }) => name)
        });
      }
    }
  );

  const brands = useMemo(() => {
    return (!debouncedValue ? data : searchBrands)
      .filter(({ brandIds = [], collaboIds }) => brandIds.length === 1 && isEmpty(collaboIds))
      .map((brand) => {
        let con = koRegexp.test(parseWordToConsonant(brand.name[0]))
          ? '#'
          : parseWordToConsonant(brand.name[0]);

        const findConGroup = conGroups.find((conGroup) => conGroup.includes(con));

        if (findConGroup) {
          con = findConGroup[1] as string;
        }

        return {
          ...brand,
          con
        };
      })
      .sort((a, b) => sortBrand(a.name, b.name));
  }, [data, debouncedValue, searchBrands]);

  const cons = useMemo(() => {
    const newCons = Array.from(new Set(brands.map(({ con }) => con)));
    const filteredCons = newCons.filter((k: string) => !koRegexp.test(k) && !doubleCon.includes(k));

    if (newCons.some((k: string) => koRegexp.test(k))) filteredCons.push('#');

    return filteredCons;
  }, [brands]);

  const handleClick = (brand: AllBrand) => () => {
    const { id, name, nameEng, brandIds = [] } = brand;
    logEvent(attrKeys.camelSeller.CLICK_BRAND, {
      title: attrProperty.title.BRAND,
      name: attrProperty.name.PRODUCT_MAIN,
      att: name,
      data: brand
    });

    if (categorySizeIds.length || sizes) {
      setCamelSellerTempSaveDataState((prevState) => ({
        ...prevState,
        quoteTitle: `${name} ${category.id ? category.name : prevState.category.name}`,
        category: category.id ? category : prevState.category,
        brand: {
          id,
          name: nameEng
            .split(' ')
            .map(
              (splitNameEng) =>
                `${splitNameEng.charAt(0).toUpperCase()}${splitNameEng.slice(
                  1,
                  splitNameEng.length
                )}`
            )
            .join(' ')
        },
        brandIds,
        size: { id: 0, name: '' },
        sizes: '',
        categorySizeIds: [],
        sizeOptionIds: []
      }));
    } else {
      setCamelSellerTempSaveDataState((prevState) => ({
        ...prevState,
        quoteTitle: `${name} ${category.id ? category.name : prevState.category.name}`,
        category: category.id ? category : prevState.category,
        brand: {
          id,
          name: nameEng
            .split(' ')
            .map(
              (splitNameEng) =>
                `${splitNameEng.charAt(0).toUpperCase()}${splitNameEng.slice(
                  1,
                  splitNameEng.length
                )}`
            )
            .join(' ')
        },
        brandIds
      }));
    }
    resetBrandSearchValue();
    router.back();
  };

  const handleClickCon = (con: string) => () => {
    brandsRef.current.forEach((brandRefs) => {
      let scrollTo = false;
      brandRefs.forEach((brandRef) => {
        if (brandRef.getAttribute('data-con') === con && !scrollTo) {
          scrollTo = true;
          window.scrollTo({
            top: brandRef.offsetTop - 112, // -(Header + Search Input Height)
            behavior: 'smooth'
          });
        }
      });
    });
  };

  const handleClickDirectInput = () => {
    logEvent(attrKeys.camelSeller.CLICK_BRAND, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.KEYWORD,
      att: debouncedValue
    });

    setCamelSellerTempSaveDataState((prevState) => ({
      ...prevState,
      quoteTitle: `${debouncedValue} ${category.name}`,
      category,
      brand: { id: 0, name: debouncedValue },
      brands: debouncedValue
    }));
    resetBrandSearchValue();
    router.back();
  };

  return (
    <Flexbox
      component="section"
      customStyle={{
        marginTop: 8
      }}
    >
      <Flexbox
        direction="vertical"
        customStyle={{
          flexGrow: 1
        }}
      >
        {(isLoading || isLoadingSearch) &&
          Array.from({ length: 20 }).map((_, index) => (
            <Flexbox
              // eslint-disable-next-line react/no-array-index-key
              key={`camel-seller-select-brand-skeleton-${index}`}
              gap={20}
              alignment="center"
              customStyle={{
                height: 72
              }}
            >
              <Skeleton width={56} height={56} round={8} disableAspectRatio />
              <Flexbox
                direction="vertical"
                gap={4}
                customStyle={{
                  flexGrow: 1
                }}
              >
                <Skeleton width="100%" maxWidth={100} height={20} round={8} disableAspectRatio />
                <Skeleton width="100%" maxWidth={70} height={16} round={8} disableAspectRatio />
              </Flexbox>
            </Flexbox>
          ))}
        {!isLoading &&
          !isLoadingSearch &&
          cons.map((con, index) =>
            brands
              .filter((brand) => con === brand.con)
              .flat()
              .map((brand, brandIndex) => (
                <Flexbox
                  key={`camel-seller-select-brand-${brand.nameEng}`}
                  ref={(ref) => {
                    if (ref) {
                      if (!brandsRef.current[index]) brandsRef.current[index] = [];

                      brandsRef.current[index][brandIndex] = ref;
                    }
                  }}
                  gap={20}
                  alignment="center"
                  data-con={con}
                  onClick={handleClick(brand)}
                  customStyle={{
                    height: 72
                  }}
                >
                  <Image
                    width={56}
                    height={56}
                    src={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/${
                      mode === 'light' ? 'white' : 'black'
                    }/${brand.nameEng.toLowerCase().replace(/\s/g, '')}.jpg`}
                    alt="Brand Logo Img"
                    round={8}
                    disableAspectRatio
                  />
                  <Flexbox direction="vertical" gap={4}>
                    <Typography variant="h4" weight="medium">
                      {brand.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      customStyle={{
                        color: common.ui60
                      }}
                    >
                      {brand.nameEng
                        .split(' ')
                        .map(
                          (splitNameEng) =>
                            `${splitNameEng.charAt(0).toUpperCase()}${splitNameEng.slice(
                              1,
                              splitNameEng.length
                            )}`
                        )
                        .join(' ')}
                    </Typography>
                  </Flexbox>
                </Flexbox>
              ))
          )}
        {!isLoading && !isLoadingSearch && brands.length === 0 && (
          <Flexbox
            alignment="center"
            onClick={handleClickDirectInput}
            customStyle={{
              height: 72
            }}
          >
            <Typography variant="h4" weight="medium">
              [{debouncedValue}](으)로 브랜드 입력
            </Typography>
          </Flexbox>
        )}
      </Flexbox>
      <Flexbox
        direction="vertical"
        customStyle={{
          position: triggered ? 'fixed' : 'static',
          top: 112,
          right: 12,
          marginRight: triggered ? 0 : -8,
          height: triggered ? 'calc(100vh - 112px)' : 'calc(100vh - 204px)',
          overflowY: 'auto'
        }}
      >
        {!isLoading &&
          !isLoadingSearch &&
          cons.map((con) => (
            <Typography
              key={`camel-seller-select-brand-con-${con}`}
              variant="body2"
              onClick={handleClickCon(con)}
              customStyle={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 32,
                minWidth: 40,
                minHeight: 32,
                color: common.ui60
              }}
            >
              {con}
            </Typography>
          ))}
      </Flexbox>
    </Flexbox>
  );
}

export default CamelSellerSelectBrandList;
