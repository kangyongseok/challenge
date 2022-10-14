import { MouseEvent, useMemo } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Chip, Flexbox, Typography } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import {
  filterCodeIds,
  filterColorImagePositions,
  filterColorImagesInfo,
  filterColors
} from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { SelectedSearchOption } from '@typings/products';
import {
  detailFilterOptionsSelector,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

import FilterOption from '../FilterOption';
import FilterAccordion from '../FilterAccordion';

function DetailOptionTabPanel() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const { season, color, material } = useRecoilValue(detailFilterOptionsSelector);
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );

  const expanded = useMemo(() => {
    return (
      [
        season.filterOptions.length,
        material.filterOptions.length,
        color.filterOptions.length
      ].filter((length) => length).length === 1
    );
  }, [season.filterOptions.length, material.filterOptions.length, color.filterOptions.length]);

  const handleClickSelectedAll = (e: MouseEvent<HTMLButtonElement>, codeId: number) => {
    e.stopPropagation();

    if (codeId === filterCodeIds.season) {
      if (!season.checkedAll) {
        logEvent(attrKeys.products.selectFilter, {
          name: attrProperty.name.productList,
          title: attrProperty.title.season,
          index: 0,
          count: season.count,
          value: '연식, 전체'
        });
      }
      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: !season.checkedAll
          ? [
              ...selectedSearchOptions.filter(
                (selectedSearchOption) => selectedSearchOption.codeId !== codeId
              ),
              ...season.filterOptions
            ]
          : selectedSearchOptions.filter(
              (selectedSearchOption) => selectedSearchOption.codeId !== codeId
            )
      }));
    } else if (codeId === filterCodeIds.color) {
      if (!color.checkedAll) {
        logEvent(attrKeys.products.selectFilter, {
          name: attrProperty.name.productList,
          title: attrProperty.title.colorMaterial,
          index: 1,
          count: color.count,
          value: '색상, 전체'
        });
      }
      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: !color.checkedAll
          ? [
              ...selectedSearchOptions.filter(
                (selectedSearchOption) => selectedSearchOption.codeId !== codeId
              ),
              ...color.filterOptions
            ]
          : selectedSearchOptions.filter(
              (selectedSearchOption) => selectedSearchOption.codeId !== codeId
            )
      }));
    } else if (codeId === filterCodeIds.material) {
      if (!material.checkedAll) {
        logEvent(attrKeys.products.selectFilter, {
          name: attrProperty.name.productList,
          title: attrProperty.title.empty,
          index: 2,
          count: material.count,
          value: '소재, 전체'
        });
      }
      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: !material.checkedAll
          ? [
              ...selectedSearchOptions.filter(
                (selectedSearchOption) => selectedSearchOption.codeId !== codeId
              ),
              ...material.filterOptions
            ]
          : selectedSearchOptions.filter(
              (selectedSearchOption) => selectedSearchOption.codeId !== codeId
            )
      }));
    }
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const dataCodeId = Number(e.currentTarget.getAttribute('data-code-id') || 0);
    const dataId = Number(e.currentTarget.getAttribute('data-id') || 0);
    const dataGrouping = String(e.currentTarget.getAttribute('data-grouping') || '');

    const selectedSearchOption = selectedSearchOptions.find(
      ({ codeId, id }) => codeId === dataCodeId && id === dataId
    );

    if (selectedSearchOption && dataGrouping) {
      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: [
          ...selectedSearchOptions.filter(({ codeId }) => codeId !== dataCodeId),
          selectedSearchOption
        ]
      }));
      return;
    }

    if (selectedSearchOption) {
      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: selectedSearchOptions.filter(
          ({ codeId, id }) =>
            codeId !== selectedSearchOption.codeId || id !== selectedSearchOption.id
        )
      }));
    } else {
      let selectedFilterOptionIndex;
      let selectedFilterOption: SelectedSearchOption | undefined;
      let title;

      if (dataCodeId === filterCodeIds.season) {
        title = 'SEASON';
        selectedFilterOptionIndex = season.filterOptions.findIndex(({ id }) => id === dataId);
        selectedFilterOption = season.filterOptions[selectedFilterOptionIndex];
      }
      if (dataCodeId === filterCodeIds.color) {
        title = 'COLOR+MATERIAL';
        selectedFilterOptionIndex = color.filterOptions.findIndex(({ id }) => id === dataId);
        selectedFilterOption = color.filterOptions[selectedFilterOptionIndex];
      }
      if (dataCodeId === filterCodeIds.material) {
        title = 'EMPTY';
        selectedFilterOptionIndex = material.filterOptions.findIndex(({ id }) => id === dataId);
        selectedFilterOption = material.filterOptions[selectedFilterOptionIndex];
      }

      let newSelectedSearchOptions = selectedSearchOptions;

      if (selectedFilterOption) {
        logEvent(attrKeys.products.selectFilter, {
          name: attrProperty.name.productList,
          title,
          index: selectedFilterOptionIndex,
          count: selectedFilterOption.count,
          value: selectedFilterOption.name
        });
        newSelectedSearchOptions = selectedSearchOptions.concat(selectedFilterOption);
      }

      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: newSelectedSearchOptions
      }));
    }
  };

  return (
    <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
      <Box customStyle={{ flex: 1, overflowY: 'auto' }}>
        {season.filterOptions.length > 0 && (
          <FilterAccordion
            summary="연식"
            expanded={expanded}
            customButton={
              season.checkedAll ? (
                <Chip
                  variant="contained"
                  brandColor="primary"
                  size="xsmall"
                  onClick={(e) => handleClickSelectedAll(e, filterCodeIds.season)}
                  customStyle={{ marginLeft: 12 }}
                >
                  전체선택
                </Chip>
              ) : (
                <Chip
                  variant="outlined"
                  brandColor="gray"
                  size="xsmall"
                  onClick={(e) => handleClickSelectedAll(e, filterCodeIds.season)}
                  customStyle={{ marginLeft: 12 }}
                >
                  <Typography variant="small2" weight="medium">
                    전체선택
                  </Typography>
                </Chip>
              )
            }
            onClickButton={(e) => handleClickSelectedAll(e, filterCodeIds.season)}
          >
            {season.filterOptions.map(({ id, codeId, checked, count, name }) => (
              <FilterOption
                key={`season-filter-option-${id}`}
                data-code-id={codeId}
                data-id={id}
                data-grouping={season.checkedAll || ''}
                checked={season.checkedAll ? false : checked}
                count={count}
                onClick={handleClick}
              >
                {name}
              </FilterOption>
            ))}
          </FilterAccordion>
        )}
        {color.filterOptions.length > 0 && (
          <FilterAccordion
            summary="색상"
            expanded={expanded}
            customButton={
              color.checkedAll ? (
                <Chip
                  variant="contained"
                  brandColor="primary"
                  size="xsmall"
                  onClick={(e) => handleClickSelectedAll(e, filterCodeIds.color)}
                  customStyle={{ marginLeft: 12 }}
                >
                  전체선택
                </Chip>
              ) : (
                <Chip
                  variant="outlined"
                  brandColor="gray"
                  size="xsmall"
                  onClick={(e) => handleClickSelectedAll(e, filterCodeIds.color)}
                  customStyle={{ marginLeft: 12 }}
                >
                  전체선택
                </Chip>
              )
            }
            onClickButton={(e) => handleClickSelectedAll(e, filterCodeIds.color)}
          >
            {color.filterOptions.map(({ id, codeId, checked, count, name, description }) => (
              <FilterOption
                key={`color-filter-option-${id}`}
                colorCode={filterColors[description as keyof typeof filterColors]}
                colorImageInfo={
                  filterColorImagesInfo[description as keyof typeof filterColorImagePositions]
                }
                data-code-id={codeId}
                data-id={id}
                data-grouping={color.checkedAll || ''}
                checked={color.checkedAll ? false : checked}
                count={count}
                onClick={handleClick}
              >
                {name}
              </FilterOption>
            ))}
          </FilterAccordion>
        )}
        {material.filterOptions.length > 0 && (
          <FilterAccordion
            summary="소재"
            expanded={expanded}
            customButton={
              material.checkedAll ? (
                <Chip
                  variant="contained"
                  brandColor="primary"
                  size="xsmall"
                  onClick={(e) => handleClickSelectedAll(e, filterCodeIds.material)}
                  customStyle={{ marginLeft: 12 }}
                >
                  전체선택
                </Chip>
              ) : (
                <Chip
                  variant="outlined"
                  brandColor="gray"
                  size="xsmall"
                  onClick={(e) => handleClickSelectedAll(e, filterCodeIds.material)}
                  customStyle={{ marginLeft: 12 }}
                >
                  전체선택
                </Chip>
              )
            }
            onClickButton={(e) => handleClickSelectedAll(e, filterCodeIds.material)}
          >
            {material.filterOptions.map(({ id, codeId, checked, count, name }) => (
              <FilterOption
                key={`material-filter-option-${id}`}
                data-code-id={codeId}
                data-id={id}
                data-grouping={material.checkedAll || ''}
                checked={material.checkedAll ? false : checked}
                count={count}
                onClick={handleClick}
              >
                {name}
              </FilterOption>
            ))}
          </FilterAccordion>
        )}
      </Box>
    </Flexbox>
  );
}

export default DetailOptionTabPanel;
