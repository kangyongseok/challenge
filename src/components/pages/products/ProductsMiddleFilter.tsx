import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Flexbox,
  Icon,
  Input,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import type { ProductDynamicOptionCodeDetail, ProductDynamicOptionCodeType } from '@dto/product';
import type { CategoryCode, SizeCode } from '@dto/common';

import { logEvent } from '@library/amplitude';

import {
  filterCodeIds,
  filterColors,
  filterGenders,
  filterImageColorNames,
  idFilterIds,
  needReverseCheckFilterColorNames,
  productDynamicFilterEventPropertyTitle,
  productDynamicOptionCodeType,
  productFilterEventPropertyTitle
} from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParams } from '@utils/products';
import { getTenThousandUnitPrice } from '@utils/formats';

import type { SelectedSearchOption } from '@typings/products';
import {
  dynamicOptionsStateFamily,
  searchOptionsStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

interface ProductsMiddleFilterProps {
  isFetched: boolean;
  measure?: () => void;
}

const getCodeIdByCodeType = (codeType: number) => {
  if (productDynamicOptionCodeType.color === codeType) {
    return filterCodeIds.color;
  }
  if (productDynamicOptionCodeType.line === codeType) {
    return filterCodeIds.line;
  }
  if (productDynamicOptionCodeType.size === codeType) {
    return filterCodeIds.size;
  }
  return filterCodeIds.brand;
};

function ProductsMiddleFilter({ isFetched, measure }: ProductsMiddleFilterProps) {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );
  const setSearchOptionsParamsState = useSetRecoilState(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const setSearchParamsState = useSetRecoilState(searchParamsStateFamily(`search-${atomParam}`));
  const { searchParams: baseSearchParams } = useRecoilValue(
    searchParamsStateFamily(`base-${atomParam}`)
  );
  const { searchOptions: baseSearchOptions } = useRecoilValue(
    searchOptionsStateFamily(`base-${atomParam}`)
  );
  const dynamicOptions = useRecoilValue(dynamicOptionsStateFamily(atomParam));

  const [middleFilterSelectedSearchOptions, setMiddleFilterSelectedSearchOptions] = useState<
    SelectedSearchOption[]
  >([]);
  const [value, setValue] = useState<string | number>('');

  const isInitRef = useRef(false);

  const handleClick =
    ({
      codeType: newCodeType,
      codeDetail
    }: {
      codeType: ProductDynamicOptionCodeType;
      codeDetail: ProductDynamicOptionCodeDetail;
    }) =>
    () => {
      if (productDynamicOptionCodeType.size === newCodeType) {
        const {
          parentCategoryId: codeDetailParentCategoryId,
          categorySizeId: codeDetailCategorySizeId
        } = codeDetail as SizeCode;
        const selectedSearchOption = middleFilterSelectedSearchOptions.find(
          ({ codeId, parentCategoryId, categorySizeId }) =>
            codeId === filterCodeIds.size &&
            parentCategoryId === codeDetailParentCategoryId &&
            categorySizeId === codeDetailCategorySizeId
        );

        if (selectedSearchOption) {
          setMiddleFilterSelectedSearchOptions(
            middleFilterSelectedSearchOptions.filter(
              ({ categorySizeId, codeId, parentCategoryId }) =>
                codeId !== selectedSearchOption.codeId ||
                parentCategoryId !== selectedSearchOption.parentCategoryId ||
                categorySizeId !== selectedSearchOption.categorySizeId
            )
          );
        } else {
          logEvent(attrKeys.products.SELECT_FILTER, {
            name: attrProperty.name.MIDDLE_FILTER,
            title: productDynamicFilterEventPropertyTitle[newCodeType],
            att: codeDetail.name || codeDetail.description
          });
          setMiddleFilterSelectedSearchOptions(
            middleFilterSelectedSearchOptions.concat({
              ...codeDetail,
              codeId: filterCodeIds.size,
              checked: false
            })
          );
        }
      } else if (
        productDynamicOptionCodeType.color === newCodeType ||
        productDynamicOptionCodeType.line === newCodeType ||
        productDynamicOptionCodeType.brand === newCodeType
      ) {
        const selectedSearchOptionIndex = middleFilterSelectedSearchOptions.findIndex(
          ({ codeId, id }) => codeId === getCodeIdByCodeType(newCodeType) && id === codeDetail.id
        );

        if (selectedSearchOptionIndex > -1) {
          setMiddleFilterSelectedSearchOptions((prevMiddleFilterSelectedSearchOptions) =>
            prevMiddleFilterSelectedSearchOptions.filter(
              (_, index) => index !== selectedSearchOptionIndex
            )
          );
        } else {
          logEvent(attrKeys.products.SELECT_FILTER, {
            name: attrProperty.name.MIDDLE_FILTER,
            title: productDynamicFilterEventPropertyTitle[newCodeType],
            att: codeDetail.name || codeDetail.description
          });
          setMiddleFilterSelectedSearchOptions((prevMiddleFilterSelectedSearchOptions) =>
            prevMiddleFilterSelectedSearchOptions.concat({
              ...codeDetail,
              codeId: getCodeIdByCodeType(newCodeType),
              checked: false
            })
          );
        }
      } else if (productDynamicOptionCodeType.category === newCodeType) {
        const {
          parentId: codeDetailParentId,
          subParentId: codeDetailSubParentId,
          genderId
        } = codeDetail as CategoryCode;
        const selectedSearchOptionIndex = middleFilterSelectedSearchOptions.findIndex(
          ({ parentId, id, genderIds }) =>
            parentId === codeDetailParentId &&
            id === codeDetailSubParentId &&
            (genderId ? genderIds?.includes(genderId) : true)
        );

        if (selectedSearchOptionIndex > -1) {
          setMiddleFilterSelectedSearchOptions((prevMiddleFilterSelectedSearchOptions) =>
            prevMiddleFilterSelectedSearchOptions.filter(
              ({ parentId, id, genderIds }) =>
                !(
                  parentId === codeDetailParentId &&
                  id === codeDetailSubParentId &&
                  (genderId ? genderIds?.includes(genderId) : true)
                )
            )
          );
        } else {
          logEvent(attrKeys.products.SELECT_FILTER, {
            name: attrProperty.name.MIDDLE_FILTER,
            title: productDynamicFilterEventPropertyTitle[newCodeType],
            att: codeDetail.name || codeDetail.description
          });
          setMiddleFilterSelectedSearchOptions((prevMiddleFilterSelectedSearchOptions) =>
            genderId
              ? prevMiddleFilterSelectedSearchOptions.concat({
                  ...codeDetail,
                  id: codeDetailSubParentId,
                  codeId: filterCodeIds.category,
                  genderIds: [filterGenders.common.id, genderId],
                  checked: false
                })
              : prevMiddleFilterSelectedSearchOptions
                  .concat({
                    ...codeDetail,
                    id: codeDetailSubParentId,
                    codeId: filterCodeIds.category,
                    genderIds: [filterGenders.common.id, filterGenders.male.id],
                    checked: false
                  })
                  .concat({
                    ...codeDetail,
                    id: codeDetailSubParentId,
                    codeId: filterCodeIds.category,
                    genderIds: [filterGenders.common.id, filterGenders.female.id],
                    checked: false
                  })
          );
        }
      }
    };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;

    if (Number(newValue) > getTenThousandUnitPrice(baseSearchOptions.maxPrice || 0)) {
      setValue(getTenThousandUnitPrice(baseSearchOptions.maxPrice || 0));
    } else {
      setValue(newValue);
    }
  };

  const handleClickApply = () => {
    let newMiddleFilterSelectedSearchOptions = [...middleFilterSelectedSearchOptions];

    if (value) {
      let newValue = Number(value);

      if (newValue < 3) {
        newValue = 3;
        setValue(3);
      }

      newMiddleFilterSelectedSearchOptions = newMiddleFilterSelectedSearchOptions.concat({
        codeId: filterCodeIds.price,
        minPrice: 30000,
        maxPrice: newValue * 10000
      });
    }

    const newSelectedSearchOptions = selectedSearchOptions.concat(
      newMiddleFilterSelectedSearchOptions
    );

    logEvent(attrKeys.products.CLICK_APPLYFILTER, {
      name: attrProperty.name.MIDDLE_FILTER,
      title: Array.from(
        new Set(
          newSelectedSearchOptions.map(({ codeId }) => {
            if (codeId === filterCodeIds.id) {
              return 'LOWER_PRICE';
            }
            return productFilterEventPropertyTitle[codeId];
          })
        )
      )
        .filter((title) => title)
        .join(',')
    });

    setSelectedSearchOptionsState(({ type }) => ({
      type,
      selectedSearchOptions: newSelectedSearchOptions
    }));
    setSearchOptionsParamsState(({ type }) => ({
      type,
      searchParams: convertSearchParams(newSelectedSearchOptions, {
        baseSearchParams
      })
    }));
    setSearchParamsState(({ type }) => ({
      type,
      searchParams: convertSearchParams(newSelectedSearchOptions, {
        baseSearchParams
      })
    }));
    setMiddleFilterSelectedSearchOptions([]);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (measure && typeof measure === 'function' && isFetched) {
      measure();
    }
  }, [measure, isFetched]);

  useEffect(() => {
    if (
      middleFilterSelectedSearchOptions.some(
        ({ codeId, id }) => codeId === filterCodeIds.id && id === idFilterIds.lowPrice
      )
    ) {
      isInitRef.current = false;
      setValue('');
    }
  }, [middleFilterSelectedSearchOptions, baseSearchOptions.maxPrice]);

  if (isFetched && (!dynamicOptions || !dynamicOptions.length)) return null;

  return (
    <Box
      customStyle={{
        padding: '8px 0',
        backgroundColor: common.bg02
      }}
    >
      <Box
        customStyle={{
          padding: '32px 20px',
          backgroundColor: common.bg01
        }}
      >
        <Typography variant="h3" weight="bold">
          원하는 매물 빨리 찾기 🔍
        </Typography>
        <Typography
          color="ui60"
          customStyle={{
            margin: '4px 0 20px'
          }}
        >
          필터를 써서 맘에 드는 매물만 골라보세요.
        </Typography>
        {dynamicOptions
          .filter(({ codeDetails }) => codeDetails.length > 0)
          .slice(0, 4)
          .map(({ name, codeType, codeDetails }) => {
            if (codeType === productDynamicOptionCodeType.price) {
              return (
                <Flexbox
                  key={`products-middle-filter-${name}`}
                  alignment="center"
                  customStyle={{
                    position: 'relative',
                    minHeight: 60,
                    borderTop: `1px solid ${common.line02}`
                  }}
                >
                  <Typography weight="medium" color="ui60" customStyle={{ minWidth: 72 }}>
                    {name}
                  </Typography>
                  <Flexbox gap={8} customStyle={{ flex: 1 }}>
                    <Input
                      type="number"
                      unit="만원 이하"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      fullWidth
                      onChange={handleChange}
                      value={value}
                      customStyle={{ whiteSpace: 'nowrap' }}
                      inputCustomStyle={{
                        width: '100%'
                      }}
                    />
                  </Flexbox>
                </Flexbox>
              );
            }

            if (codeType === productDynamicOptionCodeType.color) {
              return (
                <Flexbox
                  key={`products-middle-filter-${name}`}
                  alignment="center"
                  customStyle={{
                    position: 'relative',
                    minHeight: 44,
                    borderTop: `1px solid ${common.line02}`,
                    overflowY: 'hidden'
                  }}
                >
                  <Typography weight="medium" color="ui60" customStyle={{ minWidth: 72 }}>
                    {name}
                  </Typography>
                  <List
                    css={{
                      gap: 8
                    }}
                  >
                    {codeDetails.map((codeDetail) => {
                      const { id: codeDetailId, description } = codeDetail;
                      const needImage = filterImageColorNames.includes(description);
                      const getColorCode = filterColors[description as keyof typeof filterColors];
                      const colorChecked = middleFilterSelectedSearchOptions.some(
                        ({ codeId, id }) => codeId === filterCodeIds.color && id === codeDetailId
                      );

                      return (
                        <Box
                          key={`products-middle-filter-code-detail-${name}-${filterCodeIds.color}-${codeDetailId}`}
                          customStyle={{ position: 'relative', width: 28, height: 28 }}
                          onClick={handleClick({
                            codeType,
                            codeDetail
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
                            checked={colorChecked}
                            color={
                              needReverseCheckFilterColorNames.includes(description)
                                ? common.uiBlack
                                : common.uiWhite
                            }
                          />
                        </Box>
                      );
                    })}
                  </List>
                </Flexbox>
              );
            }

            if (codeType === productDynamicOptionCodeType.category) {
              return (
                <Flexbox
                  key={`products-middle-filter-${name}`}
                  alignment="center"
                  customStyle={{
                    position: 'relative',
                    minHeight: 44,
                    borderTop: `1px solid ${common.line02}`
                  }}
                >
                  <Typography weight="medium" color="ui60" customStyle={{ minWidth: 72 }}>
                    {name}
                  </Typography>
                  <List>
                    {codeDetails.map((codeDetail) => {
                      const {
                        subParentId: codeDetailSubParentId,
                        parentId: codeDetailParentId,
                        genderId
                      } = codeDetail as CategoryCode;
                      return (
                        <Chip
                          key={`products-middle-filter-code-detail-${name}-${codeDetailSubParentId}-${codeDetailParentId}`}
                          variant="ghost"
                          brandColor={
                            middleFilterSelectedSearchOptions.some(
                              ({ codeId, id, parentId, genderIds }) =>
                                codeId === filterCodeIds.category &&
                                id === codeDetailSubParentId &&
                                codeDetailParentId === parentId &&
                                (genderId ? genderIds?.includes(genderId) : true)
                            )
                              ? 'blue'
                              : 'black'
                          }
                          size="large"
                          onClick={handleClick({
                            codeType,
                            codeDetail
                          })}
                        >
                          {codeDetail.name}
                        </Chip>
                      );
                    })}
                  </List>
                </Flexbox>
              );
            }

            if (codeType === productDynamicOptionCodeType.size) {
              return (
                <Flexbox
                  key={`products-middle-filter-${name}`}
                  alignment="center"
                  customStyle={{
                    position: 'relative',
                    minHeight: 44,
                    borderTop: `1px solid ${common.line02}`
                  }}
                >
                  <Typography weight="medium" color="ui60" customStyle={{ minWidth: 72 }}>
                    {name}
                  </Typography>
                  <List>
                    {codeDetails.map((codeDetail) => {
                      const {
                        categorySizeId: codeDetailCategorySizeId,
                        parentCategoryId: codeDetailParentCategoryId
                      } = codeDetail as SizeCode;
                      const isActive = middleFilterSelectedSearchOptions.some(
                        ({ codeId, categorySizeId, parentCategoryId }) =>
                          codeId === filterCodeIds.size &&
                          categorySizeId === codeDetailCategorySizeId &&
                          parentCategoryId === codeDetailParentCategoryId
                      );

                      return (
                        <Button
                          key={`products-middle-filter-code-detail-${name}-${codeDetailCategorySizeId}`}
                          variant="inline"
                          brandColor={isActive ? 'blue' : 'gray'}
                          onClick={handleClick({
                            codeType,
                            codeDetail
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
                            fontWeight: isActive ? 700 : undefined
                          }}
                        >
                          {codeDetail.name}
                        </Button>
                      );
                    })}
                  </List>
                </Flexbox>
              );
            }

            return (
              <Flexbox
                key={`products-middle-filter-${name}`}
                alignment="center"
                customStyle={{
                  position: 'relative',
                  minHeight: 44,
                  borderTop: `1px solid ${common.line02}`
                }}
              >
                <Typography weight="medium" color="ui60" customStyle={{ minWidth: 72 }}>
                  {name}
                </Typography>
                <List>
                  {codeDetails.map((codeDetail) => {
                    const isActive = middleFilterSelectedSearchOptions.some(
                      ({ codeId, id }) =>
                        codeId === getCodeIdByCodeType(codeType) && id === codeDetail.id
                    );
                    return (
                      <Button
                        key={`products-middle-filter-code-detail-${name}-${codeDetail.id}`}
                        variant="inline"
                        brandColor={isActive ? 'blue' : 'gray'}
                        onClick={handleClick({
                          codeType,
                          codeDetail
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
                          fontWeight: isActive ? 700 : undefined
                        }}
                      >
                        {codeDetail.name}
                      </Button>
                    );
                  })}
                </List>
              </Flexbox>
            );
          })}
        <Button
          variant="solid"
          brandColor="black"
          size="large"
          fullWidth
          onClick={handleClickApply}
          disabled={!isFetched || (!middleFilterSelectedSearchOptions.length && !value)}
          customStyle={{
            marginTop: 20
          }}
        >
          필터 적용하기
        </Button>
      </Box>
    </Box>
  );
}

const List = styled.section`
  flex: 1;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 4px;
  overflow-x: auto;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    display: block;
    width: 32px;
    height: 100%;
    background: linear-gradient(270deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
    pointer-events: none;
  }
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

export default ProductsMiddleFilter;
