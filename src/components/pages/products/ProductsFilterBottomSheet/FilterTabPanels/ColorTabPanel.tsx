import { useRef } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Grid } from '@mrcamelhub/camel-ui';

import FilterSorter from '@components/pages/products/ProductsFilterBottomSheet/FilterSorter';
import FilterOption from '@components/pages/products/ProductsFilterBottomSheet/FilterOption';

import { logEvent } from '@library/amplitude';

import { filterColors } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  colorFilterOptionsSelector,
  productsFilterActionStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

function ColorTabPanel() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const colors = useRecoilValue(colorFilterOptionsSelector);
  const [{ sortValue }, setProductsFilterActionStateFamily] = useRecoilState(
    productsFilterActionStateFamily(`color-${atomParam}`)
  );
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );

  const scrollElementRef = useRef<HTMLDivElement>(null);

  const handleChange = (value: string) => {
    logEvent(attrKeys.products.selectSort, {
      name: attrProperty.name.filter,
      title: attrProperty.title.color,
      order: value === 'default' ? 'MANY' : 'NAME'
    });
    setProductsFilterActionStateFamily(({ type }) => ({
      type,
      sortValue: value as 'default' | 'asc'
    }));
  };

  const handleClick = (newCodeId: number, newId: number) => () => {
    const selectedSearchOptionIndex = selectedSearchOptions.findIndex(
      ({ codeId, id }) => codeId === newCodeId && id === newId
    );

    if (selectedSearchOptionIndex > -1) {
      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: selectedSearchOptions.filter(
          (_, index) => index !== selectedSearchOptionIndex
        )
      }));
    } else {
      const selectedColorIndex = colors.findIndex(({ id }) => id === newId);
      const selectedColor = colors[selectedColorIndex];

      if (selectedColor) {
        logEvent(attrKeys.products.selectFilter, {
          name: attrProperty.name.productList,
          title: attrProperty.title.site,
          index: selectedColorIndex,
          count: selectedColor.count,
          value: selectedColor.name
        });

        setSelectedSearchOptionsState(({ type }) => ({
          type,
          selectedSearchOptions: selectedSearchOptions.concat(selectedColor)
        }));
      }
    }
  };

  return (
    <Flexbox
      direction="vertical"
      customStyle={{
        height: '100%'
      }}
    >
      <FilterSorter
        options={[
          {
            name: '매물순',
            value: 'default'
          },
          {
            name: '가나다순',
            value: 'asc'
          }
        ]}
        value={sortValue || 'default'}
        onChange={handleChange}
        customStyle={{
          margin: '8px 20px'
        }}
      />
      <Box customStyle={{ flex: 1, padding: '0 20px', overflowY: 'auto' }}>
        <Grid ref={scrollElementRef} container>
          {colors.map(({ id, codeId, checked, count, name, description }) => (
            <Grid key={`color-filter-option-${id}`} item xs={2}>
              <FilterOption
                colorName={description}
                colorCode={filterColors[description as keyof typeof filterColors]}
                checked={checked}
                count={count}
                onClick={handleClick(codeId, id)}
              >
                {name}
              </FilterOption>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Flexbox>
  );
}

export default ColorTabPanel;
