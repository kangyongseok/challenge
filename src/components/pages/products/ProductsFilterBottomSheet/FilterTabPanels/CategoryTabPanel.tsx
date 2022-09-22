import { useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Chip, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { filterGenders } from '@constants/productsFilter';
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

  const genders = useRecoilValue(categoryFilterOptionsSelector);
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [currentGenderId, setCurrentGenderId] = useState(0);
  const [step, setStep] = useState(0);

  const handleClickBack = () => {
    setCurrentGenderId(0);
    setStep(0);
  };

  const handleClickGenderSelectedAll = ({
    e,
    genderCodeId,
    id
  }: {
    e: MouseEvent<HTMLButtonElement>;
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

  const handleClickParentCategorySelectedAll = ({
    e,
    parentCategoryCodeId,
    id
  }: {
    e: MouseEvent<HTMLButtonElement>;
    parentCategoryCodeId: number;
    id: number;
  }) => {
    e.stopPropagation();

    const currentGender = genders.find((gender) => gender.id === currentGenderId);

    if (currentGender) {
      const selectedParentCategoryIndex = currentGender.parentCategories.findIndex(
        (parentCategory) => parentCategory.id === id
      );
      const selectedParentCategory = currentGender.parentCategories[selectedParentCategoryIndex];

      if (selectedParentCategory) {
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

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const dataCodeId = Number(e.currentTarget.getAttribute('data-code-id') || 0);
    const dataId = Number(e.currentTarget.getAttribute('data-id') || 0);
    const dataParentId = Number(e.currentTarget.getAttribute('data-parent-id') || 0);
    const dataGrouping = String(e.currentTarget.getAttribute('data-grouping') || '');
    const currentGender = genders.find((gender) => gender.id === currentGenderId);
    const selectedSearchOption = selectedSearchOptions.find(
      ({ codeId, parentId, id, genderIds = [] }) => {
        const [selectedGenderId] = genderIds.filter(
          (genderId) => genderId !== filterGenders.common.id
        );

        return (
          codeId === dataCodeId &&
          parentId === dataParentId &&
          id === dataId &&
          selectedGenderId === currentGenderId
        );
      }
    );

    if (selectedSearchOption && dataGrouping) {
      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: [
          ...selectedSearchOptions.filter(({ codeId, parentId, genderIds = [] }) => {
            const [selectedGenderId] = genderIds.filter(
              (genderId) => genderId !== filterGenders.common.id
            );

            if (codeId !== dataCodeId) return true;
            if (selectedGenderId !== currentGenderId) return true;
            return parentId !== dataParentId;
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
        (parentCategory) => parentCategory.id === dataParentId
      );

      if (selectedParentCategory) {
        const selectedSubParentCategoryIndex = selectedParentCategory.subParentCategories.findIndex(
          ({ id, parentId, genderIds = [] }) => {
            const [selectedGenderId] = genderIds.filter(
              (genderId) => genderId !== filterGenders.common.id
            );

            return (
              parentId === dataParentId && id === dataId && selectedGenderId === currentGenderId
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
      {step > 0 && (
        <Box
          customStyle={{
            padding: '16.5px 20px 0 20px'
          }}
        >
          <ClickBackButton onClick={handleClickBack}>
            <Icon name="ArrowLeftOutlined" size="small" />
            돌아가기
          </ClickBackButton>
        </Box>
      )}
      <Box customStyle={{ flex: 1, overflowY: 'auto' }}>
        {step === 0 &&
          genders.map(({ id: genderId, codeId: genderCodeId, name: genderName, checkedAll }) => (
            <FilterAccordion
              key={`gender-filter-option-${genderId}`}
              summary={genderName}
              expanded={false}
              expandIcon={<Icon name="CaretRightOutlined" size="small" />}
              changeInterceptor={() => {
                setCurrentGenderId(genderId);
                setStep(1);
              }}
              onClickButton={(e) => handleClickGenderSelectedAll({ e, genderCodeId, id: genderId })}
              customButton={
                checkedAll ? (
                  <Chip
                    variant="contained"
                    brandColor="primary"
                    size="xsmall"
                    onClick={(e) => handleClickGenderSelectedAll({ e, genderCodeId, id: genderId })}
                    customStyle={{ marginLeft: 12 }}
                  >
                    <Typography
                      variant="small2"
                      weight="medium"
                      customStyle={{ color: common.white }}
                    >
                      전체선택
                    </Typography>
                  </Chip>
                ) : (
                  <Chip
                    variant="outlined"
                    brandColor="grey"
                    size="xsmall"
                    onClick={(e) => handleClickGenderSelectedAll({ e, genderCodeId, id: genderId })}
                    customStyle={{ marginLeft: 12 }}
                  >
                    <Typography variant="small2" weight="medium">
                      전체선택
                    </Typography>
                  </Chip>
                )
              }
            />
          ))}
        {step === 1 &&
          genders
            .filter((gender) => gender.id === currentGenderId)
            .map(({ id: genderId, parentCategories }) =>
              parentCategories.map(
                ({
                  id: parentCategoryId,
                  codeId: parentCategoryCodeId,
                  name: parentCategoryName,
                  checkedAll,
                  subParentCategories
                }) => (
                  <FilterAccordion
                    key={`pc-filter-option-${genderId}-${parentCategoryId}`}
                    expanded={parentCategories.length === 1}
                    summary={parentCategoryName.replace(/\(P\)/g, '')}
                    customButton={
                      checkedAll ? (
                        <Chip
                          variant="contained"
                          brandColor="primary"
                          size="xsmall"
                          onClick={(e) =>
                            handleClickParentCategorySelectedAll({
                              e,
                              parentCategoryCodeId,
                              id: parentCategoryId
                            })
                          }
                          customStyle={{ marginLeft: 12 }}
                        >
                          <Typography
                            variant="small2"
                            weight="medium"
                            customStyle={{ color: common.white }}
                          >
                            전체선택
                          </Typography>
                        </Chip>
                      ) : (
                        <Chip
                          variant="outlined"
                          brandColor="grey"
                          size="xsmall"
                          onClick={(e) =>
                            handleClickParentCategorySelectedAll({
                              e,
                              parentCategoryCodeId,
                              id: parentCategoryId
                            })
                          }
                          customStyle={{ marginLeft: 12 }}
                        >
                          <Typography variant="small2" weight="medium">
                            전체선택
                          </Typography>
                        </Chip>
                      )
                    }
                    onClickButton={(e) =>
                      handleClickParentCategorySelectedAll({
                        e,
                        parentCategoryCodeId,
                        id: parentCategoryId
                      })
                    }
                  >
                    {subParentCategories
                      .filter(({ parentId }) => parentId === parentCategoryId)
                      .map(({ id, codeId, parentId, name, checked, count }) => (
                        <FilterOption
                          key={`spc-filter-option-${genderId}-${parentCategoryId}-${id}`}
                          data-code-id={codeId}
                          data-id={id}
                          data-parent-id={parentId}
                          data-grouping={checkedAll || ''}
                          checked={checkedAll ? false : checked}
                          count={count}
                          onClick={handleClick}
                        >
                          {name}
                        </FilterOption>
                      ))}
                  </FilterAccordion>
                )
              )
            )}
      </Box>
    </Flexbox>
  );
}

const ClickBackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 2px;

  ${({
    theme: {
      palette: { common },
      typography: {
        small2: { size, weight, lineHeight, letterSpacing }
      }
    }
  }): CSSObject => ({
    fontSize: size,
    fontWeight: weight.medium,
    lineHeight,
    letterSpacing,
    color: common.grey['40'],
    '& > svg': {
      color: common.grey['60']
    }
  })};
`;

export default CategoryTabPanel;
