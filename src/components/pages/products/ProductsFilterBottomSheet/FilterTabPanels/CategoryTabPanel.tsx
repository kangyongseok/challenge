import { useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Grid, Icon, useTheme } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import { filterCodeIds, filterGenders } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  categoryFilterOptionsSelector,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

import FilterOption from '../FilterOption';
import FilterAccordion from '../FilterAccordion';

function CategoryTabPanel() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const genders = useRecoilValue(categoryFilterOptionsSelector);
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );

  const [currentGenderId, setCurrentGenderId] = useState(0);
  const [step, setStep] = useState(0);

  const handleClickBack = (e: MouseEvent<HTMLDivElement>) => {
    const currentGender = genders.find((gender) => gender.id === currentGenderId);

    if (currentGender && currentGender.checkedAll) {
      handleClickGenderSelectedAll({
        e,
        genderCodeId: filterCodeIds.category,
        id: currentGenderId
      });
    }

    setCurrentGenderId(0);
    setStep(0);
  };

  const handleClickCategory =
    (genderCodeId: number, genderId: number) => (e: MouseEvent<HTMLDivElement>) => {
      setCurrentGenderId(genderId);
      setStep(1);

      const hasSelectedSearchOptions = selectedSearchOptions.some(
        ({ codeId, genderIds = [] }) =>
          codeId === filterCodeIds.category && genderIds.includes(genderId)
      );

      if (!hasSelectedSearchOptions)
        handleClickGenderSelectedAll({ e, genderCodeId, id: genderId });
    };

  const handleClickGenderSelectedAll = ({
    e,
    genderCodeId,
    id
  }: {
    e: MouseEvent<HTMLDivElement>;
    genderCodeId: number;
    id: number;
  }) => {
    e.stopPropagation();

    const currentGenderIndex = genders.findIndex((gender) => gender.id === id);
    const currentGender = genders[currentGenderIndex];

    if (currentGender) {
      if (!currentGender.checkedAll) {
        logEvent(attrKeys.products.selectFilter, {
          name: attrProperty.name.productList,
          title: attrProperty.title.category,
          index: currentGenderIndex,
          count: currentGender.count,
          value: currentGender.name
        });
      }
      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: !currentGender.checkedAll
          ? [
              ...selectedSearchOptions.filter(({ codeId, genderIds = [] }) => {
                const [selectedGenderId] = genderIds.filter(
                  (genderId) => genderId !== filterGenders.common.id
                );

                return codeId !== genderCodeId || currentGender.id !== selectedGenderId;
              }),
              ...currentGender.parentCategories
                .map((parentCategory) => parentCategory.subParentCategories)
                .flat()
            ]
          : selectedSearchOptions.filter(({ codeId, genderIds = [] }) => {
              const [selectedGenderId] = genderIds.filter(
                (genderId) => genderId !== filterGenders.common.id
              );

              return codeId !== genderCodeId || currentGender.id !== selectedGenderId;
            })
      }));
    }
  };

  const handleClickParentCategorySelectedAll =
    (parentCategoryCodeId: number, id: number) => (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      const currentGender = genders.find((gender) => gender.id === currentGenderId);

      if (currentGender) {
        const selectedParentCategoryIndex = currentGender.parentCategories.findIndex(
          (parentCategory) => parentCategory.id === id
        );
        const selectedParentCategory = currentGender.parentCategories[selectedParentCategoryIndex];

        if (selectedParentCategory) {
          if (currentGender.checkedAll) {
            setSelectedSearchOptionsState(({ type }) => ({
              type,
              selectedSearchOptions: [
                ...selectedSearchOptions.filter(({ codeId, genderIds = [] }) => {
                  const [selectedGenderId] = genderIds.filter(
                    (genderId) => genderId !== filterGenders.common.id
                  );

                  return codeId !== parentCategoryCodeId || currentGenderId !== selectedGenderId;
                }),
                ...selectedParentCategory.subParentCategories
              ]
            }));
            return;
          }

          if (!selectedParentCategory.checkedAll) {
            logEvent(attrKeys.products.selectFilter, {
              name: attrProperty.name.productList,
              title: attrProperty.title.category,
              index: selectedParentCategoryIndex,
              count: selectedParentCategory.count,
              value: `${currentGender.name}, ${selectedParentCategory.name}`
            });
          }

          setSelectedSearchOptionsState(({ type }) => ({
            type,
            selectedSearchOptions: !selectedParentCategory.checkedAll
              ? [
                  ...selectedSearchOptions.filter(({ codeId, parentId, genderIds = [] }) => {
                    const [selectedGenderId] = genderIds.filter(
                      (genderId) => genderId !== filterGenders.common.id
                    );

                    return (
                      codeId !== parentCategoryCodeId ||
                      parentId !== id ||
                      currentGenderId !== selectedGenderId
                    );
                  }),
                  ...selectedParentCategory.subParentCategories
                ]
              : selectedSearchOptions.filter(({ codeId, parentId, genderIds = [] }) => {
                  const [selectedGenderId] = genderIds.filter(
                    (genderId) => genderId !== filterGenders.common.id
                  );

                  return (
                    codeId !== parentCategoryCodeId ||
                    parentId !== id ||
                    currentGenderId !== selectedGenderId
                  );
                })
          }));
        }
      }
    };

  const handleClick =
    ({
      newCodeId,
      newId,
      newParentId,
      newGrouping
    }: {
      newCodeId: number;
      newId: number;
      newParentId: number;
      newGrouping: boolean;
    }) =>
    () => {
      const currentGender = genders.find((gender) => gender.id === currentGenderId);
      const selectedSearchOption = selectedSearchOptions.find(
        ({ codeId, parentId, id, genderIds = [] }) => {
          const [selectedGenderId] = genderIds.filter(
            (genderId) => genderId !== filterGenders.common.id
          );

          return (
            codeId === newCodeId &&
            parentId === newParentId &&
            id === newId &&
            selectedGenderId === currentGenderId
          );
        }
      );

      if (selectedSearchOption && newGrouping) {
        setSelectedSearchOptionsState(({ type }) => ({
          type,
          selectedSearchOptions: [
            ...selectedSearchOptions.filter(({ codeId, parentId, genderIds = [] }) => {
              const [selectedGenderId] = genderIds.filter(
                (genderId) => genderId !== filterGenders.common.id
              );

              if (codeId !== newCodeId) return true;
              if (selectedGenderId !== currentGenderId) return true;
              return parentId !== newParentId;
            }),
            selectedSearchOption
          ]
        }));
        return;
      }

      if (selectedSearchOption) {
        setSelectedSearchOptionsState(({ type }) => ({
          type,
          selectedSearchOptions: selectedSearchOptions.filter(
            ({ codeId, id, parentId, genderIds = [] }) => {
              const [selectedGenderId] = genderIds.filter(
                (genderId) => genderId !== filterGenders.common.id
              );

              if (codeId !== selectedSearchOption.codeId) return true;
              if (selectedGenderId !== currentGenderId) return true;
              if (parentId !== selectedSearchOption.parentId) return true;

              return id !== selectedSearchOption.id;
            }
          )
        }));
      } else if (currentGender) {
        const selectedParentCategory = currentGender.parentCategories.find(
          (parentCategory) => parentCategory.id === newParentId
        );

        if (selectedParentCategory) {
          const selectedSubParentCategoryIndex =
            selectedParentCategory.subParentCategories.findIndex(
              ({ id, parentId, genderIds = [] }) => {
                const [selectedGenderId] = genderIds.filter(
                  (genderId) => genderId !== filterGenders.common.id
                );

                return (
                  parentId === newParentId && id === newId && selectedGenderId === currentGenderId
                );
              }
            );
          const selectedSubParentCategory =
            selectedParentCategory.subParentCategories[selectedSubParentCategoryIndex];

          if (selectedSubParentCategory) {
            logEvent(attrKeys.products.selectFilter, {
              name: attrProperty.name.productList,
              title: attrProperty.title.category,
              index: selectedSubParentCategoryIndex,
              count: selectedSubParentCategory.count,
              value: `${currentGender.name}, ${selectedSubParentCategory.name}`
            });

            setSelectedSearchOptionsState(({ type }) => ({
              type,
              selectedSearchOptions: [...selectedSearchOptions, selectedSubParentCategory]
            }));
          }
        }
      }
    };

  return (
    <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
      <Box customStyle={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
        {step === 0 &&
          genders.map(({ id: genderId, codeId: genderCodeId, name: genderName }) => (
            <FilterAccordion
              key={`gender-filter-option-${genderId}`}
              title={`${genderName} 카테고리`}
              subText={56}
              expandIcon={
                <Icon name="Arrow2RightOutlined" width={20} height={20} color={common.ui80} />
              }
              onClick={handleClickCategory(genderCodeId, genderId)}
            />
          ))}
        {step === 1 && (
          <>
            <Box
              onClick={handleClickBack}
              customStyle={{
                margin: '0 -20px',
                padding: '0 20px 8px',
                backgroundColor: common.bg02
              }}
            >
              {genders
                .filter(({ id }) => id === currentGenderId)
                .map(({ id, name, parentCategories }) => (
                  <FilterAccordion
                    key={`gender-filter-option-in-${id}`}
                    title={`${name} 카테고리`}
                    isActive={parentCategories.some(
                      ({ subParentCategories }) =>
                        subParentCategories.filter(({ checked }) => checked).length >= 1
                    )}
                    startIcon={<Icon name="Arrow2LeftOutlined" width={20} height={20} />}
                    expandIcon={
                      parentCategories.some(
                        ({ subParentCategories }) =>
                          subParentCategories.filter(({ checked }) => checked).length >= 1
                      ) ? (
                        <Icon name="CheckOutlined" width={20} height={20} />
                      ) : undefined
                    }
                    hideLine
                  />
                ))}
            </Box>
            {genders
              .filter((gender) => gender.id === currentGenderId)
              .map(({ id: genderId, parentCategories, checkedAll: genderCheckedAll }) =>
                parentCategories
                  .filter(({ subParentCategories = [] }) => subParentCategories.length)
                  .map(
                    ({
                      id: parentCategoryId,
                      codeId: parentCategoryCodeId,
                      name: parentCategoryName,
                      checkedAll,
                      subParentCategories
                    }) => (
                      <FilterAccordion
                        key={`pc-filter-option-${genderId}-${parentCategoryId}`}
                        title={parentCategoryName.replace(/\(P\)/g, '')}
                        subText={subParentCategories
                          .map(({ count }) => count)
                          .reduce((a, b) => a + b, 0)
                          .toLocaleString()}
                        expand={parentCategories.length === 1}
                        expandIcon={
                          !genderCheckedAll &&
                          subParentCategories.filter(({ checked }) => checked).length >= 1 ? (
                            <Icon name="CheckOutlined" color="primary" />
                          ) : undefined
                        }
                        isActive={
                          !genderCheckedAll &&
                          subParentCategories.filter(({ checked }) => checked).length >= 1
                        }
                        checkedAll={checkedAll}
                        onClick={handleClickParentCategorySelectedAll(
                          parentCategoryCodeId,
                          parentCategoryId
                        )}
                      >
                        <Grid
                          container
                          customStyle={{
                            padding: '0 12px'
                          }}
                        >
                          {subParentCategories
                            .filter(({ parentId }) => parentId === parentCategoryId)
                            .map(({ id, codeId, parentId, name, checked, count }) => (
                              <Grid
                                key={`spc-filter-option-${genderId}-${parentCategoryId}-${id}`}
                                item
                                xs={2}
                              >
                                <FilterOption
                                  checked={checkedAll ? false : checked}
                                  count={count}
                                  onClick={handleClick({
                                    newCodeId: codeId,
                                    newParentId: parentId,
                                    newId: id,
                                    newGrouping: checkedAll
                                  })}
                                >
                                  {name}
                                </FilterOption>
                              </Grid>
                            ))}
                        </Grid>
                      </FilterAccordion>
                    )
                  )
              )}
          </>
        )}
      </Box>
    </Flexbox>
  );
}

export default CategoryTabPanel;
