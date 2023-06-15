import { useEffect, useRef } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, Grid } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  lineFilterOptionsSelector,
  productsFilterActionStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

import FilterSorter from '../FilterSorter';
import FilterOption from '../FilterOption';

function LineTabPanel() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const lines = useRecoilValue(lineFilterOptionsSelector);
  const [{ sortValue }, setProductsFilterActionStateFamily] = useRecoilState(
    productsFilterActionStateFamily(`line-${atomParam}`)
  );
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );

  const scrollElementRef = useRef<HTMLDivElement>(null);

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
      const selectedLineIndex = lines.findIndex(({ id }) => id === newId);
      const selectedLine = lines[selectedLineIndex];

      if (selectedLine) {
        logEvent(attrKeys.products.selectFilter, {
          name: attrProperty.name.productList,
          title: attrProperty.title.line,
          index: selectedLineIndex,
          count: selectedLine.count,
          value: selectedLine.name
        });

        setSelectedSearchOptionsState(({ type }) => ({
          type,
          selectedSearchOptions: selectedSearchOptions.concat(selectedLine)
        }));
      }
    }
  };

  const handleChange = (value: string) => {
    logEvent(attrKeys.products.selectSort, {
      name: attrProperty.name.filter,
      title: attrProperty.title.line,
      order: value === 'default' ? 'MANY' : 'NAME'
    });
    setProductsFilterActionStateFamily(({ type }) => ({
      type,
      sortValue: value as 'default' | 'asc'
    }));
  };

  useEffect(() => {
    if (scrollElementRef.current) scrollElementRef.current?.scrollTo(0, 0);
  }, [sortValue]);

  return (
    <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
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
      <Flexbox
        justifyContent="space-between"
        customStyle={{ padding: '0 20px', overflowY: 'auto' }}
      >
        <Grid container ref={scrollElementRef}>
          {lines.map(({ id, codeId, consonant, checked, count, name }) => (
            <Grid key={`line-filter-option-${id}`} item xs={2}>
              <FilterOption
                data-consonant={`consonant-${consonant}`}
                checked={checked}
                count={count}
                onClick={handleClick(codeId, id)}
              >
                {name}
              </FilterOption>
            </Grid>
          ))}
        </Grid>
      </Flexbox>
    </Flexbox>
  );
}

export default LineTabPanel;
