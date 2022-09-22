import { MouseEvent, useEffect, useMemo, useRef } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import { doubleCon } from '@constants/consonant';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { parseWordToConsonant } from '@utils/brands';

import {
  lineFilterOptionsSelector,
  productsFilterActionStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

import FilterSorter from '../FilterSorter';
import FilterOptionNavigation from '../FilterOptionNavigation';
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

  const navigationConsonants = useMemo(
    () =>
      Array.from(new Set(lines.map((line) => parseWordToConsonant(line.name))))
        .filter((consonant) => !doubleCon.includes(consonant))
        .sort((a, b) => a.localeCompare(b)),
    [lines]
  );

  const scrollElementRef = useRef<HTMLDivElement | null>(null);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const dataCodeId = Number(e.currentTarget.getAttribute('data-code-id') || 0);
    const dataId = Number(e.currentTarget.getAttribute('data-id') || 0);

    const selectedSearchOptionIndex = selectedSearchOptions.findIndex(
      ({ codeId, id }) => codeId === dataCodeId && id === dataId
    );

    if (selectedSearchOptionIndex > -1) {
      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: selectedSearchOptions.filter(
          (_, index) => index !== selectedSearchOptionIndex
        )
      }));
    } else {
      const selectedLineIndex = lines.findIndex(({ id }) => id === dataId);
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
            name: '매물 많은 순',
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
          margin: '24px 20px 16px 20px'
        }}
      />
      <Flexbox
        justifyContent="space-between"
        customStyle={{ flex: 1, margin: '0 20px', overflow: 'hidden' }}
      >
        <Box ref={scrollElementRef} customStyle={{ flex: 1, overflowY: 'auto' }}>
          {lines.map(({ id, codeId, consonant, checked, count, name }) => (
            <FilterOption
              key={`line-filter-option-${id}`}
              data-code-id={codeId}
              data-id={id}
              data-consonant={`consonant-${consonant}`}
              checked={checked}
              count={count}
              onClick={handleClick}
            >
              {name}
            </FilterOption>
          ))}
        </Box>
        {sortValue === 'asc' && (
          <FilterOptionNavigation
            scrollElement={scrollElementRef}
            consonants={navigationConsonants}
          />
        )}
      </Flexbox>
    </Flexbox>
  );
}

export default LineTabPanel;
