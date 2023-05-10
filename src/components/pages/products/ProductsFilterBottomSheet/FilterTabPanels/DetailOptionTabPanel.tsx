import { useMemo } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Grid, Icon } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import { filterCodeIds } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { SelectedSearchOption } from '@typings/products';
import {
  detailFilterOptionsSelector,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

import FilterOption from '../FilterOption';
import FilterAccordion from '../FilterAccordion';

function DetailOptionTabPanel() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const { season, material } = useRecoilValue(detailFilterOptionsSelector);
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );

  const expand = useMemo(() => {
    return (
      [season.filterOptions.length, material.filterOptions.length].filter((length) => length)
        .length === 1
    );
  }, [season.filterOptions.length, material.filterOptions.length]);

  const handleClickSelectedAll = (newCodeId: number) => (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (newCodeId === filterCodeIds.season) {
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
                (selectedSearchOption) => selectedSearchOption.codeId !== newCodeId
              ),
              ...season.filterOptions
            ]
          : selectedSearchOptions.filter(
              (selectedSearchOption) => selectedSearchOption.codeId !== newCodeId
            )
      }));
    } else if (newCodeId === filterCodeIds.material) {
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
                (selectedSearchOption) => selectedSearchOption.codeId !== newCodeId
              ),
              ...material.filterOptions
            ]
          : selectedSearchOptions.filter(
              (selectedSearchOption) => selectedSearchOption.codeId !== newCodeId
            )
      }));
    }
  };

  const handleClick =
    ({
      newCodeId,
      newId,
      newGrouping
    }: {
      newCodeId: number;
      newId: number;
      newGrouping: boolean;
    }) =>
    () => {
      const selectedSearchOption = selectedSearchOptions.find(
        ({ codeId, id }) => codeId === newCodeId && id === newId
      );

      if (selectedSearchOption && newGrouping) {
        setSelectedSearchOptionsState(({ type }) => ({
          type,
          selectedSearchOptions: [
            ...selectedSearchOptions.filter(({ codeId }) => codeId !== newCodeId),
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

        if (newCodeId === filterCodeIds.season) {
          title = 'SEASON';
          selectedFilterOptionIndex = season.filterOptions.findIndex(({ id }) => id === newId);
          selectedFilterOption = season.filterOptions[selectedFilterOptionIndex];
        }
        if (newCodeId === filterCodeIds.material) {
          title = 'EMPTY';
          selectedFilterOptionIndex = material.filterOptions.findIndex(({ id }) => id === newId);
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
      <Box customStyle={{ flex: 1, padding: '0 20px 20px', overflowY: 'auto' }}>
        {season.filterOptions.length > 0 && (
          <FilterAccordion
            title="연식"
            subText={season.filterOptions
              .map(({ count }) => count)
              .reduce((a, b) => a + b, 0)
              .toLocaleString()}
            expand={expand}
            expandIcon={
              season.filterOptions.filter(({ checked }) => checked).length >= 1 ? (
                <Icon name="CheckOutlined" color="primary" />
              ) : undefined
            }
            isActive={season.filterOptions.filter(({ checked }) => checked).length >= 1}
            checkedAll={season.checkedAll}
            onClick={handleClickSelectedAll(filterCodeIds.season)}
          >
            <Grid
              container
              columnGap={8}
              customStyle={{
                padding: '0 12px'
              }}
            >
              {season.filterOptions.map(({ id, codeId, checked, count, name }) => (
                <Grid key={`season-filter-option-${id}`} item xs={2}>
                  <FilterOption
                    checked={season.checkedAll ? false : checked}
                    count={count}
                    onClick={handleClick({
                      newCodeId: codeId,
                      newId: id,
                      newGrouping: season.checkedAll
                    })}
                  >
                    {name}
                  </FilterOption>
                </Grid>
              ))}
            </Grid>
          </FilterAccordion>
        )}
        {material.filterOptions.length > 0 && (
          <FilterAccordion
            title="소재"
            subText={material.filterOptions
              .map(({ count }) => count)
              .reduce((a, b) => a + b, 0)
              .toLocaleString()}
            expand={expand}
            expandIcon={
              material.filterOptions.filter(({ checked }) => checked).length >= 1 ? (
                <Icon name="CheckOutlined" color="primary" />
              ) : undefined
            }
            isActive={material.filterOptions.filter(({ checked }) => checked).length >= 1}
            checkedAll={material.checkedAll}
            onClick={handleClickSelectedAll(filterCodeIds.material)}
          >
            <Grid
              container
              columnGap={8}
              customStyle={{
                padding: '0 12px'
              }}
            >
              {material.filterOptions.map(({ id, codeId, checked, count, name }) => (
                <Grid key={`material-filter-option-${id}`} item xs={2}>
                  <FilterOption
                    checked={material.checkedAll ? false : checked}
                    count={count}
                    onClick={handleClick({
                      newCodeId: codeId,
                      newId: id,
                      newGrouping: material.checkedAll
                    })}
                  >
                    {name}
                  </FilterOption>
                </Grid>
              ))}
            </Grid>
          </FilterAccordion>
        )}
      </Box>
    </Flexbox>
  );
}

export default DetailOptionTabPanel;
