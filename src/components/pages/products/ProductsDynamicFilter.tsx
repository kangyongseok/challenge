import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Flexbox,
  Icon,
  Input,
  Typography,
  useTheme
} from 'mrcamel-ui';
import isEmpty from 'lodash-es/isEmpty';
import { debounce } from 'lodash-es';
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
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParams } from '@utils/products';
import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber } from '@utils/common';

import type { SelectedSearchOption } from '@typings/products';
import {
  brandFilterOptionsSelector,
  categoryFilterOptionsSelector,
  dynamicOptionsStateFamily,
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

  const handleClickLowPriceFilter = useCallback(
    (active: boolean) => () => {
      if (!active) {
        logEvent(attrKeys.products.selectIdFilter, {
          name: attrProperty.name.productList,
          att: '시세이하'
        });
      }

      setSelectedSearchOptionsState(
        ({ type, selectedSearchOptions: prevSelectedSearchOptions }) => ({
          type,
          selectedSearchOptions: prevSelectedSearchOptions.some(
            ({ codeId, id }) => codeId === filterCodeIds.id && id === idFilterIds.lowPrice
          )
            ? prevSelectedSearchOptions.filter(
                ({ codeId, id }) => !(codeId === filterCodeIds.id && id === idFilterIds.lowPrice)
              )
            : prevSelectedSearchOptions
                .filter(
                  (prevSelectedSearchOption) =>
                    prevSelectedSearchOption.codeId !== filterCodeIds.price
                )
                .concat([{ codeId: filterCodeIds.id, id: idFilterIds.lowPrice }])
        })
      );
      setSearchParamsState(
        ({ type, searchParams: { idFilterIds: prevIdFilterIds = [], ...prevSearchParams } }) => {
          const newSearchParams = {
            ...prevSearchParams,
            idFilterIds: prevIdFilterIds.includes(idFilterIds.lowPrice)
              ? prevIdFilterIds.filter((idFilterId) => idFilterId !== idFilterIds.lowPrice)
              : prevIdFilterIds?.concat([idFilterIds.lowPrice])
          };

          delete newSearchParams.maxPrice;
          delete newSearchParams.minPrice;

          return {
            type,
            searchParams: newSearchParams
          };
        }
      );
      setSearchOptionsParamsState(
        ({ type, searchParams: { idFilterIds: prevIdFilterIds = [], ...prevSearchParams } }) => {
          const newSearchParams = {
            ...prevSearchParams,
            idFilterIds: prevIdFilterIds.includes(idFilterIds.lowPrice)
              ? prevIdFilterIds.filter((idFilterId) => idFilterId !== idFilterIds.lowPrice)
              : prevIdFilterIds?.concat([idFilterIds.lowPrice])
          };

          delete newSearchParams.maxPrice;
          delete newSearchParams.minPrice;

          return {
            type,
            searchParams: newSearchParams
          };
        }
      );
    },
    [setSearchOptionsParamsState, setSearchParamsState, setSelectedSearchOptionsState]
  );

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

  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={1}
      customStyle={{
        backgroundColor: common.ui95
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
            <Title variant="body1" weight="bold">
              {title}
            </Title>
            {codeType === productDynamicOptionCodeType.color && (
              <Box customStyle={{ minHeight: 52, width: '100%', overflowX: 'auto' }}>
                <Flexbox
                  alignment="center"
                  gap={8}
                  customStyle={{ padding: '12px 20px 12px 0', width: 'fit-content' }}
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
              </Box>
            )}
            {!specifyProductDynamicOptionCodeTypes.includes(codeType) && (
              <Box customStyle={{ minHeight: 44, width: '100%', overflowX: 'auto' }}>
                <Flexbox
                  gap={4}
                  alignment="center"
                  customStyle={{ padding: '4px 20px 4px 0', width: 'fit-content' }}
                  onScroll={handleScroll}
                >
                  {codeDetails.map((codeDetail) => {
                    let active = false;

                    switch (codeType) {
                      case productDynamicOptionCodeType.line: {
                        active = selectedSearchOptions.some(
                          (selectedSearchOption) =>
                            selectedSearchOption.codeId === filterCodeIds.line &&
                            selectedSearchOption.id === codeDetail.id
                        );

                        break;
                      }
                      case productDynamicOptionCodeType.size: {
                        const { id, categorySizeId } = codeDetail as SizeCode;

                        active = selectedSearchOptions.some(
                          (selectedSearchOption) =>
                            selectedSearchOption.codeId === filterCodeIds.size &&
                            selectedSearchOption.id === id &&
                            selectedSearchOption.categorySizeId === categorySizeId
                        );

                        break;
                      }
                      case productDynamicOptionCodeType.price: {
                        const { minPrice, maxPrice } = codeDetail as PriceCode;

                        active = selectedSearchOptions.some(
                          (selectedSearchOption) =>
                            selectedSearchOption.minPrice === minPrice &&
                            selectedSearchOption.maxPrice === maxPrice
                        );

                        break;
                      }
                      case productDynamicOptionCodeType.brand: {
                        active = selectedSearchOptions.some(
                          (selectedSearchOption) =>
                            selectedSearchOption.codeId === filterCodeIds.brand &&
                            selectedSearchOption.id === codeDetail.id
                        );

                        break;
                      }
                      case productDynamicOptionCodeType.category: {
                        const { parentId, subParentId, genderId } = codeDetail as CategoryCode;

                        active = selectedSearchOptions.some(
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
                      <FilterItem
                        key={`dynamic-filter-${
                          (codeDetail as SizeCode)?.categorySizeId ||
                          `${codeDetail.codeId}-${codeDetail.id}`
                        }-${codeDetail.name}`}
                        active={active}
                        onClick={handleClickDynamicFilter({
                          codeType,
                          codeDetail,
                          filterName: codeDetail.name,
                          active
                        })}
                      >
                        {codeDetail.name}
                      </FilterItem>
                    );
                  })}
                </Flexbox>
              </Box>
            )}
            {codeType === productDynamicOptionCodeType.price && (
              <Flexbox
                alignment="center"
                gap={8}
                customStyle={{
                  minHeight: 52,
                  width: '100%',
                  overflowX: 'auto',
                  paddingRight: 16
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
                {/* TODO 추후 UI 라이브러리 CheckboxGroup 컴포넌트로 교체 */}
                <Flexbox gap={4} alignment="center">
                  <Checkbox
                    onChange={handleClickLowPriceFilter(
                      selectedSearchOptions.some(
                        (selectedSearchOption) =>
                          selectedSearchOption.codeId === filterCodeIds.id &&
                          selectedSearchOption.id === idFilterIds.lowPrice
                      )
                    )}
                    checked={selectedSearchOptions.some(
                      (selectedSearchOption) =>
                        selectedSearchOption.codeId === filterCodeIds.id &&
                        selectedSearchOption.id === idFilterIds.lowPrice
                    )}
                  />
                  <Typography
                    onClick={handleClickLowPriceFilter(
                      selectedSearchOptions.some(
                        (selectedSearchOption) =>
                          selectedSearchOption.codeId === filterCodeIds.id &&
                          selectedSearchOption.id === idFilterIds.lowPrice
                      )
                    )}
                    customStyle={{ whiteSpace: 'nowrap' }}
                  >
                    시세이하
                  </Typography>
                </Flexbox>
              </Flexbox>
            )}
          </Flexbox>
        ))}
    </Flexbox>
  );
}

const Title = styled(Typography)`
  padding: 12px 0 12px 16px;
  white-space: nowrap;
  min-width: 80px;
`;

const FilterItem = styled(Typography)<{ active?: boolean }>`
  padding: 8px;
  white-space: nowrap;
  color: ${({ active, theme: { palette } }) =>
    active ? palette.primary.light : palette.common.ui60};
  font-weight: ${({ active, theme: { typography } }) => active && typography.body1.weight.medium};
  cursor: pointer;
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
