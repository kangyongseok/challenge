import type { MouseEvent } from 'react';

import { Chip, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { RECENT_SEARCH_LIST } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import commaNumber from '@utils/commaNumber';

import type { RecentItems, TotalSearchItem } from '@typings/search';

interface SearchListProps {
  recentSearchList: RecentItems[];
  onClick: (parameter: TotalSearchItem) => void;
  refresh: (parameter: RecentItems[]) => void;
}

function SearchRecentList({ onClick, refresh, recentSearchList }: SearchListProps) {
  const {
    theme: { palette }
  } = useTheme();

  const handleClickList = (e: MouseEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement;

    logEvent(attrKeys.search.CLICK_RECENT, {
      name: 'SEARCH',
      title: 'RECENT',
      index: target.dataset.index,
      keyword: target.dataset.keyword
    });

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.productName.SEARCH,
      title: attrProperty.productTitle.RECENT,
      type: attrProperty.productType.INPUT
    });

    onClick({
      keyword: target.dataset.keyword,
      title: 'RECENT',
      expectCount: Number(target.dataset.expectCount)
    });
  };

  const handleRecentListClear = () => {
    logEvent(attrKeys.search.CLICK_RECENT_DELETE, {
      name: 'SEARCHMODAL',
      att: 'ALL'
    });

    LocalStorage.remove(RECENT_SEARCH_LIST);
    refresh([]);
  };

  const handleDeleteItem = (e: MouseEvent<HTMLOrSVGElement>) => {
    const target = e.currentTarget as HTMLOrSVGElement;

    logEvent(attrKeys.search.CLICK_RECENT_DELETE, {
      name: 'SEARCHMODAL',
      att: 'UNIT',
      keyword: target.dataset.keyword
    });

    const recentList = LocalStorage.get(RECENT_SEARCH_LIST) as RecentItems[];
    const result = recentList.filter((list) => list.keyword !== target.dataset.keyword);
    LocalStorage.set(RECENT_SEARCH_LIST, result);
    refresh(result);
  };

  return (
    <>
      <Flexbox alignment="center" justifyContent="space-between" customStyle={{ marginTop: 16 }}>
        <Typography
          variant="h4"
          weight="bold"
          customStyle={{
            marginBottom: 4
          }}
        >
          최근 검색어
        </Typography>
        <Typography
          variant="small2"
          customStyle={{ color: palette.common.grey['60'] }}
          onClick={handleRecentListClear}
        >
          전체삭제
        </Typography>
      </Flexbox>
      <ul>
        {recentSearchList.map((item, i) => (
          /* eslint-disable react/no-danger */
          <ItemLi key={`list-${item.keyword}`}>
            <Flexbox
              gap={8}
              alignment="center"
              customStyle={{ width: '100%' }}
              data-keyword={item.keyword}
              data-expect-count={item.expectCount}
              data-index={i + 1}
              onClick={handleClickList}
            >
              <Typography variant="body1">
                <span dangerouslySetInnerHTML={{ __html: item.keyword as string }} />
              </Typography>
              {(item.count as number) > 0 && (
                <Typography variant="small2" customStyle={{ color: palette.common.grey['60'] }}>
                  ({commaNumber(Number(item.count))})
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
    </>
  );
}

const ItemLi = styled.li`
  height: 45px;
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
