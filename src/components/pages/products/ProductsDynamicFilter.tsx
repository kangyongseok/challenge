import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import isEmpty from 'lodash-es/isEmpty';
import { debounce } from 'lodash-es';
import {
  Avatar,
  Box,
  Button,
  Flexbox,
  Icon,
  Input,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import type { ProductDynamicOptionCodeDetail, ProductDynamicOptionCodeType } from '@dto/product';
import type { CategoryCode, CommonCode, PriceCode, SizeCode } from '@dto/common';

import { logEvent } from '@library/amplitude';

import {
  filterCodeIds,
  filterColors,
  filterImageColorNames,
  idFilterIds,
  productDynamicFilterEventPropertyTitle,
  productDynamicOptionCodeType
} from '@constants/productsFilter';
import { IOS_SAFE_AREA_TOP } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParams } from '@utils/products';
import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, isExtendedLayoutIOSVersion } from '@utils/common';

import type { SelectedSearchOption } from '@typings/products';
import {
  brandFilterOptionsSelector,
  categoryFilterOptionsSelector,
  dynamicOptionsStateFamily,
  productsFilterProgressDoneState,
  searchOptionsStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

const specifyProductDynamicOptionCodeTypes = [
  productDynamicOptionCodeType.color,
  productDynamicOptionCodeType.price
];

function ProductsDynamicFilter() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const { searchParams: baseSearchParams } = useRecoilValue(
    searchParamsStateFamily(`base-${atomParam}`)
  );
  const { searchParams } = useRecoilValue(searchParamsStateFamily(`search-${atomParam}`));
  const { searchOptions: baseSearchOptions } = useRecoilValue(
    searchOptionsStateFamily(`base-${atomParam}`)
  );
  const setSearchParamsState = useSetRecoilState(searchParamsStateFamily(`search-${atomParam}`));
  const setSearchOptionsParamsState = useSetRecoilState(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );
  const dynamicOptions = useRecoilValue(dynamicOptionsStateFamily(atomParam));
  const brands = useRecoilValue(brandFilterOptionsSelector);
  const categories = useRecoilValue(categoryFilterOptionsSelector);
  const progressDone = useRecoilValue(productsFilterProgressDoneState);

  const [value, setValue] = useState<string | number>('');

  const isInitRef = useRef(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;

    if (Number(newValue) > getTenThousandUnitPrice(baseSearchOptions.maxPrice || 0)) {
      setValue(getTenThousandUnitPrice(baseSearchOptions.maxPrice || 0));
    } else {
      setValue(newValue);
    }
  };

  const handleScroll = debounce(() => {
    logEvent(attrKeys.products.swipeXDynamicFilter);
  }, 300);

  const handleClickDynamicFilter = useCallback(
    ({
        codeType,
        codeDetail,
        filterName,
        active
      }: {
        codeType: ProductDynamicOptionCodeType;
        codeDetail: ProductDynamicOptionCodeDetail;
        filterName: string;
        active: boolean;
      }) =>
      () => {
        if (!active) {
          logEvent(attrKeys.products.clickDynamicFilter, {
            name: attrProperty.name.productList,
            title: productDynamicFilterEventPropertyTitle[codeType],
            att: filterName.replace(/~/gi, '')
          });
          logEvent(attrKeys.products.clickApplyFilter, {
            name: attrProperty.name.productList,
            title: attrProperty.title.dynamicFilter,
            keyword: router.query?.keyword
          });
        }

        let newSelectedSearchOptions: SelectedSearchOption[] = [];

        switch (codeType) {
          case productDynamicOptionCodeType.line: {
            const { id, name } = codeDetail as CommonCode;
            newSelectedSearchOptions = selectedSearchOptions.some(
              (prevSelectedSearchOption) =>
                prevSelectedSearchOption.codeId === filterCodeIds.line &&
                prevSelectedSearchOption.id === id &&
                prevSelectedSearchOption.name === name
            )
              ? selectedSearchOptions.filter(
                  (prevSelectedSearchOption) =>
                    !(
                      prevSelectedSearchOption.codeId === filterCodeIds.line &&
                      prevSelectedSearchOption.id === id &&
                      prevSelectedSearchOption.name === name
                    )
                )
              : selectedSearchOptions.concat([{ checked: false, ...codeDetail }]);

            break;
          }
          case productDynamicOptionCodeType.size: {
            const { categorySizeId } = codeDetail as SizeCode;

            newSelectedSearchOptions = selectedSearchOptions.some(
              (prevSelectedSearchOption) =>
                prevSelectedSearchOption.codeId === filterCodeIds.size &&
                prevSelectedSearchOption.categorySizeId === categorySizeId
            )
              ? selectedSearchOptions.filter(
                  (prevSelectedSearchOption) =>
                    !(
                      prevSelectedSearchOption.codeId === filterCodeIds.size &&
                      prevSelectedSearchOption.categorySizeId === categorySizeId
                    )
                )
              : selectedSearchOptions.concat([{ checked: false, ...codeDetail }]);

            break;
          }
          case productDynamicOptionCodeType.price: {
            const { minPrice, maxPrice } = codeDetail as PriceCode;

            newSelectedSearchOptions = selectedSearchOptions.filter(
              (prevSelectedSearchOption) =>
                !(
                  prevSelectedSearchOption.codeId === filterCodeIds.id &&
                  prevSelectedSearchOption.id === idFilterIds.lowPrice
                )
            );

            if (newSelectedSearchOptions.some((option) => option.codeId === filterCodeIds.price)) {
              newSelectedSearchOptions = newSelectedSearchOptions.some(
                (option) => option.minPrice === minPrice && option.maxPrice === maxPrice
              )
                ? newSelectedSearchOptions.filter((option) => option.codeId !== filterCodeIds.price)
                : newSelectedSearchOptions.map((option) =>
                    option.codeId === filterCodeIds.price
                      ? { codeId: filterCodeIds.price, minPrice, maxPrice }
                      : option
                  );
            } else {
              newSelectedSearchOptions = newSelectedSearchOptions.concat([
                { codeId: filterCodeIds.price, minPrice, maxPrice }
              ]);
            }

            break;
          }
          case productDynamicOptionCodeType.color: {
            const { id, description } = codeDetail as CommonCode;
            newSelectedSearchOptions = selectedSearchOptions.some(
              (prevSelectedSearchOption) =>
                prevSelectedSearchOption.codeId === filterCodeIds.color &&
                prevSelectedSearchOption.id === id &&
                prevSelectedSearchOption.description === description
            )
              ? selectedSearchOptions.filter(
                  (prevSelectedSearchOption) =>
                    !(
                      prevSelectedSearchOption.codeId === filterCodeIds.color &&
                      prevSelectedSearchOption.id === id &&
                      prevSelectedSearchOption.description === description
                    )
                )
              : selectedSearchOptions.concat([{ checked: false, ...codeDetail }]);

            break;
          }
          case productDynamicOptionCodeType.brand: {
            const { id } = codeDetail as CommonCode;

            newSelectedSearchOptions = selectedSearchOptions.some(
              (prevSelectedSearchOption) =>
                prevSelectedSearchOption.codeId === filterCodeIds.brand &&
                prevSelectedSearchOption.id === id
            )
              ? selectedSearchOptions.filter(
                  (prevSelectedSearchOption) =>
                    !(
                      prevSelectedSearchOption.codeId === filterCodeIds.brand &&
                      prevSelectedSearchOption.id === id
                    )
                )
              : selectedSearchOptions.concat(brands.find((brand) => brand.id === id) || []);

            break;
          }
          case productDynamicOptionCodeType.category: {
            const { parentId, subParentId, genderId } = codeDetail as CategoryCode;
            const selectedCategories: SelectedSearchOption[] = [];

            categories.forEach((category) => {
              const selectedCategory = category.parentCategories
                .find((parentCategory) => parentCategory.id === parentId)
                ?.subParentCategories.find(
                  (subParentCategory) =>
                    subParentCategory.id === subParentId &&
                    (genderId ? subParentCategory.genderIds.includes(genderId) : true)
                );

              if (selectedCategory) selectedCategories.push(selectedCategory);
            });

            newSelectedSearchOptions = selectedSearchOptions.some(
              (prevSelectedSearchOption) =>
                prevSelectedSearchOption.codeId === filterCodeIds.category &&
                prevSelectedSearchOption.parentId === parentId &&
                prevSelectedSearchOption.id === subParentId &&
                (genderId ? prevSelectedSearchOption.genderIds?.includes(genderId) : true)
            )
              ? selectedSearchOptions.filter(
                  (prevSelectedSearchOption) =>
                    !(
                      prevSelectedSearchOption.codeId === filterCodeIds.category &&
                      prevSelectedSearchOption.parentId === parentId &&
                      prevSelectedSearchOption.id === subParentId &&
                      (genderId ? prevSelectedSearchOption.genderIds?.includes(genderId) : true)
                    )
                )
              : selectedSearchOptions.concat(selectedCategories);

            break;
          }
          default: {
            break;
          }
        }

        if (!isEmpty(newSelectedSearchOptions)) {
          const newSearchParams = convertSearchParams(newSelectedSearchOptions, {
            baseSearchParams
          });

          setSelectedSearchOptionsState(({ type }) => ({
            type,
            selectedSearchOptions: newSelectedSearchOptions
          }));
          setSearchOptionsParamsState(({ type }) => ({
            type,
            searchParams: newSearchParams
          }));
          setSearchParamsState(({ type }) => ({
            type,
            searchParams: newSearchParams
          }));
        }
      },
    [
      baseSearchParams,
      brands,
      categories,
      router.query?.keyword,
      selectedSearchOptions,
      setSearchOptionsParamsState,
      setSearchParamsState,
      setSelectedSearchOptionsState
    ]
  );

  const handleClickApplyLowerPriceFilter = useCallback(() => {
    if (!value) return;

    let newValue = Number(value);

    if (newValue < 3) {
      newValue = 3;
      setValue(3);
    }

    logEvent(attrKeys.products.clickDynamicFilter, {
      name: attrProperty.name.productList,
      title: attrProperty.title.price,
      att: commaNumber(newValue)
    });
    logEvent(attrKeys.products.clickApplyFilter, {
      name: attrProperty.name.productList,
      title: attrProperty.title.dynamicFilter,
      keyword: router.query?.keyword
    });

    setSelectedSearchOptionsState(({ type, selectedSearchOptions: prevSelectedSearchOptions }) => {
      const findPriceFilter = prevSelectedSearchOptions.find(
        ({ codeId }) => codeId === filterCodeIds.price
      );

      return {
        type,
        selectedSearchOptions: findPriceFilter
          ? prevSelectedSearchOptions
              .filter(({ codeId }) => codeId !== filterCodeIds.price)
              .concat({
                codeId: filterCodeIds.price,
                minPrice: 30000,
                maxPrice: newValue * 10000
              })
          : prevSelectedSearchOptions.concat({
              codeId: filterCodeIds.price,
              minPrice: 30000,
              maxPrice: newValue * 10000
            })
      };
    });
    setSearchParamsState(({ type, searchParams: prevSearchParams }) => {
      const newSearchParams = { ...prevSearchParams };

      delete newSearchParams.minPrice;
      delete newSearchParams.maxPrice;

      newSearchParams.minPrice = 30000;
      newSearchParams.maxPrice = newValue * 10000;

      return {
        type,
        searchParams: newSearchParams
      };
    });
    setSearchOptionsParamsState(({ type, searchParams: prevSearchParams }) => {
      const newSearchParams = { ...prevSearchParams };

      delete newSearchParams.minPrice;
      delete newSearchParams.maxPrice;

      newSearchParams.minPrice = 30000;
      newSearchParams.maxPrice = newValue * 10000;

      return {
        type,
        searchParams: newSearchParams
      };
    });
    isInitRef.current = true;
  }, [
    setSelectedSearchOptionsState,
    setSearchParamsState,
    setSearchOptionsParamsState,
    value,
    router.query?.keyword
  ]);

  useEffect(() => {
    const hasLowerPriceIdFilter = searchParams.idFilterIds?.some(
      (id) => id === idFilterIds.lowPrice
    );
    if (hasLowerPriceIdFilter && baseSearchOptions.maxPrice) {
      setValue(getTenThousandUnitPrice(baseSearchOptions.maxPrice));
    }
  }, [searchParams, baseSearchOptions.maxPrice]);

  useEffect(() => {
    if (searchParams.maxPrice && !isInitRef.current) {
      isInitRef.current = true;
      setValue(getTenThousandUnitPrice(searchParams.maxPrice));
    }
  }, [searchParams.maxPrice]);

  useEffect(() => {
    if (isInitRef.current && !searchParams.maxPrice) {
      isInitRef.current = false;
      setValue('');
    }
  }, [searchParams.maxPrice]);

  if (!dynamicOptions.length || !Object.keys(baseSearchParams).length || !progressDone) return null;

  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={1}
      customStyle={{
        backgroundColor: common.ui95,
        marginTop:
          isExtendedLayoutIOSVersion() && !router.pathname.split('/').includes('search')
            ? IOS_SAFE_AREA_TOP + 4
            : 4,
        marginBottom: 4
      }}
    >
      {dynamicOptions
        .filter(({ codeDetails }) => codeDetails.length > 0)
        .map(({ name: title, codeType, codeDetails }) => (
          <Flexbox
            key={`dynamic-filter-option-button-${codeType}-${title}`}
            alignment="center"
            customStyle={{ backgroundColor: common.uiWhite }}
          >
            <Title variant="body1" weight="medium">
              {title}
            </Title>
            {codeType === productDynamicOptionCodeType.color && (
              <Flexbox
                alignment="center"
                customStyle={{ minHeight: 45, maxHeight: 45, width: '100%', overflowX: 'auto' }}
              >
                <Flexbox
                  alignment="center"
                  gap={8}
                  customStyle={{ paddingRight: 20, width: 'fit-content' }}
                  onScroll={handleScroll}
                >
                  {codeDetails.map((codeDetail) => {
                    const { codeId, id, description } = codeDetail;
                    const needImage = filterImageColorNames.includes(description);
                    const getColorCode = filterColors[description as keyof typeof filterColors];
                    const checked = selectedSearchOptions.some(
                      (selectedSearchOption) =>
                        selectedSearchOption.codeId === filterCodeIds.color &&
                        selectedSearchOption.id === id
                    );

                    return (
                      <Flexbox
                        key={`dynamic-filter-${codeId}-${id}`}
                        customStyle={{ cursor: 'pointer' }}
                      >
                        <Box
                          customStyle={{
                            position: 'relative',
                            width: 28,
                            height: 28
                          }}
                          onClick={handleClickDynamicFilter({
                            codeType,
                            codeDetail,
                            filterName: description,
                            active: checked
                          })}
                        >
                          {needImage && (
                            <Avatar
                              width={28}
                              height={28}
                              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/colors/${description}.png`}
                              alt="Color Img"
                              round="50%"
                            />
                          )}
                          {!needImage && getColorCode && (
                            <ColorSample colorName={description} colorCode={getColorCode} />
                          )}
                          <CheckIcon
                            name="CheckOutlined"
                            size="medium"
                            checked={checked}
                            color={
                              description === 'white' || description === 'ivory'
                                ? common.uiBlack
                                : common.uiWhite
                            }
                          />
                        </Box>
                      </Flexbox>
                    );
                  })}
                </Flexbox>
              </Flexbox>
            )}
            {!specifyProductDynamicOptionCodeTypes.includes(codeType) && (
              <Flexbox
                alignment="center"
                customStyle={{ minHeight: 45, maxHeight: 45, width: '100%', overflowX: 'auto' }}
              >
                <Flexbox
                  gap={4}
                  alignment="center"
                  customStyle={{ paddingRight: 20, width: 'fit-content' }}
                  onScroll={handleScroll}
                >
                  {codeDetails.map((codeDetail) => {
                    let isActive = false;

                    switch (codeType) {
                      case productDynamicOptionCodeType.line: {
                        isActive = selectedSearchOptions.some(
                          (selectedSearchOption) =>
                            selectedSearchOption.codeId === filterCodeIds.line &&
                            selectedSearchOption.id === codeDetail.id
                        );

                        break;
                      }
                      case productDynamicOptionCodeType.size: {
                        const { id, categorySizeId } = codeDetail as SizeCode;

                        isActive = selectedSearchOptions.some(
                          (selectedSearchOption) =>
                            selectedSearchOption.codeId === filterCodeIds.size &&
                            selectedSearchOption.id === id &&
                            selectedSearchOption.categorySizeId === categorySizeId
                        );

                        break;
                      }
                      case productDynamicOptionCodeType.price: {
                        const { minPrice, maxPrice } = codeDetail as PriceCode;

                        isActive = selectedSearchOptions.some(
                          (selectedSearchOption) =>
                            selectedSearchOption.minPrice === minPrice &&
                            selectedSearchOption.maxPrice === maxPrice
                        );

                        break;
                      }
                      case productDynamicOptionCodeType.brand: {
                        isActive = selectedSearchOptions.some(
                          (selectedSearchOption) =>
                            selectedSearchOption.codeId === filterCodeIds.brand &&
                            selectedSearchOption.id === codeDetail.id
                        );

                        break;
                      }
                      case productDynamicOptionCodeType.category: {
                        const { parentId, subParentId, genderId } = codeDetail as CategoryCode;

                        isActive = selectedSearchOptions.some(
                          (selectedSearchOption) =>
                            selectedSearchOption.codeId === filterCodeIds.category &&
                            selectedSearchOption.parentId === parentId &&
                            selectedSearchOption.id === subParentId &&
                            (genderId ? selectedSearchOption.genderIds?.includes(genderId) : true)
                        );

                        break;
                      }
                      default: {
                        break;
                      }
                    }

                    return (
                      <Button
                        key={`dynamic-filter-${
                          (codeDetail as SizeCode)?.categorySizeId ||
                          `${codeDetail.codeId}-${codeDetail.id}`
                        }-${codeDetail.name}`}
                        variant="inline"
                        brandColor={isActive ? 'blue' : 'gray'}
                        onClick={handleClickDynamicFilter({
                          codeType,
                          codeDetail,
                          filterName: codeDetail.name,
                          active: isActive
                        })}
                        endIcon={
                          isActive ? (
                            <Icon
                              name="CloseOutlined"
                              width={16}
                              height={16}
                              color="ui80"
                              customStyle={{
                                width: '16px !important',
                                height: '16px !important'
                              }}
                            />
                          ) : undefined
                        }
                        customStyle={{
                          gap: 4,
                          fontWeight: isActive ? 700 : undefined,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {codeDetail.name}
                      </Button>
                    );
                  })}
                </Flexbox>
              </Flexbox>
            )}
            {codeType === productDynamicOptionCodeType.price && (
              <Flexbox
                alignment="center"
                gap={8}
                customStyle={{
                  minHeight: 61,
                  width: '100%',
                  overflowX: 'auto',
                  paddingRight: 20
                }}
              >
                <Input
                  type="number"
                  unit="만원 이하"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  fullWidth
                  onChange={handleChange}
                  value={value}
                  disabled={selectedSearchOptions.some(
                    ({ id, codeId }) => id === idFilterIds.lowPrice && codeId === filterCodeIds.id
                  )}
                />
                <Button
                  variant="ghost"
                  brandColor="black"
                  disabled={
                    selectedSearchOptions.some(
                      ({ id, codeId }) => id === idFilterIds.lowPrice && codeId === filterCodeIds.id
                    ) || !value
                  }
                  onClick={handleClickApplyLowerPriceFilter}
                  customStyle={{ whiteSpace: 'nowrap' }}
                >
                  적용
                </Button>
              </Flexbox>
            )}
          </Flexbox>
        ))}
    </Flexbox>
  );
}

const Title = styled(Typography)`
  padding-left: 20px;
  white-space: nowrap;
  min-width: 80px;
`;

const ColorSample = styled.div<{
  colorName: string;
  colorCode: string;
}>`
  width: 28px;
  height: 28px;
  border: 1px solid transparent;
  border-radius: 50%;
  background-color: ${({ colorCode }) => colorCode};

  ${({
    theme: {
      palette: { common }
    },
    colorName
  }) =>
    colorName === 'white'
      ? {
          border: `1px solid ${common.line01}`
        }
      : {}};
`;

const CheckIcon = styled(Icon)<{ checked: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  opacity: ${({ checked }) => Number(checked)};
  transform: translate(-50%, -50%);
  transition: opacity 0.1s ease-in 0s;
`;

export default ProductsDynamicFilter;
