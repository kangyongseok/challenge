import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Chip, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import { filterCodeIds } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  genderFilterOptionsSelector,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

import FilterAccordion from '../FilterAccordion';

function GenderTabPanel() {
  const {
    theme: { palette }
  } = useTheme();
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const genderFilterOptions = useRecoilValue(genderFilterOptionsSelector);
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );

  const handleClickGender =
    ({
      selectedGender,
      selectedGenderId,
      index,
      count,
      name
    }: {
      selectedGender: string;
      selectedGenderId: number;
      index: number;
      count: number;
      name: string;
    }) =>
    () => {
      if (
        selectedSearchOptions.some(
          ({ codeId, id, gender }) =>
            codeId === filterCodeIds.gender &&
            (id === selectedGenderId || gender === selectedGender)
        )
      ) {
        setSelectedSearchOptionsState(
          ({ type, selectedSearchOptions: prevSelectedSearchOptions }) => ({
            type,
            selectedSearchOptions: prevSelectedSearchOptions.filter(
              ({ codeId, id, gender }) =>
                !(
                  codeId === filterCodeIds.gender &&
                  (id === selectedGenderId || gender === selectedGender)
                )
            )
          })
        );
      } else {
        logEvent(attrKeys.products.selectFilter, {
          name: attrProperty.name.productList,
          title: attrProperty.title.gender,
          index,
          count,
          value: name
        });
        setSelectedSearchOptionsState(
          ({ type, selectedSearchOptions: prevSelectedSearchOptions }) => ({
            type,
            selectedSearchOptions: prevSelectedSearchOptions.concat([
              router.query?.genderIds
                ? {
                    codeId: filterCodeIds.gender,
                    id: selectedGenderId,
                    viewName: name
                  }
                : {
                    codeId: filterCodeIds.gender,
                    gender: selectedGender,
                    viewName: name
                  }
            ])
          })
        );
      }
    };

  return (
    <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
      <Box customStyle={{ flex: 1, overflowY: 'auto' }}>
        {genderFilterOptions.map(({ id, synonyms, name, checked, count }, index) => (
          <FilterAccordion
            key={`gender-filter-option-${id}`}
            summary={name}
            showExpandIcon={false}
            expanded={false}
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            changeInterceptor={() => {}}
            customButton={
              <Chip
                variant={checked ? 'contained' : 'outlined'}
                brandColor={checked ? 'primary' : 'gray'}
                size="xsmall"
                onClick={handleClickGender({
                  selectedGender: synonyms,
                  selectedGenderId: id,
                  index,
                  count,
                  name
                })}
                customStyle={{ marginLeft: 12 }}
              >
                <Typography
                  variant="small2"
                  weight="medium"
                  customStyle={{ color: checked ? palette.common.uiWhite : 'inherit' }}
                >
                  전체선택
                </Typography>
              </Chip>
            }
          />
        ))}
      </Box>
    </Flexbox>
  );
}

export default GenderTabPanel;
