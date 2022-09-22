import { useCallback } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import isEmpty from 'lodash-es/isEmpty';
import { debounce } from 'lodash-es';
import styled from '@emotion/styled';

import { ProductDynamicOptionCodeDetail, ProductDynamicOptionCodeType } from '@dto/product';
import { CategoryCode, CommonCode, PriceCode, SizeCode } from '@dto/common';

import { logEvent } from '@library/amplitude';

import {
  filterCodeIds,
  filterColorImagePositions,
  filterColorImagesInfoLarge,
  filterColors,
  idFilterIds,
  productDynamicFilterEventPropertyTitle,
  productDynamicOptionCodeType
} from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParams } from '@utils/products';

import { SelectedSearchOption } from '@typings/products';
import {
  brandFilterOptionsSelector,
  categoryFilterOptionsSelector,
  dynamicOptionsStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

function ProductsDynamicFilter() {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const { searchParams: baseSearchParams } = useRecoilValue(
    searchParamsStateFamily(`base-${atomParam}`)
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
        ({ type, searchParams: { idFilterIds: prevIdFilterIds = [], ...prevSearchParams } }) => ({
          type,
          searchParams: {
            ...prevSearchParams,
            idFilterIds: prevIdFilterIds.includes(idFilterIds.lowPrice)
              ? prevIdFilterIds.filter((idFilterId) => idFilterId === idFilterIds.lowPrice)
              : prevIdFilterIds?.concat([idFilterIds.lowPrice])
          }
        })
      );
      setSearchOptionsParamsState(
        ({ type, searchParams: { idFilterIds: prevIdFilterIds = [], ...prevSearchParams } }) => ({
          type,
          searchParams: {
            ...prevSearchParams,
            idFilterIds: prevIdFilterIds.includes(idFilterIds.lowPrice)
              ? prevIdFilterIds.filter((idFilterId) => idFilterId === idFilterIds.lowPrice)
              : prevIdFilterIds?.concat([idFilterIds.lowPrice])
          }
        })
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
            const { parentId, subParentId } = codeDetail as CategoryCode;
            const selectedCategories: SelectedSearchOption[] = [];

            categories.forEach((category) => {
              const selectedCategory = category.parentCategories
                .find((parentCategory) => parentCategory.id === parentId)
                ?.subParentCategories.find(
                  (subParentCategory) => subParentCategory.id === subParentId
                );

              if (selectedCategory) selectedCategories.push(selectedCategory);
            });

            newSelectedSearchOptions = selectedSearchOptions.some(
              (prevSelectedSearchOption) =>
                prevSelectedSearchOption.codeId === filterCodeIds.category &&
                prevSelectedSearchOption.parentId === parentId &&
                prevSelectedSearchOption.id === subParentId
            )
              ? selectedSearchOptions.filter(
                  (prevSelectedSearchOption) =>
                    !(
                      prevSelectedSearchOption.codeId === filterCodeIds.category &&
                      prevSelectedSearchOption.parentId === parentId &&
                      prevSelectedSearchOption.id === subParentId
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

  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={1}
      customStyle={{
        backgroundColor: common.grey['95'],
        borderTop: `1px solid ${common.grey['95']}`
      }}
    >
      {dynamicOptions
        .filter(({ codeDetails }) => codeDetails.length > 0)
        .map(({ name: title, codeType, codeDetails }) => (
          <Flexbox
            key={`dynamic-filter-option-button-${codeType}-${title}`}
            alignment="center"
            customStyle={{ backgroundColor: common.white }}
          >
            <Title variant="body1" weight="bold">
              {title}
            </Title>
            {codeType === productDynamicOptionCodeType.color ? (
              <Box customStyle={{ minHeight: 52, width: '100%', overflowX: 'auto' }}>
                <Flexbox
                  alignment="center"
                  gap={4}
                  customStyle={{ padding: '12px 20px 12px 0', width: 'fit-content' }}
                  onScroll={handleScroll}
                >
                  {codeDetails.map((codeDetail) => {
                    const { codeId, id, description } = codeDetail;
                    const getColorImageInfo =
                      filterColorImagesInfoLarge[
                        description as keyof typeof filterColorImagePositions
                      ];
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
                          customStyle={{ position: 'relative' }}
                          onClick={handleClickDynamicFilter({
                            codeType,
                            codeDetail,
                            filterName: description,
                            active: checked
                          })}
                        >
                          {getColorImageInfo && (
                            <ColorImageSample
                              name={description}
                              colorImageInfo={getColorImageInfo}
                            />
                          )}
                          {!getColorImageInfo && getColorCode && (
                            <ColorSample colorCode={getColorCode} />
                          )}
                          <CheckIcon
                            name="CheckOutlined"
                            size="medium"
                            checked={checked}
                            color={description === 'white' ? primary.main : common.white}
                          />
                        </Box>
                      </Flexbox>
                    );
                  })}
                </Flexbox>
              </Box>
            ) : (
              <Box customStyle={{ minHeight: 44, width: '100%', overflowX: 'auto' }}>
                <Flexbox
                  gap={4}
                  alignment="center"
                  customStyle={{ padding: '4px 20px 4px 0', width: 'fit-content' }}
                  onScroll={handleScroll}
                >
                  {codeType === productDynamicOptionCodeType.price && (
                    <FilterItem
                      active={selectedSearchOptions.some(
                        (selectedSearchOption) =>
                          selectedSearchOption.codeId === filterCodeIds.id &&
                          selectedSearchOption.id === idFilterIds.lowPrice
                      )}
                      onClick={handleClickLowPriceFilter(
                        selectedSearchOptions.some(
                          (selectedSearchOption) =>
                            selectedSearchOption.codeId === filterCodeIds.id &&
                            selectedSearchOption.id === idFilterIds.lowPrice
                        )
                      )}
                    >
                      시세이하
                    </FilterItem>
                  )}
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
                        const { parentId, subParentId } = codeDetail as CategoryCode;

                        active = selectedSearchOptions.some(
                          (selectedSearchOption) =>
                            selectedSearchOption.codeId === filterCodeIds.category &&
                            selectedSearchOption.parentId === parentId &&
                            selectedSearchOption.id === subParentId
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
    active ? palette.primary.light : palette.common.grey['60']};
  font-weight: ${({ active, theme: { typography } }) => active && typography.body1.weight.medium};
  cursor: pointer;
`;

const ColorSample = styled.div<{
  colorCode: string;
}>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${({ colorCode }) => colorCode};
  margin: 0 4px;
`;

const ColorImageSample = styled.div<{
  name: string;
  colorImageInfo: { size: number; position: number[] };
}>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: ${({ name, theme: { palette } }) =>
    name === 'white' && `1px solid ${palette.common.grey['90']}`};
  background-size: ${({ colorImageInfo: { size } }) => size}px;
  background-image: url('https://${process.env
    .IMAGE_DOMAIN}/assets/images/ico/filter_color_ico.png');
  background-position: ${({ colorImageInfo: { position } }) => `${position[0]}px ${position[1]}px`};
  margin: 0 4px;
`;

const CheckIcon = styled(Icon)<{ checked: boolean }>`
  position: absolute;
  opacity: ${({ checked }) => Number(checked)};
  transform: translate(41%, -122%);
  transition: opacity 0.1s ease-in 0s;
`;

export default ProductsDynamicFilter;
