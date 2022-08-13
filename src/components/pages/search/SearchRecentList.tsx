import type { MouseEvent } from 'react';

import { useRecoilState, useResetRecoilState } from 'recoil';
import { Chip, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/common';

import type { RecentItems, TotalSearchItem } from '@typings/search';
import { searchRecentSearchListState } from '@recoil/search';

interface SearchListProps {
  recentSearchList: RecentItems[];
  onClickTotalSearch: (parameter: TotalSearchItem) => void;
  refresh: (parameter: RecentItems[]) => void;
}

function SearchRecentList({ onClickTotalSearch, refresh, recentSearchList }: SearchListProps) {
  const {
    theme: { palette }
  } = useTheme();
  const [savedRecentSearchList, setSavedRecentSearchList] = useRecoilState(
    searchRecentSearchListState
  );
  const resetSavedRecentSearchList = useResetRecoilState(searchRecentSearchListState);

  const handleClickList =
    ({ keyword, expectCount, index }: { keyword: string; expectCount: number; index: number }) =>
    () => {
      logEvent(attrKeys.search.CLICK_RECENT, {
        name: 'SEARCH',
        title: 'RECENT',
        index,
        keyword
      });

      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.productName.SEARCH,
        title: attrProperty.productTitle.RECENT,
        type: attrProperty.productType.INPUT
      });

      onClickTotalSearch({ keyword, title: 'RECENT', expectCount });
    };

  const handleRecentListClear = () => {
    logEvent(attrKeys.search.CLICK_RECENT_DELETE, {
      name: 'SEARCHMODAL',
      att: 'ALL'
    });

    resetSavedRecentSearchList();
    refresh([]);
  };

  const handleDeleteItem = (e: MouseEvent<HTMLOrSVGElement>) => {
    const target = e.currentTarget as HTMLOrSVGElement;

    logEvent(attrKeys.search.CLICK_RECENT_DELETE, {
      name: 'SEARCHMODAL',
      att: 'UNIT',
      keyword: target.dataset.keyword
    });

    const result = savedRecentSearchList.filter((list) => list.keyword !== target.dataset.keyword);
    setSavedRecentSearchList(result);
    refresh(result);
  };

  return (
    <Flexbox component="section" gap={8} direction="vertical" customStyle={{ marginTop: 20 }}>
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        customStyle={{ padding: '0 20px' }}
      >
        <Typography variant="h4" weight="bold">
          최근 검색어
        </Typography>
        <Typography
          variant="body2"
          customStyle={{ color: palette.common.grey['60'] }}
          onClick={handleRecentListClear}
        >
          전체삭제
        </Typography>
      </Flexbox>
      <ul>
        {recentSearchList.map((item, i) => (
          <ItemLi key={`list-${item.keyword}`}>
            <Flexbox
              gap={8}
              alignment="center"
              customStyle={{ width: '100%' }}
              onClick={handleClickList({
                keyword: item.keyword,
                expectCount: item.expectCount || 0,
                index: i + 1
              })}
            >
              <Typography variant="body1">
                <span dangerouslySetInnerHTML={{ __html: item.keyword as string }} />
              </Typography>
              {(item.count as number) > 0 && (
                <Typography variant="small2" customStyle={{ color: palette.common.grey['60'] }}>
                  {commaNumber(Number(item.count))}
                </Typography>
              )}
            </Flexbox>
            <DeleteChip variant="contained">
              <Icon
                width={15}
                name="CloseOutlined"
                customStyle={{ marginLeft: 'auto' }}
                onClick={handleDeleteItem}
                data-keyword={item.keyword}
              />
            </DeleteChip>
          </ItemLi>
        ))}
      </ul>
    </Flexbox>
  );
}

const ItemLi = styled.li`
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DeleteChip = styled(Chip)`
  width: 16px;
  height: 16px;
  padding: 1px;
  background: ${({ theme: { palette } }) => palette.common.grey['80']};
`;

export default SearchRecentList;
