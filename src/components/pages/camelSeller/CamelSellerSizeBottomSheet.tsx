import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { BottomSheet, Box, Button, Chip, Flexbox, Input, Typography } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchCategorySizes } from '@api/category';

import queryKeys from '@constants/queryKeys';
import { OPTIONAL_FIT_SIZES, OPTIONAL_SIZES } from '@constants/camelSeller';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { camelSellerDialogStateFamily, camelSellerTempSaveDataState } from '@recoil/camelSeller';

function CamelSellerSizeBottomSheet() {
  const [{ open }, setOpen] = useRecoilState(camelSellerDialogStateFamily('size'));
  const [
    {
      category: { id, parentId, parentCategoryName, name: categoryName },
      brand: { id: brandId },
      sizes,
      categorySizeIds,
      sizeOptionIds
    },
    setTempData
  ] = useRecoilState(camelSellerTempSaveDataState);

  const [sizeGroup, setSizeGroup] = useState<{
    [key: string]: {
      id: number;
      name: string;
      groupId: number;
      viewSize: string;
      selected: boolean;
    }[];
  }>({});
  const [otherSizeGroups, setOtherSizeGroups] = useState<
    {
      [key: string]: {
        id: number;
        name: string;
        groupId: number;
        viewSize: string;
        selected: boolean;
      }[];
    }[]
  >([]);
  const [optionalSizes, setOptionalSizes] = useState(OPTIONAL_SIZES);
  const [optionalFitSizes, setOptionalFitSizes] = useState(OPTIONAL_FIT_SIZES);
  const [openOtherSizeGroups, setOpenOtherSizeGroups] = useState(false);
  const [openOptionalSizes, setOpenOptionalSizes] = useState(false);
  const [openOptionalFitSizes, setOpenOptionalFitSizes] = useState(false);
  const [openSizeDirectInputButton, setOpenSizeDirectInputButton] = useState(false);
  const [openSizeDirectInput, setOpenSizeDirectInput] = useState(false);
  const [hasSelectedSize, setHasSelectedSize] = useState(false);
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [value, setValue] = useState('');

  const { data = [], isLoading } = useQuery(
    queryKeys.categories.categorySizes({ categoryId: id, brandId }),
    () => fetchCategorySizes({ categoryId: id, brandId }),
    {
      enabled: open && !!id && !!brandId
    }
  );

  const handleClick = (categorySizeId: number, name: string, viewSize: string) => () => {
    logEvent(attrKeys.camelSeller.SELECT_ITEM, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.RECOMM_SIZE,
      att: name
    });

    setSizeGroup((prevState) => {
      const sizeGroupName = Object.keys(prevState)[0];

      return {
        [sizeGroupName]: prevState[sizeGroupName].map((prevSize) => ({
          ...prevSize,
          selected:
            categorySizeId === prevSize.id && viewSize === prevSize.viewSize && !prevSize.selected
        }))
      };
    });

    if (viewSize === 'ONE SIZE') {
      setOtherSizeGroups((prevState) =>
        prevState.map((otherSizeGroup, index) => {
          const otherSizeGroupName = Object.keys(otherSizeGroup)[0];

          return {
            [otherSizeGroupName]: prevState[index][otherSizeGroupName].map((prevSize) => ({
              ...prevSize,
              selected: false
            }))
          };
        })
      );
    }
  };

  const handleClickOtherSize = (categorySizeId: number, name: string, viewSize: string) => () => {
    logEvent(attrKeys.camelSeller.SELECT_ITEM, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.MORE_SIZE,
      att: name
    });

    setSizeGroup((prevState) => {
      const sizeGroupName = Object.keys(prevState)[0];

      return {
        [sizeGroupName]: prevState[sizeGroupName].map((prevSize) => ({
          ...prevSize,
          selected: prevSize.viewSize !== 'ONE SIZE' && prevSize.selected
        }))
      };
    });
    setOtherSizeGroups((prevState) =>
      prevState.map((otherSizeGroup, index) => {
        const otherSizeGroupName = Object.keys(otherSizeGroup)[0];
        return {
          [otherSizeGroupName]: prevState[index][otherSizeGroupName].map((prevSize) => {
            let selected =
              viewSize === prevSize.viewSize ? categorySizeId === prevSize.id : prevSize.selected;

            if (selected && categorySizeId === prevSize.id) {
              selected = !prevSize.selected;
            }

            return {
              ...prevSize,
              selected
            };
          })
        };
      })
    );
  };

  const handleClickOptionalSize = (sizeId: number, name: string) => () => {
    logEvent(attrKeys.camelSeller.SELECT_ITEM, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.SIZE_FEEL,
      att: name
    });

    setOptionalSizes((prevState) =>
      prevState.map((prevSize) => ({
        ...prevSize,
        selected: sizeId === prevSize.id && !prevSize.selected
      }))
    );
  };

  const handleClickOptionalFitSize = (sizeId: number, name: string) => () => {
    logEvent(attrKeys.camelSeller.SELECT_ITEM, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.SIZE_FIT,
      att: name
    });

    setOptionalFitSizes((prevState) =>
      prevState.map((prevSize) => ({
        ...prevSize,
        selected: sizeId === prevSize.id && !prevSize.selected
      }))
    );
  };

  const handleClickDirectInput = () => {
    setOpenSizeDirectInput((prevState) => !prevState);
    setSizeGroup((prevState) => {
      const sizeGroupName = Object.keys(prevState)[0];

      return {
        [sizeGroupName]: prevState[sizeGroupName].map((prevSize) => ({
          ...prevSize,
          selected: false
        }))
      };
    });
  };

  const handleClickComplete = () => {
    const [selectedSize] = sizeGroup[Object.keys(sizeGroup)[0]].filter(({ selected }) => selected);
    const otherSizeIds = Array.from(
      new Set(
        otherSizeGroups
          .map((otherSizeGroup) =>
            Object.keys(otherSizeGroup)
              .map((otherSizeGroupName) =>
                otherSizeGroup[otherSizeGroupName]
                  .filter(({ selected }) => selected)
                  .map(({ id: categorySizeId }) => categorySizeId)
              )
              .flat()
          )
          .flat()
      )
    );
    const optionalSizeIds = [
      ...optionalSizes
        .filter(({ selected }) => selected)
        .map(({ id: categorySizeId }) => categorySizeId),
      ...optionalFitSizes
        .filter(({ selected }) => selected)
        .map(({ id: categorySizeId }) => categorySizeId)
    ];

    setTempData((prevState) => ({
      ...prevState,
      size: { id: selectedSize?.id, name: selectedSize?.name },
      sizes: '',
      categorySizeIds:
        selectedSize?.id || selectedSize?.id === 0
          ? [selectedSize?.id, ...otherSizeIds]
          : [...otherSizeIds],
      sizeOptionIds: optionalSizeIds
    }));

    if (openSizeDirectInputButton && openSizeDirectInput && value) {
      setTempData((prevState) => ({
        ...prevState,
        size: { id: 0, name: value },
        sizes: value,
        categorySizeIds: [],
        sizeOptionIds: []
      }));
    }

    setOpen(({ type }) => ({ type, open: false }));
  };

  useEffect(() => {
    if (!data || !data.length) return;

    const primarySize = data[0];

    setSizeGroup({
      [parentCategoryName || categoryName]: [
        {
          id: 0,
          name: 'ONE SIZE',
          groupId: primarySize.groupId,
          viewSize: 'ONE SIZE',
          selected: categorySizeIds?.includes(0)
        },
        ...data
          .filter(({ viewSize }) => viewSize === primarySize.viewSize)
          .map(({ categorySizeId, name, groupId, viewSize }) => ({
            id: categorySizeId,
            name,
            groupId,
            viewSize,
            selected: categorySizeIds?.includes(categorySizeId)
          }))
      ].filter(({ id: categorySizeId }) => {
        if (!categorySizeId) return true;
        return !isOtherCategory;
      })
    });
  }, [data, parentCategoryName, categoryName, isOtherCategory, categorySizeIds]);

  useEffect(() => {
    if (isOtherCategory || !data || !data.length) return;

    const otherSizeGroupViewSizes = Array.from(
      new Set(
        data.filter(({ viewSize }) => viewSize !== data[0].viewSize).map(({ viewSize }) => viewSize)
      )
    );

    setOtherSizeGroups(
      otherSizeGroupViewSizes.map((otherSizeGroupViewSize) => ({
        [otherSizeGroupViewSize]: data
          .filter(({ viewSize }) => viewSize === otherSizeGroupViewSize)
          .map(({ categorySizeId, name, groupId, viewSize }) => ({
            id: categorySizeId,
            name,
            groupId,
            viewSize,
            selected: categorySizeIds?.includes(categorySizeId)
          }))
      }))
    );
  }, [data, isOtherCategory, categorySizeIds]);

  useEffect(() => {
    setOptionalSizes((prevState) =>
      prevState.map((optionalSize) => ({
        ...optionalSize,
        selected: sizeOptionIds.includes(optionalSize.id)
      }))
    );
    setOptionalFitSizes((prevState) =>
      prevState.map((optionalFitSize) => ({
        ...optionalFitSize,
        selected: sizeOptionIds.includes(optionalFitSize.id)
      }))
    );
  }, [sizeOptionIds]);

  useEffect(() => {
    if (!isLoading && (!data || !data.length) && !Object.keys(sizeGroup).length && categoryName) {
      setSizeGroup({
        [categoryName]: [
          {
            id: 0,
            name: 'ONE SIZE',
            groupId: 0,
            viewSize: 'ONE SIZE',
            selected: categorySizeIds?.includes(0)
          }
        ]
      });
    }
  }, [isLoading, categoryName, categorySizeIds, data, sizeGroup]);

  useEffect(() => {
    if (parentId) {
      // 상의, 하의, 신발
      // TODO 일단 추가옵션선택이 제대로 노출이 안되서 무지성으로 추가했습니다
      // case 구찌 스니커즈, 카테고리 상의, 카테고리 신발
      setOpenOptionalSizes([97, 104, 14, 486, 487, 488].includes(parentId));
      // 상의, 하의
      setOpenOptionalFitSizes([97, 104, 486, 487].includes(parentId));
    } else if (id) {
      setOpenOptionalSizes([486, 487, 488].includes(id));
      setOpenOptionalFitSizes([486, 487].includes(id));
    }
  }, [isLoading, parentId, id, open]);

  useEffect(() => {
    if (openSizeDirectInputButton) {
      setOpenOptionalSizes(false);
      setOpenOptionalFitSizes(false);
    }
  }, [openSizeDirectInputButton, open]);

  useEffect(() => {
    if (open && !openOtherSizeGroups && otherSizeGroups.length === 1) {
      setOpenOtherSizeGroups(true);
    }
  }, [open, openOtherSizeGroups, otherSizeGroups]);

  useEffect(() => {
    const sizeGroupName = Object.keys(sizeGroup)[0];

    if (!sizeGroupName) return;

    const newHasSelectedSize =
      sizeGroup[sizeGroupName].filter(({ selected }) => selected).length > 0 ||
      otherSizeGroups
        .map((otherSizeGroup) => {
          const otherSizeGroupName = Object.keys(otherSizeGroup)[0];

          return otherSizeGroup[otherSizeGroupName].map(({ selected }) => selected);
        })
        .flat()
        .some((selected) => selected);

    setHasSelectedSize(newHasSelectedSize);

    if (newHasSelectedSize) setValue('');
  }, [sizeGroup, otherSizeGroups]);

  useEffect(() => {
    if (!open) {
      setOpenOtherSizeGroups(false);
      setOpenOptionalSizes(false);
      setOpenOptionalFitSizes(false);
    }
  }, [open]);

  useEffect(() => setIsOtherCategory(id === 489), [id]);

  useEffect(() => {
    if (hasSelectedSize) setOpenSizeDirectInput(false);
  }, [hasSelectedSize]);

  useEffect(() => {
    // 기타 카테고리가 선택된 상태이거나 사이즈 데이터가 없는 경우 직접입력 활성화
    setOpenSizeDirectInputButton(isOtherCategory || (!isLoading && (!data || data.length === 0)));
  }, [data, isLoading, isOtherCategory]);

  useEffect(() => {
    if (sizes) {
      setValue(sizes);
      setOpenSizeDirectInput(true);
    }
  }, [sizes]);

  return (
    <BottomSheet
      fullScreen
      open={open}
      onClose={() => setOpen(({ type }) => ({ type, open: false }))}
      disableSwipeable
    >
      <Flexbox
        direction="vertical"
        customStyle={{
          height: '100%'
        }}
      >
        <Typography
          weight="bold"
          variant="h2"
          customStyle={{
            margin: '32px 20px'
          }}
        >
          사이즈를 선택해주세요.
        </Typography>
        <Box
          customStyle={{
            flex: 1,
            padding: '0 20px',
            overflowY: 'auto'
          }}
        >
          <Flexbox direction="vertical" gap={32}>
            {Object.keys(sizeGroup).map((sizeGroupName) => (
              <Flexbox key={`camel-seller-size-${sizeGroupName}`} direction="vertical" gap={8}>
                <Typography weight="medium">{sizeGroupName} 사이즈</Typography>
                <Flexbox gap={8} customStyle={{ flexWrap: 'wrap' }}>
                  {sizeGroup[sizeGroupName].map(
                    ({ id: categorySizeId, name, viewSize, selected }) => (
                      <Chip
                        key={`camel-seller-size-${viewSize}-${categorySizeId}-${name}`}
                        variant={selected ? 'solid' : 'ghost'}
                        brandColor="black"
                        size="xlarge"
                        isRound={false}
                        onClick={handleClick(categorySizeId, name, viewSize)}
                      >
                        {name}
                      </Chip>
                    )
                  )}
                  {otherSizeGroups.length >= 2 && !openOtherSizeGroups && (
                    <Chip
                      variant="outline"
                      brandColor="gray"
                      size="xlarge"
                      isRound={false}
                      onClick={() => setOpenOtherSizeGroups(true)}
                    >
                      더보기
                    </Chip>
                  )}
                  {openSizeDirectInputButton && (
                    <Chip
                      variant={openSizeDirectInput ? 'solid' : 'ghost'}
                      brandColor="black"
                      size="xlarge"
                      isRound={false}
                      onClick={handleClickDirectInput}
                    >
                      직접입력
                    </Chip>
                  )}
                </Flexbox>
              </Flexbox>
            ))}
            {openOtherSizeGroups &&
              otherSizeGroups.map((otherSizeGroup) =>
                Object.keys(otherSizeGroup).map((otherSizeGroupName) => (
                  <Flexbox
                    key={`camel-seller-other-size-${otherSizeGroupName}`}
                    direction="vertical"
                    gap={8}
                  >
                    <Typography weight="medium">{otherSizeGroupName}</Typography>
                    <Flexbox gap={8} customStyle={{ flexWrap: 'wrap' }}>
                      {otherSizeGroup[otherSizeGroupName].map(
                        ({ id: categorySizeId, name, viewSize, selected }) => (
                          <Chip
                            key={`camel-seller-other-size-${viewSize}-${categorySizeId}-${name}`}
                            variant={selected ? 'solid' : 'ghost'}
                            brandColor="black"
                            size="xlarge"
                            isRound={false}
                            onClick={handleClickOtherSize(categorySizeId, name, viewSize)}
                          >
                            {name}
                          </Chip>
                        )
                      )}
                    </Flexbox>
                  </Flexbox>
                ))
              )}
            {openSizeDirectInput && (
              <Flexbox
                direction="vertical"
                gap={8}
                customStyle={{
                  marginTop: 12
                }}
              >
                <Typography>사이즈 입력</Typography>
                <Input
                  size="xlarge"
                  fullWidth
                  onChange={(e) => setValue(e.currentTarget.value)}
                  value={value}
                  placeholder="사이즈 입력"
                />
              </Flexbox>
            )}
            {openOptionalSizes && (
              <Flexbox direction="vertical" gap={8}>
                <Typography weight="medium">사이즈는 어떻게 나왔나요? (선택)</Typography>
                <List>
                  {optionalSizes.map(({ id: sizeId, name, selected }) => (
                    <Chip
                      key={`camel-seller-optional-size-${sizeId}`}
                      variant={selected ? 'solid' : 'ghost'}
                      brandColor="black"
                      size="xlarge"
                      isRound={false}
                      onClick={handleClickOptionalSize(sizeId, name)}
                    >
                      {name}
                    </Chip>
                  ))}
                </List>
              </Flexbox>
            )}
            {openOptionalFitSizes && (
              <Flexbox direction="vertical" gap={8}>
                <Typography weight="medium">핏을 알려주세요 (선택)</Typography>
                <List>
                  {optionalFitSizes.map(({ id: sizeId, name, selected }) => (
                    <Chip
                      key={`camel-seller-optional-fit-size-${sizeId}`}
                      variant={selected ? 'solid' : 'ghost'}
                      brandColor="black"
                      size="xlarge"
                      isRound={false}
                      onClick={handleClickOptionalFitSize(sizeId, name)}
                    >
                      {name}
                    </Chip>
                  ))}
                </List>
              </Flexbox>
            )}
          </Flexbox>
        </Box>
        <Box
          customStyle={{
            padding: 20
          }}
        >
          <Button
            fullWidth
            variant="solid"
            size="xlarge"
            brandColor="blue"
            onClick={handleClickComplete}
            disabled={openSizeDirectInput ? !value : !hasSelectedSize}
          >
            완료
          </Button>
        </Box>
      </Flexbox>
    </BottomSheet>
  );
}

const List = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 8px;
  margin: 0 -20px;
  padding: 0 20px;
  overflow-x: auto;
`;

export default CamelSellerSizeBottomSheet;
