import { useEffect, useRef, useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { Checkbox, Flexbox, Icon } from 'mrcamel-ui';
import { filter, find, isEmpty } from 'lodash-es';
import styled from '@emotion/styled';

import { SearchBar } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchUserSizeSuggest } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import { Kind } from '@typings/user';
import atom from '@recoil/users';
import { showAppDownloadBannerState } from '@recoil/common';

function SizeInputSearch() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchModeType] = useRecoilState(atom.searchModeTypeState);
  const [selectedSizes] = useRecoilState(atom.selectedSizeState);
  const [tempSelected, atomTempSelected] = useRecoilState(atom.tempSelectedState);
  const [searchModeDisabled, atomSearchModeDisabled] = useRecoilState(atom.searchModeDisabledState);
  const { data, refetch } = useQuery(
    queryKeys.users.userSuggest(),
    () => fetchUserSizeSuggest({ sizeType: searchModeType.parentCategoryId, value: searchValue }),
    { enabled: false }
  );
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  useEffect(() => {
    if (selectedSizes) {
      atomTempSelected(selectedSizes);
    }
  }, [selectedSizes, atomTempSelected]);

  useEffect(() => {
    if (searchValue) {
      refetch();
    }
  }, [searchValue, refetch]);

  useEffect(() => {
    data?.forEach((list) => {
      const filterData = filter(tempSelected, {
        kind: searchModeType.kind
      });
      const isChecked = find(filterData, { categorySizeId: list.categorySizeId });
      if (!searchModeDisabled && !!isChecked && searchValue) {
        atomSearchModeDisabled(true);
        return;
      }
      if (isEmpty(searchValue)) atomSearchModeDisabled(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, tempSelected, searchValue]);

  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    setSearchValue((e.target as HTMLInputElement).value);
  };

  const handleClickSize = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    const obj = {
      kind: searchModeType.kind as Kind,
      categorySizeId: Number(target.dataset.sizeId),
      viewSize: target.dataset.viewSize as string
    };

    if (find(tempSelected, { categorySizeId: obj.categorySizeId })) {
      atomTempSelected(tempSelected.filter((size) => size.categorySizeId !== obj.categorySizeId));
    } else {
      logEvent(attrKeys.userInput.SELECT_ITEM, {
        name: 'SIZE',
        title: 'SEARCH',
        att: target.dataset.viewSize
      });
      atomTempSelected((props) => [...props, obj]);
    }
  };

  return (
    <Flexbox direction="vertical">
      <SearchBarArea showAppDownloadBanner={showAppDownloadBanner}>
        <SearchBar
          ref={inputRef}
          fullWidth
          autoFocus
          placeholder="사이즈명"
          onChange={handleChange}
          startAdornment={<Icon name="SearchOutlined" color="black" size="medium" />}
        />
      </SearchBarArea>
      {searchValue && data && data.length > 0 && (
        <SearchListArea gap={21} direction="vertical">
          {data?.map((list) => {
            const filterData = filter(tempSelected, {
              kind: searchModeType.kind
            });
            const isChecked = find(filterData, { categorySizeId: list.categorySizeId });
            return (
              <Flexbox
                gap={8}
                alignment="center"
                key={`search-${list.viewSize}`}
                data-size-id={list.categorySizeId}
                data-view-size={list.viewSize}
                onClick={handleClickSize}
              >
                <Checkbox
                  id={String(list.categorySizeId)}
                  customStyle={{
                    background: isChecked ? 'black' : 'white'
                  }}
                />
                <label htmlFor={String(list.categorySizeId)}>{list.viewSize}</label>
              </Flexbox>
            );
          })}
        </SearchListArea>
      )}
    </Flexbox>
  );
}

const SearchBarArea = styled.div<{ showAppDownloadBanner: boolean }>`
  position: fixed;
  top: ${({ showAppDownloadBanner }) => (showAppDownloadBanner ? 206 : 146)}px;
  left: 0;
  width: 100%;
  padding: 0 20px;
  z-index: 100;
`;

const SearchListArea = styled(Flexbox)`
  width: 100%;
  border: ${({
    theme: {
      palette: { common }
    }
  }) => `1px solid ${common.ui90}`};
  border-top: none;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
  padding: 20px;
  margin-top: 130px;
  font-size: ${({ theme: { typography } }) => typography.body1.size};
  max-height: calc(100vh - 284px);
  overflow: auto;
`;

export default SizeInputSearch;
